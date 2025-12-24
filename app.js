// Supabase is initialized in index.html head section

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

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'eye');
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
    }
    
    // Clear any error/success messages
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

// Check authentication state and redirect if needed
async function checkAuth() {
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

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing in...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });
        
        if (error) {
            console.error('Login error:', error);
            showError('login-error', error.message || 'Invalid email or password');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
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
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'An error occurred during login. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
})();

if (!supabase) {
  console.error('Critical: Supabase initialization failed');
  // Handle the error appropriately for your application
}

// View Management
function showView(viewName) {
    try {
        // Hide all auth cards and views
        const views = document.querySelectorAll('.auth-card');
        if (!views.length) {
            console.error('No auth-card elements found in the DOM');
            return;
        }
        
        views.forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show the requested view
        const viewToShow = document.getElementById(`${viewName}-view`);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
            console.log(`Showing view: ${viewName}`);
        } else {
            console.error(`View not found: ${viewName}-view`);
        }
    } catch (error) {
        console.error('Error in showView:', error);
    }
}

// Toggle password visibility
window.togglePassword = function(inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const icon = input.nextElementSibling?.querySelector('i');
        if (!icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
};

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

// Load departments into select dropdown
async function loadDepartments(selectId = 'department') {
    try {
        const { data: departments, error } = await supabase
            .from('departments')
            .select('id, name, hod_email')
            .order('name');
            
        if (error) throw error;
        
        const select = document.getElementById(selectId);
        if (select) {
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add departments to select
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.hod_email === supabase.auth.user()?.email 
                    ? `${dept.name} (You are HOD)` 
                    : dept.hod_email 
                        ? `${dept.name} (HOD: ${dept.hod_email})`
                        : dept.name;
                select.appendChild(option);
            });
        }
        return departments;
    } catch (error) {
        console.error('Error loading departments:', error);
        showError('error-message', 'Failed to load departments. Please refresh the page.');
        return [];
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
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
    
    try {
        // Get department details
        const { data: department, error: deptError } = await supabase
            .from('departments')
            .select('id, name, hod_email')
            .eq('id', departmentId)
            .single();
            
        if (deptError) throw deptError;
        
        // Check if this email is the designated HOD for the department
        const isHOD = department.hod_email === email;
        
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
        
        // Create user profile with appropriate role
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                department_id: departmentId,
                role: isHOD ? 'manager' : 'staff'
            }]);
            
        if (profileError) throw profileError;
        
        // If this is the HOD, update the department record
        if (isHOD) {
            const { error: updateError } = await supabase
                .from('departments')
                .update({ 
                    hod_id: authData.user.id,
                    hod_email: email
                })
                .eq('id', departmentId);
                
            if (updateError) throw updateError;
        }
        
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
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        
        // Store session if remember me is checked
        if (rememberMe) {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData.session));
        }
        
        // Redirect to dashboard on successful login
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError('login-error', error.message || 'Invalid email or password');
    }
}

// Handle forgot password
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
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

// Check if user is already logged in
async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

// Function to send query to HOD
async function sendQueryToHOD(query, departmentId) {
    try {
        const { data: department, error } = await supabase
            .rpc('get_department_hod', { department_id: departmentId })
            .single();
            
        if (error) throw error;
        
        if (!department.hod_id) {
            throw new Error('No HOD assigned to this department');
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error: messageError } = await supabase
            .from('messages')
            .insert([{
                sender_id: user.id,
                receiver_id: department.hod_id,
                department_id: departmentId,
                content: query,
                status: 'unread'
            }]);
            
        if (messageError) throw messageError;
        
        return { success: true, message: 'Query has been sent to the HOD' };
    } catch (error) {
        console.error('Error sending query to HOD:', error);
        return { success: false, error: error.message };
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Set up form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const queryForm = document.getElementById('query-form');
    
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
    
    // Handle query form submission
    if (queryForm) {
        // Load departments for query form
        await loadDepartments('query-department');
        
        queryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = document.getElementById('query-input').value;
            const departmentId = document.getElementById('query-department').value;
            
            const result = await sendQueryToHOD(query, departmentId);
            if (result.success) {
                showSuccess('query-status', result.message);
                queryForm.reset();
            } else {
                showError('query-status', result.error);
            }
        });
    }
    
    // Check if user is already logged in
    checkAuth();
    
    // Show login view by default if not on dashboard
    if (!window.location.pathname.endsWith('dashboard.html')) {
        showView('login');
    }
});

// Make functions available globally
window.showView = showView;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.loadDepartments = loadDepartments;
window.sendQueryToHOD = sendQueryToHOD;

