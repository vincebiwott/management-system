// Dashboard JavaScript for professional UI
let supabase;

// Initialize Supabase
async function initSupabase() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        showToast('Failed to connect to database', 'error');
        return false;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full slide-up`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Load user data
async function loadUserData() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Get user profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Update UI with user data
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) welcomeName.textContent = profile.first_name;
        
        return profile;
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
    }
}

// Load dashboard statistics
async function loadStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get user's department
        const { data: profile } = await supabase
            .from('profiles')
            .select('department_id, role')
            .eq('id', user.id)
            .single();

        let reportsQuery = supabase.from('reports').select('*');
        
        // If not admin/manager, only show department reports
        if (profile.role !== 'admin' && profile.role !== 'manager') {
            reportsQuery = reportsQuery.eq('department_id', profile.department_id);
        }

        const { data: reports, error } = await reportsQuery;
        
        if (error) throw error;

        // Calculate statistics
        const totalReports = reports.length;
        const incidents = reports.filter(r => r.has_incident).length;
        const completed = reports.filter(r => r.status === 'reviewed').length;
        const teamSize = await getTeamSize(profile.department_id);

        // Update UI with animations
        updateStatWithAnimation('total-reports', totalReports);
        updateStatWithAnimation('incidents', incidents);
        updateStatWithAnimation('completed', completed);
        updateStatWithAnimation('team-size', teamSize);

    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load statistics', 'error');
    }
}

// Update stat with animation
function updateStatWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('slide-up');
        element.textContent = value;
    }
}

// Get team size
async function getTeamSize(departmentId) {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', departmentId);

        return error ? 0 : count;
    } catch (error) {
        console.error('Error getting team size:', error);
        return 0;
    }
}

// Load recent reports
async function loadRecentReports() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get user's department
        const { data: profile } = await supabase
            .from('profiles')
            .select('department_id, role')
            .eq('id', user.id)
            .single();

        let reportsQuery = supabase
            .from('reports')
            .select(`
                *,
                departments(name),
                profiles(first_name, last_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // If not admin/manager, only show department reports
        if (profile.role !== 'admin' && profile.role !== 'manager') {
            reportsQuery = reportsQuery.eq('department_id', profile.department_id);
        }

        const { data: reports, error } = await reportsQuery;
        
        if (error) throw error;

        const tableBody = document.getElementById('reports-table');
        if (tableBody) {
            tableBody.innerHTML = '';

            reports.forEach((report, index) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 slide-up';
                row.style.animationDelay = `${index * 0.1}s`;
                
                const statusColor = report.status === 'reviewed' ? 'green' : 
                                   report.status === 'submitted' ? 'blue' : 
                                   report.status === 'action_required' ? 'red' : 'gray';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                            ${report.activities.substring(0, 50)}${report.activities.length > 50 ? '...' : ''}
                        </div>
                        ${report.has_incident ? '<span class="text-xs text-orange-600"><i class="fas fa-exclamation-triangle"></i> Incident</span>' : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${report.departments?.name || 'Unknown'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            ${report.shift}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                            ${report.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewReport('${report.id}')" class="text-green-600 hover:text-green-900 mr-3">View</button>
                        ${report.user_id === user.id ? `<button onclick="editReport('${report.id}')" class="text-blue-600 hover:text-blue-900">Edit</button>` : ''}
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Error loading recent reports:', error);
        showToast('Failed to load reports', 'error');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Failed to sign out', 'error');
    }
}

// Show report form
function showReportForm() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
        loadDepartments();
    }
}

// Show all reports
function showAllReports() {
    showToast('All reports view coming soon!', 'info');
}

// Show incident form
function showIncidentForm() {
    showToast('Incident form feature coming soon!', 'info');
}

// Show team view
function showTeamView() {
    showToast('Team view feature coming soon!', 'info');
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }
}

// Load departments for form
async function loadDepartments() {
    try {
        const { data: departments, error } = await supabase
            .from('departments')
            .select('id, name')
            .order('name');

        if (error) throw error;

        const select = document.getElementById('report-department');
        if (select) {
            select.innerHTML = '<option value="">Select department</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                select.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error loading departments:', error);
        showToast('Failed to load departments', 'error');
    }
}

// Handle report submission
async function handleReportSubmit(event) {
    event.preventDefault();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const report = {
            user_id: user.id,
            department_id: parseInt(document.getElementById('report-department').value),
            shift: document.getElementById('report-shift').value,
            activities: document.getElementById('report-activities').value,
            guest_feedback: document.getElementById('report-feedback').value || null,
            issues: document.getElementById('report-issues').value || null,
            has_incident: document.getElementById('report-incident').checked,
            status: 'submitted'
        };

        const { error } = await supabase
            .from('reports')
            .insert([report]);

        if (error) throw error;

        showToast('Report submitted successfully!', 'success');
        closeModal('report-modal');
        document.getElementById('report-form').reset();
        
        // Refresh data
        loadStats();
        loadRecentReports();

    } catch (error) {
        console.error('Error submitting report:', error);
        showToast('Failed to submit report', 'error');
    }
}

// View report details
function viewReport(reportId) {
    showToast(`Viewing report ${reportId}`, 'info');
}

// Edit report
function editReport(reportId) {
    showToast(`Editing report ${reportId}`, 'info');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    const supabaseReady = await initSupabase();
    if (!supabaseReady) return;

    // Load user data and stats
    await loadUserData();
    await loadStats();
    await loadRecentReports();

    // Set up navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Handle navigation based on data-page attribute
            const page = item.getAttribute('data-page');
            if (page === 'dashboard') {
                loadStats();
                loadRecentReports();
            } else if (page === 'new-report') {
                showReportForm();
            } else if (page === 'all-reports') {
                showAllReports();
            } else {
                showToast(`${page} feature coming soon!`, 'info');
            }
        });
    });

    // Set up form submission
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }

    // Set up periodic refresh
    setInterval(() => {
        loadStats();
        loadRecentReports();
    }, 30000); // Refresh every 30 seconds
});

// Make functions available globally
window.handleLogout = handleLogout;
window.showReportForm = showReportForm;
window.showAllReports = showAllReports;
window.showIncidentForm = showIncidentForm;
window.showTeamView = showTeamView;
window.closeModal = closeModal;
window.viewReport = viewReport;
window.editReport = editReport;
