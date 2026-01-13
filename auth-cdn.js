// Hotel Operations Authentication System

// Supabase client will be initialized here
let supabase;

// Initialize Supabase after the library loads
async function initSupabase() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        // Check if Supabase is available on window
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
            console.log('Supabase initialized successfully');
            return true;
        } else {
            throw new Error('Supabase library not loaded');
        }
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 5000);
    }
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 5000);
    }
}

// Show specific view and hide others
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('[id$="-view"]').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the requested view
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.remove('hidden');
        view.classList.add('fade-in');
    }
    
    // Clear any error/success messages
    document.querySelectorAll('.alert').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Load departments into select dropdown
async function loadDepartments(selectId = 'department') {
    if (!supabase) {
        console.error('Supabase not initialized');
        return [];
    }
    
    try {
        const { data: departments, error } = await supabase
            .from('departments')
            .select('id, name')
            .order('name');
            
        if (error) throw error;
        
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Select department</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                select.appendChild(option);
            });
        }
        return departments;
    } catch (error) {
        console.error('Error loading departments:', error);
        showError('signup-error', 'Failed to load departments. Please refresh the page.');
        return [];
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    if (!supabase) {
        showError('signup-error', 'Supabase not initialized. Please refresh the page.');
        return;
    }
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const departmentId = document.getElementById('department').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        return showError('signup-error', 'Passwords do not match');
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    department_id: departmentId
                }
            }
        });
        
        if (signUpError) throw signUpError;
        
        // Create user profile in database
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                department_id: departmentId,
                role: 'staff'
            }]);
            
        if (profileError) throw profileError;
        
        showSuccess('signup-success', 'Account created successfully! Please check your email to verify your account.');
        
        // Clear form
        document.getElementById('signup-form').reset();
        
        // Redirect to login after a delay
        setTimeout(() => {
            showView('login');
        }, 3000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showError('signup-error', error.message || 'An error occurred during signup');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    if (!supabase) {
        showError('login-error', 'Supabase not initialized. Please refresh the page.');
        return;
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });
        
        if (error) {
            console.error('Login error:', error);
            showError('login-error', error.message || 'Invalid email or password');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }
        
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (profileError || !profile) {
            showError('login-error', 'User profile not found. Please contact administrator.');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }
        
        // Store session if remember me is checked
        if (rememberMe) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                localStorage.setItem('supabase.auth.token', JSON.stringify(session));
            }
        }
        
        showSuccess('login-success', 'Login successful! Redirecting...');
        
        // Redirect based on role after a short delay
        setTimeout(() => {
            if (profile.role === 'admin') {
                window.location.href = 'dashboard.html';
            } else if (profile.role === 'hod' || profile.role === 'manager') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'An error occurred during login. Please try again.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Handle forgot password
async function handleForgotPassword(event) {
    event.preventDefault();
    
    if (!supabase) {
        showError('forgot-error', 'Supabase not initialized. Please refresh the page.');
        return;
    }
    
    const email = document.getElementById('reset-email').value;
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        
        if (error) throw error;
        
        showSuccess('forgot-success', 'Password reset link sent to your email. Please check your inbox.');
        
        // Clear form
        document.getElementById('forgot-password-form').reset();
        
    } catch (error) {
        showError('forgot-error', error.message || 'Failed to send reset link');
    }
}

// Check authentication state and redirect if needed
async function checkAuth() {
    if (!supabase) return;
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showError('login-error', 'Error checking authentication status');
    }
}

// Initialize the app
async function initApp() {
    // Wait a bit for Supabase to be available
    let attempts = 0;
    while (typeof window.supabase === 'undefined' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    // Initialize Supabase
    const supabaseReady = await initSupabase();
    if (!supabaseReady) return;
    
    // Set up form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        // Load departments for signup form
        loadDepartments('department');
    }
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Check if user is already logged in
    checkAuth();
    
    // Show login view by default if not on dashboard
    if (!window.location.pathname.endsWith('dashboard.html')) {
        showView('login');
    }
}

// Load Supabase library and initialize
function loadSupabase() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initApp;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSupabase);
} else {
    loadSupabase();
}

// Make functions available globally
window.showView = showView;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.loadDepartments = loadDepartments;
