const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Step 1: Create test table
    console.log('Creating test_connection table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS test_connection (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      // Try direct SQL if RPC fails
      console.log('RPC failed, trying direct table operations...');
    }
    
    // Step 2: Insert test row
    console.log('Inserting test row...');
    const { data: insertData, error: insertError } = await supabase
      .from('test_connection')
      .insert({})
      .select()
      .single();
    
    if (insertError) {
      console.error('ERROR: Failed to insert test row:', insertError.message);
      console.error('This might indicate insufficient permissions or table creation failed');
      return;
    }
    
    console.log('SUCCESS: Row inserted:', insertData);
    
    // Step 3: Fetch the row
    console.log('Fetching inserted row...');
    const { data: fetchData, error: fetchError } = await supabase
      .from('test_connection')
      .select('*')
      .eq('id', insertData.id)
      .single();
    
    if (fetchError) {
      console.error('ERROR: Failed to fetch test row:', fetchError.message);
      return;
    }
    
    console.log('SUCCESS: Row fetched:', fetchData);
    
    // Step 4: Clean up - delete the row
    console.log('Cleaning up test row...');
    const { error: deleteError } = await supabase
      .from('test_connection')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('WARNING: Failed to delete test row:', deleteError.message);
    } else {
      console.log('SUCCESS: Test row deleted');
    }
    
    // Step 5: Drop the table
    console.log('Dropping test_connection table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS test_connection;'
    });
    
    if (dropError) {
      console.log('INFO: Could not drop table via RPC (might require admin permissions)');
      console.log('You may need to manually drop the test_connection table in Supabase dashboard');
    } else {
      console.log('SUCCESS: Test table dropped');
    }
    
    console.log('\n=== CONNECTION TEST SUCCESSFUL ===');
    console.log('Supabase integration is working correctly!');
    console.log('Test row data:', fetchData);
    
  } catch (error) {
    console.error('ERROR: Connection test failed:', error.message);
    console.error('\nPossible reasons for failure:');
    console.error('1. Invalid Supabase URL or anon key');
    console.error('2. Network connectivity issues');
    console.error('3. Insufficient database permissions');
    console.error('4. Supabase project not properly configured');
  }
}

testSupabaseConnection();
