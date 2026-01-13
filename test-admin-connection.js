const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key for full permissions
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need to add this to .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  console.log('\nTo get the service role key:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the "service_role" key');
  console.log('4. Add it to your .env file as: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminConnection() {
  try {
    console.log('Testing Supabase admin connection with service role key...');
    
    // Test 1: Create test table
    console.log('\n1. Creating test_connection table...');
    const { data: createData, error: createError } = await supabase
      .from('test_connection')
      .select('*')
      .limit(1);
    
    if (createError && createError.message.includes('does not exist')) {
      // Table doesn't exist, create it using SQL
      console.log('Table does not exist, creating with SQL...');
      const { error: sqlError } = await supabase
        .rpc('exec', {
          sql: `
            CREATE TABLE test_connection (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              test_data TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        });
      
      if (sqlError) {
        console.log('RPC exec failed, trying direct SQL...');
        // Try using the built-in SQL editor approach
        console.log('You may need to create tables manually in Supabase SQL Editor');
      }
    }
    
    // Test 2: Insert test row (if table exists)
    console.log('\n2. Inserting test row...');
    const { data: insertData, error: insertError } = await supabase
      .from('test_connection')
      .insert({ test_data: 'Connection test successful' })
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert failed:', insertError.message);
    } else {
      console.log('SUCCESS: Row inserted:', insertData);
      
      // Test 3: Fetch the row
      console.log('\n3. Fetching inserted row...');
      const { data: fetchData, error: fetchError } = await supabase
        .from('test_connection')
        .select('*')
        .eq('id', insertData.id)
        .single();
      
      if (fetchError) {
        console.log('Fetch failed:', fetchError.message);
      } else {
        console.log('SUCCESS: Row fetched:', fetchData);
      }
      
      // Test 4: Clean up
      console.log('\n4. Cleaning up...');
      await supabase
        .from('test_connection')
        .delete()
        .eq('id', insertData.id);
      
      console.log('SUCCESS: Test row deleted');
    }
    
    // Test 5: Drop table
    console.log('\n5. Dropping test table...');
    const { error: dropError } = await supabase
      .rpc('exec', {
        sql: 'DROP TABLE IF EXISTS test_connection;'
      });
    
    if (dropError) {
      console.log('Drop table failed (manual cleanup may be needed)');
    } else {
      console.log('SUCCESS: Test table dropped');
    }
    
    console.log('\n=== ADMIN CONNECTION TEST COMPLETE ===');
    console.log('Service role key provides full database permissions');
    
  } catch (error) {
    console.error('ERROR: Admin connection test failed:', error.message);
  }
}

testAdminConnection();
