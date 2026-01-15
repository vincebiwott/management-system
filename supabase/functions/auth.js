// Safari Park Hotel - Supabase Auth Functions
// These functions handle authentication and user management

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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
      case 'login':
        return await handleLogin(req, supabaseClient)
      case 'register':
        return await handleRegister(req, supabaseClient)
      case 'profile':
        return await handleProfile(req, supabaseClient, user)
      case 'users':
        return await handleUsers(req, supabaseClient, user)
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

async function handleLogin(req, supabaseClient) {
  const { email, password, role, department } = await req.json()

  // For demo purposes, we'll use a simple authentication method
  // In production, you should use Supabase Auth properly
  
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', role)
    .single()

  if (error || !users) {
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  // In a real app, you would verify the password hash
  // For demo, we'll accept any password that matches the demo pattern
  
  return new Response(
    JSON.stringify({ 
      user: users,
      session: { user: users, expires_at: Date.now() + 3600000 }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRegister(req, supabaseClient) {
  const { email, password, full_name, role, department } = await req.json()

  // Create auth user
  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  // Create user profile
  const { data: userData, error: userError } = await supabaseClient
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      role,
      department,
    })
    .select()
    .single()

  if (userError) throw userError

  return new Response(
    JSON.stringify({ user: userData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleProfile(req, supabaseClient, user) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ user: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'PUT') {
    const updates = await req.json()
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ user: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleUsers(req, supabaseClient, currentUser) {
  // Only admins and general managers can access user management
  if (!['admin', 'general_manager'].includes(currentUser.role)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(
      JSON.stringify({ users: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'POST') {
    const userData = await req.json()
    const { data, error } = await supabaseClient
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ user: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = await req.json()
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ user: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'DELETE') {
    const { id } = await req.json()
    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