// Initialize database schema
async function initializeDatabase() {
    try {
        // Create departments table
        const { data: departments, error: deptError } = await supabase
            .from('departments')
            .select('*')
            .limit(1);

        if (deptError || !departments) {
            const { error: createDeptError } = await supabase
                .from('departments')
                .insert([
                    { id: 1, name: 'Guest Relations Office (GRO)' },
                    { id: 2, name: 'Concierge' },
                    { id: 3, name: 'Reservations' },
                    { id: 4, name: 'Switchboard' }
                ]);
            
            if (createDeptError) {
                console.error('Error creating departments:', createDeptError);
            }
        }

        // Create reports table if not exists
        const { data: reports, error: reportsError } = await supabase
            .from('reports')
            .select('*')
            .limit(1);

        if (reportsError && reportsError.code === '42P01') { // Table doesn't exist
            const { data, error } = await supabase.rpc('create_reports_table');
            if (error) {
                console.error('Error creating reports table:', error);
            }
        }

        // Enable Row Level Security (RLS) and set up policies
        await setupRowLevelSecurity();

    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Setup Row Level Security
async function setupRowLevelSecurity() {
    // Enable RLS on reports table
    const { error: rlsError } = await supabase.rpc('enable_rls_on_reports');
    if (rlsError) {
        console.error('Error enabling RLS:', rlsError);
    }
}

// Call initialize when the app loads
initializeDatabase();

// DOM Elements
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');

// Auth Functions
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        
        // Redirect to dashboard on successful login
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        showError('login-error', error.message);
    }
}

// Handle Signup
async function handleSignup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const department = document.getElementById('department').value;
    
    try {
        // Validate passwords match
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        // Create user in Supabase Auth
        const { user, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    department: department
                }
            }
        });
        
        if (signUpError) throw signUpError;
        
        // Create user profile in the database
        const { data, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: user.id,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    department,
                    role: 'staff' // Default role
                }
            ]);
            
        if (profileError) throw profileError;
        
        showSuccess('signup-success', 'Account created successfully! Please check your email to verify your account.');
        
        // Clear form
        document.getElementById('signup-form').reset();
        
        // Redirect to login after 3 seconds
        setTimeout(() => showView('login'), 3000);
        
    } catch (error) {
        showError('signup-error', error.message);
    }
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = document.getElementById('reset-email').value;
    
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`,
        });
        
        if (error) throw error;
        
        showSuccess('forgot-success', 'Password reset link sent to your email!');
        document.getElementById('forgot-password-form').reset();
        
    } catch (error) {
        showError('forgot-error', error.message);
    }
}

// Dashboard Functions
async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Simple dashboard HTML
    dashboardView.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">Welcome, ${user.email}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="showReportForm()" class="bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition">
                    Submit Today's Report
                </button>
                <button onclick="viewReports()" class="bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition">
                    View Reports
                </button>
            </div>
        </div>
    `;
}

function showReportForm() {
    dashboardView.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">Submit Daily Report</h2>
            <form onsubmit="submitReport(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <select id="department" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">Select Department</option>
                        <option value="GRO">Guest Relations Office (GRO)</option>
                        <option value="Concierge">Concierge</option>
                        <option value="Reservations">Reservations</option>
                        <option value="Switchboard">Switchboard</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Shift</label>
                    <select id="shift" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Key Activities</label>
                    <textarea id="activities" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required></textarea>
                </div>
                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="hasIncident" class="rounded border-gray-300 text-green-600 shadow-sm">
                        <span class="ml-2 text-sm text-gray-700">Report an incident</span>
                    </label>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="loadDashboard()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function submitReport(event) {
    event.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const report = {
        department: document.getElementById('department').value,
        shift: document.getElementById('shift').value,
        activities: document.getElementById('activities').value,
        has_incident: document.getElementById('hasIncident').checked,
        status: 'draft',
        user_id: user.id,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('reports')
        .insert([report])
        .select();

    if (error) {
        alert('Error submitting report: ' + error.message);
        return;
    }

    alert('Report submitted successfully!');
    loadDashboard();
}

async function viewReports() {
    const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert('Error loading reports: ' + error.message);
        return;
    }

    const reportsHtml = reports.map(report => `
        <div class="border rounded-lg p-4 mb-4 ${report.has_incident ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}">
            <div class="flex justify-between items-start">
                <h3 class="font-medium">${report.department} - ${report.shift} Shift</h3>
                <span class="text-sm text-gray-500">${new Date(report.created_at).toLocaleString()}</span>
            </div>
            ${report.has_incident ? '<span class="inline-block mt-1 px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Incident</span>' : ''}
            <p class="mt-2 text-gray-700">${report.activities}</p>
        </div>
    `).join('');

    dashboardView.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Reports</h2>
                <button onclick="loadDashboard()" class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">
                    Back to Dashboard
                </button>
            </div>
            <div class="mt-4">
                ${reports.length > 0 ? reportsHtml : '<p class="text-gray-500">No reports found.</p>'}
            </div>
        </div>
    `;
}

// Check if user is already logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is logged in, redirect to dashboard
    if (user) {
        window.location.href = 'dashboard.html';
    } else {
        // Show login view by default
        showView('login');
    }
}

// Initialize the app
checkAuth();
