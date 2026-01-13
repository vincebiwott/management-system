// Comprehensive frontend debugging script
// Run with: node debug-frontend.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('=== COMPREHENSIVE FRONTEND DEBUG ===');

// Test 1: Environment Variables
console.log('\n1. ENVIRONMENT VARIABLES:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ CRITICAL: Missing environment variables!');
  process.exit(1);
}

// Test 2: Supabase Client Creation
console.log('\n2. SUPABASE CLIENT:');
try {
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
  console.log('✅ Supabase client created successfully');
  
  // Test 3: Connection Test
  console.log('\n3. CONNECTION TEST:');
  const connectionTest = async () => {
    try {
      // Test auth endpoint
      console.log('Testing auth endpoint...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log('⚠️ Auth endpoint reachable (expected error):', error.message);
      } else {
        console.log('✅ Auth endpoint working');
      }
      
      // Test database read
      console.log('Testing database read...');
      const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .limit(1);
      
      if (deptError) {
        console.error('❌ Database read failed:', deptError.message);
        console.error('Details:', deptError);
        return false;
      } else {
        console.log('✅ Database read working');
        console.log('Sample data:', depts);
      }
      
      // Test login with invalid credentials (should fail gracefully)
      console.log('Testing login endpoint...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      });
      
      if (loginError) {
        console.log('✅ Login endpoint reachable (expected error):', loginError.message);
      } else {
        console.log('⚠️ Unexpected login success');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      console.error('Type:', error.constructor.name);
      return false;
    }
  };
  
  connectionTest().then(success => {
    if (success) {
      console.log('\n✅ ALL TESTS PASSED - Frontend connection working!');
      console.log('If login still fails, check:');
      console.log('1. CORS settings in Supabase Dashboard');
      console.log('2. Browser console for specific errors');
      console.log('3. Network connectivity');
      console.log('4. React app console logs');
    } else {
      console.log('\n❌ TESTS FAILED - Fix above issues');
    }
  });
  
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message);
}
