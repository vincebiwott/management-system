// Safari Park Hotel - Supabase Reports Functions
// These functions handle report management and analytics

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError) throw authError

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'list':
        return await handleListReports(req, supabaseClient, user)
      case 'create':
        return await handleCreateReport(req, supabaseClient, user)
      case 'update':
        return await handleUpdateReport(req, supabaseClient, user)
      case 'delete':
        return await handleDeleteReport(req, supabaseClient, user)
      case 'analytics':
        return await handleAnalytics(req, supabaseClient, user)
      case 'summary':
        return await handleDepartmentSummary(req, supabaseClient, user)
      default:
        return new Response(
          JSON.stringify({ error: 'Function not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function handleListReports(req, supabaseClient, user) {
  const url = new URL(req.url)
  const department = url.searchParams.get('department')
  const status = url.searchParams.get('status')
  const date = url.searchParams.get('date')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabaseClient
    .from('reports')
    .select(`
      *,
      user:users(full_name, role, department)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters based on user role
  if (user.role === 'staff') {
    query = query.eq('user_id', user.id)
  } else if (user.role === 'department_head') {
    query = query.eq('department', user.department)
  }

  // Apply additional filters
  if (department) query = query.eq('department', department)
  if (status) query = query.eq('status', status)
  if (date) query = query.eq('report_date', date)

  const { data, error } = await query

  if (error) throw error

  return new Response(
    JSON.stringify({ reports: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateReport(req, supabaseClient, user) {
  const reportData = await req.json()
  
  const { data, error } = await supabaseClient
    .from('reports')
    .insert({
      ...reportData,
      user_id: user.id,
      department: user.department || reportData.department,
    })
    .select(`
      *,
      user:users(full_name, role, department)
    `)
    .single()

  if (error) throw error

  return new Response(
    JSON.stringify({ report: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateReport(req, supabaseClient, user) {
  const { id, ...updates } = await req.json()

  // Check permissions
  if (user.role === 'staff') {
    // Staff can only update their own reports and only certain fields
    const { data: existingReport } = await supabaseClient
      .from('reports')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingReport || existingReport.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Staff can only update content, not status or review fields
    const allowedFields = ['content']
    const filteredUpdates = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    const { data, error } = await supabaseClient
      .from('reports')
      .update(filteredUpdates)
      .eq('id', id)
      .select(`
        *,
        user:users(full_name, role, department)
      `)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ report: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (user.role === 'department_head') {
    // Department heads can update status and review notes for their department
    const { data: existingReport } = await supabaseClient
      .from('reports')
      .select('department')
      .eq('id', id)
      .single()

    if (!existingReport || existingReport.department !== user.department) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const allowedFields = ['status', 'review_notes', 'reviewed_by', 'reviewed_at']
    const filteredUpdates = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    if (filteredUpdates.status && filteredUpdates.status !== existingReport.status) {
      filteredUpdates.reviewed_by = user.id
      filteredUpdates.reviewed_at = new Date().toISOString()
    }

    const { data, error } = await supabaseClient
      .from('reports')
      .update(filteredUpdates)
      .eq('id', id)
      .select(`
        *,
        user:users(full_name, role, department)
      `)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ report: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    // General managers and admins can update any field
    const { data, error } = await supabaseClient
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users(full_name, role, department)
      `)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ report: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleDeleteReport(req, supabaseClient, user) {
  const { id } = await req.json()

  // Only admins and general managers can delete reports
  if (!['admin', 'general_manager'].includes(user.role)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  const { error } = await supabaseClient
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAnalytics(req, supabaseClient, user) {
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'week'
  const department = url.searchParams.get('department')

  let dateFilter = ''
  switch (period) {
    case 'week':
      dateFilter = 'created_at >= now() - interval \'7 days\''
      break
    case 'month':
      dateFilter = 'created_at >= now() - interval \'30 days\''
      break
    case 'year':
      dateFilter = 'created_at >= now() - interval \'365 days\''
      break
  }

  let query = `
    SELECT 
      department,
      COUNT(*) as total_reports,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_reports,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_reports,
      COUNT(*) FILTER (WHERE report_date = CURRENT_DATE) as today_reports,
      AVG(
        CASE 
          WHEN status = 'approved' THEN 1 
          WHEN status = 'reviewed' THEN 0.8 
          WHEN status = 'pending' THEN 0.5 
          ELSE 0 
        END
      ) * 100 as performance_score
    FROM reports
    WHERE ${dateFilter}
  `

  if (department) {
    query += ` AND department = '${department}'`
  }

  if (user.role === 'staff') {
    query += ` AND user_id = '${user.id}'`
  } else if (user.role === 'department_head') {
    query += ` AND department = '${user.department}'`
  }

  query += ' GROUP BY department'

  const { data, error } = await supabaseClient
    .rpc('execute_sql', { sql_query: query })

  if (error) {
    // Fallback to individual queries if RPC doesn't exist
    let baseQuery = supabaseClient.from('reports').select('*')

    if (dateFilter) {
      const startDate = new Date()
      if (period === 'week') startDate.setDate(startDate.getDate() - 7)
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1)
      else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)

      baseQuery = baseQuery.gte('created_at', startDate.toISOString())
    }

    if (user.role === 'staff') {
      baseQuery = baseQuery.eq('user_id', user.id)
    } else if (user.role === 'department_head') {
      baseQuery = baseQuery.eq('department', user.department)
    }

    if (department) {
      baseQuery = baseQuery.eq('department', department)
    }

    const { data: reports, error: reportsError } = await baseQuery

    if (reportsError) throw reportsError

    // Calculate analytics manually
    const analytics = reports.reduce((acc, report) => {
      if (!acc[report.department]) {
        acc[report.department] = {
          department: report.department,
          total_reports: 0,
          pending_reports: 0,
          approved_reports: 0,
          reviewed_reports: 0,
          today_reports: 0,
          performance_score: 0
        }
      }

      const dept = acc[report.department]
      dept.total_reports++
      
      if (report.status === 'pending') dept.pending_reports++
      else if (report.status === 'approved') dept.approved_reports++
      else if (report.status === 'reviewed') dept.reviewed_reports++

      if (report.report_date === new Date().toISOString().split('T')[0]) {
        dept.today_reports++
      }

      return acc
    }, {})

    // Calculate performance scores
    Object.values(analytics).forEach(dept => {
      const score = (dept.approved_reports * 1 + dept.reviewed_reports * 0.8 + dept.pending_reports * 0.5) / dept.total_reports
      dept.performance_score = Math.round(score * 100)
    })

    return new Response(
      JSON.stringify({ analytics: Object.values(analytics) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ analytics: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDepartmentSummary(req, supabaseClient, user) {
  const url = new URL(req.url)
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

  if (user.role !== 'department_head' && !['general_manager', 'admin'].includes(user.role)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  let department = user.department
  if (['general_manager', 'admin'].includes(user.role)) {
    department = url.searchParams.get('department')
    if (!department) {
      return new Response(
        JSON.stringify({ error: 'Department parameter required for management roles' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
  }

  // Get or create department summary
  const { data: existingSummary, error: summaryError } = await supabaseClient
    .from('department_summaries')
    .select('*')
    .eq('department', department)
    .eq('summary_date', date)
    .single()

  if (summaryError && summaryError.code !== 'PGRST116') {
    throw summaryError
  }

  if (existingSummary) {
    return new Response(
      JSON.stringify({ summary: existingSummary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate new summary
  const { data: reports, error: reportsError } = await supabaseClient
    .from('reports')
    .select('*')
    .eq('department', department)
    .eq('report_date', date)

  if (reportsError) throw reportsError

  const { data: staff, error: staffError } = await supabaseClient
    .from('users')
    .select('*')
    .eq('department', department)
    .eq('status', 'active')

  if (staffError) throw staffError

  const summaryData = {
    department,
    summary_date: date,
    department_head_id: user.id,
    summary_data: {
      reports_breakdown: reports.map(r => ({
        user_id: r.user_id,
        user_name: staff.find(s => s.id === r.user_id)?.full_name || 'Unknown',
        status: r.status,
        content: r.content
      }))
    },
    total_reports: reports.length,
    staff_present: staff.length,
    issues_resolved: reports.reduce((total, report) => {
      return total + (report.content.department_data?.guest_issues_resolved || 0)
    }, 0),
    pending_actions: reports.filter(r => r.status === 'pending').length
  }

  const { data: newSummary, error: createError } = await supabaseClient
    .from('department_summaries')
    .insert(summaryData)
    .select()
    .single()

  if (createError) throw createError

  return new Response(
    JSON.stringify({ summary: newSummary }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
