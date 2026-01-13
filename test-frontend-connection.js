// Test frontend connection to Supabase
// Run this with: node test-frontend-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Frontend Connection Test ===');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test 1: Try to connect to auth
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠️ Auth error (expected):', error.message);
    } else {
      console.log('✅ Auth connection working');
    }
    
    // Test 2: Try to read from departments
    console.log('\n2. Testing database read...');
    const { data: depts, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);
    
    if (deptError) {
      console.error('❌ Database read failed:', deptError.message);
      console.error('Details:', deptError);
    } else {
      console.log('✅ Database read working');
      console.log('Sample data:', depts);
    }
    
    // Test 3: Test login functionality
    console.log('\n3. Testing login endpoint...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // This will fail but tests the endpoint
      password: 'test'
    });
    
    if (signInError) {
      console.log('✅ Login endpoint reachable (auth error expected):', signInError.message);
    } else {
      console.log('✅ Login endpoint working');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('This might be a network or CORS issue');
  }
}

testFrontendConnection();
