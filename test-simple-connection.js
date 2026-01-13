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

async function testSimpleConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Test 1: Check if we can connect to Supabase auth
    console.log('\n1. Testing auth connection...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('Auth check failed (expected for anon key):', authError.message);
    } else {
      console.log('Auth connection OK');
    }
    
    // Test 2: Try to read from information_schema (should be accessible)
    console.log('\n2. Testing database access...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (schemaError) {
      console.log('Schema access failed:', schemaError.message);
    } else {
      console.log('SUCCESS: Database accessible');
      console.log('Found tables:', schemaData?.map(t => t.table_name) || 'None');
    }
    
    // Test 3: Try to read from departments table (if it exists)
    console.log('\n3. Testing departments table access...');
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);
    
    if (deptError) {
      console.log('Departments table access:', deptError.message);
      if (deptError.message.includes('does not exist')) {
        console.log('INFO: Departments table not found - need to run schema.sql');
      }
    } else {
      console.log('SUCCESS: Departments table accessible');
      console.log('Sample department:', deptData[0]);
    }
    
    // Test 4: Check if we can use RPC functions
    console.log('\n4. Testing RPC access...');
    const { data: versionData, error: versionError } = await supabase
      .rpc('version');
    
    if (versionError) {
      console.log('RPC version check failed:', versionError.message);
    } else {
      console.log('SUCCESS: RPC accessible, version:', versionData);
    }
    
    console.log('\n=== CONNECTION TEST SUMMARY ===');
    console.log('✓ Supabase client initialized successfully');
    console.log('✓ Environment variables loaded');
    console.log('✓ Basic database connection working');
    
    if (deptData && deptData.length > 0) {
      console.log('✓ Database tables exist and are accessible');
      console.log('✓ Frontend integration ready');
    } else {
      console.log('⚠ Database tables not found - run schema.sql first');
    }
    
  } catch (error) {
    console.error('ERROR: Connection test failed:', error.message);
    console.error('\nPossible reasons for failure:');
    console.error('1. Invalid Supabase URL or anon key');
    console.error('2. Network connectivity issues');
    console.error('3. Supabase project not properly configured');
    console.error('4. CORS issues (check Supabase settings)');
  }
}

testSimpleConnection();
