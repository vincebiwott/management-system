// Test the exact login flow used by React app
// Run with: node test-login-flow.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('=== TESTING LOGIN FLOW ===');

// Create client exactly like React app
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

async function testLoginFlow() {
  try {
    console.log('\n1. Testing with valid credentials...');
    console.log('URL:', process.env.VITE_SUPABASE_URL);
    console.log('Anon Key:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    
    // First, let's check if we can read users (for testing)
    console.log('\n2. Checking if any users exist...');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.log('⚠️ Cannot list users (expected - anon key):', userError.message);
    }
    
    // Test with sample credentials (this will fail but should not be "fetch failed")
    console.log('\n3. Testing login endpoint...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    if (error) {
      console.log('✅ Login endpoint reached (expected error):', error.message);
      console.log('Error type:', error.constructor.name);
      
      if (error.message.includes('fetch')) {
        console.error('❌ FETCH ERROR - This is the problem!');
        console.error('Causes: CORS, network, or Supabase URL issue');
      } else {
        console.log('✅ Normal auth error (credentials invalid)');
      }
    } else {
      console.log('⚠️ Unexpected login success');
    }
    
    // Test database read
    console.log('\n4. Testing database access...');
    const { data: depts, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);
    
    if (deptError) {
      console.error('❌ Database access failed:', deptError.message);
    } else {
      console.log('✅ Database access working');
    }
    
    console.log('\n=== DIAGNOSIS ===');
    console.log('If you see "fetch failed" above, the issue is:');
    console.log('1. CORS - Check Supabase Dashboard → Settings → API → CORS');
    console.log('2. Network - Check internet connection');
    console.log('3. Supabase URL - Verify project URL is correct');
    console.log('4. Browser - Check browser console for specific errors');
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    console.error('Type:', error.constructor.name);
    console.error('Stack:', error.stack);
  }
}

testLoginFlow();
