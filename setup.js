// Run this script once to set up the database schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('Starting database setup...');

  try {
    // Create departments table
    console.log('Creating departments table...');
    const { error: deptError } = await supabase.rpc('create_departments_table');
    
    if (deptError && !deptError.message.includes('already exists')) {
      throw deptError;
    }

    // Create reports table
    console.log('Creating reports table...');
    const { error: reportsError } = await supabase.rpc('create_reports_table');
    
    if (reportsError && !reportsError.message.includes('already exists')) {
      throw reportsError;
    }

    // Create SQL functions and policies
    console.log('Setting up RLS and policies...');
    await setupPolicies();

    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

async function setupPolicies() {
  // Enable Row Level Security on reports
  await supabase.rpc('enable_rls_on_reports');

  // Create policies
  const policies = [
    // Users can view their own reports
    `
    create policy "Users can view their own reports"
    on reports for select
    using (auth.uid() = user_id);
    `,
    
    // Users can insert their own reports
    `
    create policy "Users can insert their own reports"
    on reports for insert
    with check (auth.uid() = user_id);
    `,
    
    // Supervisors can view all reports
    `
    create policy "Supervisors can view all reports"
    on reports for select
    using (
      exists (
        select 1 from auth.users
        where id = auth.uid() 
        and raw_user_meta_data->>'role' = 'supervisor'
      )
    );
    `
  ];

  for (const policy of policies) {
    const { error } = await supabase.rpc('execute_sql', { query: policy });
    if (error && !error.message.includes('already exists')) {
      console.warn('Warning creating policy:', error.message);
    }
  }
}

setupDatabase();
