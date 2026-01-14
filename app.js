// Safari Park Hotel Daily Reporting System - Main JavaScript

class HotelReportingSystem {
    constructor() {
        this.currentUser = null;
        this.reports = [];
        this.users = [];
        this.charts = {};
        this.currentPage = 'dashboard';
        
        // Demo data for development
        this.demoUsers = [
            {
                id: 1,
                email: 'staff@guest.com',
                password: '123456',
                name: 'John Smith',
                role: 'staff',
                department: 'guest_relations',
                status: 'active'
            },
            {
                id: 2,
                email: 'hod@guest.com',
                password: '123456',
                name: 'Sarah Johnson',
                role: 'department_head',
                department: 'guest_relations',
                status: 'active'
            },
            {
                id: 3,
                email: 'gm@hotel.com',
                password: '123456',
                name: 'Michael Chen',
                role: 'general_manager',
                department: 'management',
                status: 'active'
            },
            {
                id: 4,
                email: 'admin@hotel.com',
                password: '123456',
                name: 'Admin User',
                role: 'admin',
                department: 'administration',
                status: 'active'
            }
        ];
        
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.initializeDemoData();
        this.showScreen('login');
    }

    // Local Storage Management
    loadFromLocalStorage() {
        const savedReports = localStorage.getItem('hotelReports');
        const savedUsers = localStorage.getItem('hotelUsers');
        
        if (savedReports) {
            this.reports = JSON.parse(savedReports);
        }
        
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        } else {
            this.users = this.demoUsers;
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('hotelReports', JSON.stringify(this.reports));
        localStorage.setItem('hotelUsers', JSON.stringify(this.users));
    }

    // Demo Data Initialization
    initializeDemoData() {
        if (this.reports.length === 0) {
            this.reports = this.generateDemoReports();
            this.saveToLocalStorage();
        }
    }

    generateDemoReports() {
        const departments = ['guest_relations', 'concierge', 'cashier', 'switchboard'];
        const statuses = ['pending', 'reviewed', 'approved'];
        const demoReports = [];
        
        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            
            demoReports.push({
                id: Date.now() + i,
                userId: Math.floor(Math.random() * 4) + 1,
                department: departments[Math.floor(Math.random() * departments.length)],
                date: date.toISOString().split('T')[0],
                shift: ['morning', 'afternoon', 'night'][Math.floor(Math.random() * 3)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                content: {
                    challenges: 'Guest complaint about room service timing',
                    achievements: 'Successfully resolved 5 guest issues',
                    notes: 'Shift went smoothly overall'
                },
                createdAt: date.toISOString()
            });
        }
        
        return demoReports;
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Role selection change
        document.getElementById('role').addEventListener('change', (e) => {
            this.toggleDepartmentField(e.target.value);
        });

        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateToPage(page);
                
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Report form
        document.getElementById('reportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Filters
        document.getElementById('searchReports').addEventListener('input', () => this.filterReports());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterReports());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterReports());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // Authentication
    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const department = document.getElementById('department').value;

        // Find user in demo data
        const user = this.users.find(u => 
            u.email === email && 
            u.password === password && 
            u.role === role
        );

        if (user) {
            this.currentUser = { ...user };
            if (department && role === 'staff') {
                this.currentUser.department = department;
            }
            
            this.showScreen('dashboard');
            this.setupUserInterface();
            this.showToast('Login successful!', 'success');
        } else {
            this.showToast('Invalid credentials. Please try again.', 'error');
        }
    }

    toggleDepartmentField(role) {
        const departmentGroup = document.getElementById('departmentGroup');
        departmentGroup.style.display = role === 'staff' ? 'block' : 'none';
    }

    logout() {
        this.currentUser = null;
        this.showScreen('login');
        document.getElementById('loginForm').reset();
        this.showToast('Logged out successfully', 'success');
    }

    // Screen Management
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (screenName === 'login') {
            document.getElementById('loginScreen').classList.add('active');
        } else {
            document.getElementById('dashboardScreen').classList.add('active');
        }
    }

    // User Interface Setup
    setupUserInterface() {
        if (!this.currentUser) return;

        // Update user info in navbar
        document.getElementById('currentUser').textContent = this.currentUser.name;
        document.getElementById('currentUserRole').textContent = this.formatRole(this.currentUser.role);

        // Show/hide menu sections based on role
        const managementSection = document.getElementById('managementSection');
        const adminSection = document.getElementById('adminSection');

        if (this.currentUser.role === 'department_head' || this.currentUser.role === 'general_manager' || this.currentUser.role === 'admin') {
            managementSection.style.display = 'block';
        }

        if (this.currentUser.role === 'admin') {
            adminSection.style.display = 'block';
        }

        // Load initial data
        this.loadDashboardData();
        this.initializeCharts();
    }

    formatRole(role) {
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Navigation
    navigateToPage(pageName) {
        this.currentPage = pageName;
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(pageName + 'Page').classList.add('active');
        
        // Load page-specific data
        this.loadPageData(pageName);
    }

    loadPageData(pageName) {
        switch(pageName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'staff-management':
                this.loadStaffManagementData();
                break;
            case 'department-summary':
                this.loadDepartmentSummaryData();
                break;
            case 'user-management':
                this.loadUserManagementData();
                break;
            case 'system-settings':
                this.loadSystemSettings();
                break;
        }
    }

    // Dashboard Data
    loadDashboardData() {
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.updateCharts();
    }

    updateDashboardStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayReports = this.reports.filter(r => r.date === today);
        const pendingReports = this.reports.filter(r => r.status === 'pending');
        const completedReports = this.reports.filter(r => r.status === 'approved');
        
        document.getElementById('todayReports').textContent = todayReports.length;
        document.getElementById('pendingReports').textContent = pendingReports.length;
        document.getElementById('completedReports').textContent = completedReports.length;
        document.getElementById('satisfactionRate').textContent = '92%';
    }

    loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        const recentReports = this.reports
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        activityList.innerHTML = '';

        recentReports.forEach(report => {
            const user = this.users.find(u => u.id === report.userId);
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${this.getDepartmentIcon(report.department)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">
                        ${user ? user.name : 'Unknown'} submitted ${report.department} report
                    </div>
                    <div class="activity-time">
                        ${this.formatDate(report.createdAt)}
                    </div>
                </div>
            `;
            activityList.appendChild(activityItem);
        });

        if (recentReports.length === 0) {
            activityList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recent activity</p>';
        }
    }

    getDepartmentIcon(department) {
        const icons = {
            guest_relations: 'fa-users',
            concierge: 'fa-bell-concierge',
            cashier: 'fa-cash-register',
            switchboard: 'fa-phone'
        };
        return icons[department] || 'fa-file-alt';
    }

    // Reports Management
    loadReportsData() {
        this.displayReports();
    }

    displayReports(reports = this.reports) {
        const reportsGrid = document.getElementById('reportsGrid');
        reportsGrid.innerHTML = '';

        const userReports = this.getUserReports(reports);
        const sortedReports = userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (sortedReports.length === 0) {
            reportsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No reports found</p>';
            return;
        }

        sortedReports.forEach(report => {
            const user = this.users.find(u => u.id === report.userId);
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
            reportCard.innerHTML = `
                <div class="report-header">
                    <div class="report-title">${this.formatDepartment(report.department)} Report</div>
                    <div class="report-status status-${report.status}">${this.formatStatus(report.status)}</div>
                </div>
                <div class="report-details">
                    <p><strong>Submitted by:</strong> ${user ? user.name : 'Unknown'}</p>
                    <p><strong>Date:</strong> ${this.formatDate(report.date)}</p>
                    <p><strong>Shift:</strong> ${this.formatShift(report.shift)}</p>
                    ${report.content.challenges ? `<p><strong>Challenges:</strong> ${report.content.challenges}</p>` : ''}
                    ${report.content.achievements ? `<p><strong>Achievements:</strong> ${report.content.achievements}</p>` : ''}
                </div>
            `;
            reportCard.addEventListener('click', () => this.viewReportDetails(report));
            reportsGrid.appendChild(reportCard);
        });
    }

    getUserReports(reports) {
        if (!this.currentUser) return reports;

        switch(this.currentUser.role) {
            case 'staff':
                return reports.filter(r => r.userId === this.currentUser.id);
            case 'department_head':
                return reports.filter(r => r.department === this.currentUser.department);
            case 'general_manager':
            case 'admin':
                return reports;
            default:
                return reports;
        }
    }

    filterReports() {
        const searchTerm = document.getElementById('searchReports').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let filtered = this.reports;

        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.department.toLowerCase().includes(searchTerm) ||
                r.content.challenges.toLowerCase().includes(searchTerm) ||
                r.content.achievements.toLowerCase().includes(searchTerm)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(r => r.date === dateFilter);
        }

        this.displayReports(filtered);
    }

    // Report Modal
    openReportModal() {
        const modal = document.getElementById('reportModal');
        modal.classList.add('active');
        this.setupReportForm();
    }

    setupReportForm() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reportDate').value = today;
        
        // Add department-specific fields
        const departmentFields = document.getElementById('departmentFields');
        departmentFields.innerHTML = this.getDepartmentFields(this.currentUser.department);
    }

    getDepartmentFields(department) {
        const fields = {
            guest_relations: `
                <div class="form-group">
                    <label for="guestIssues">Guest Issues Resolved</label>
                    <input type="number" id="guestIssues" placeholder="Number of issues resolved" min="0">
                </div>
                <div class="form-group">
                    <label for="vipGuests">VIP Guests Assisted</label>
                    <input type="number" id="vipGuests" placeholder="Number of VIP guests" min="0">
                </div>
                <div class="form-group">
                    <label for="complaints">Guest Complaints</label>
                    <textarea id="complaints" rows="2" placeholder="Describe any complaints received..."></textarea>
                </div>
            `,
            concierge: `
                <div class="form-group">
                    <label for="safariBookings">Safari Bookings Made</label>
                    <input type="number" id="safariBookings" placeholder="Number of bookings" min="0">
                </div>
                <div class="form-group">
                    <label for="tourArrangements">Tour Arrangements</label>
                    <textarea id="tourArrangements" rows="2" placeholder="Describe tours arranged..."></textarea>
                </div>
                <div class="form-group">
                    <label for="transportRequests">Transportation Requests</label>
                    <input type="number" id="transportRequests" placeholder="Number of transport requests" min="0">
                </div>
            `,
            cashier: `
                <div class="form-group">
                    <label for="shiftRevenue">Shift Revenue</label>
                    <input type="number" id="shiftRevenue" placeholder="Total revenue for shift" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="paymentMethods">Payment Methods Processed</label>
                    <textarea id="paymentMethods" rows="2" placeholder="Cash, Card, Mobile payments..."></textarea>
                </div>
                <div class="form-group">
                    <label for="refunds">Refunds Issued</label>
                    <input type="number" id="refunds" placeholder="Number of refunds" min="0">
                </div>
            `,
            switchboard: `
                <div class="form-group">
                    <label for="callsHandled">Calls Handled</label>
                    <input type="number" id="callsHandled" placeholder="Number of calls" min="0">
                </div>
                <div class="form-group">
                    <label for="messagesTaken">Messages Taken</label>
                    <input type="number" id="messagesTaken" placeholder="Number of messages" min="0">
                </div>
                <div class="form-group">
                    <label for="wakeUpCalls">Wake-up Calls</label>
                    <input type="number" id="wakeUpCalls" placeholder="Number of wake-up calls" min="0">
                </div>
            `
        };

        return fields[department] || '<p>No specific fields for this department</p>';
    }

    submitReport() {
        const formData = {
            id: Date.now(),
            userId: this.currentUser.id,
            department: this.currentUser.department,
            date: document.getElementById('reportDate').value,
            shift: document.getElementById('shift').value,
            status: 'pending',
            content: {
                challenges: document.getElementById('challenges').value,
                achievements: document.getElementById('achievements').value,
                notes: document.getElementById('notes').value,
                departmentData: this.getDepartmentData()
            },
            createdAt: new Date().toISOString()
        };

        this.reports.push(formData);
        this.saveToLocalStorage();
        
        this.closeAllModals();
        this.showToast('Report submitted successfully!', 'success');
        
        // Refresh current page
        this.loadPageData(this.currentPage);
    }

    getDepartmentData() {
        const department = this.currentUser.department;
        const data = {};

        switch(department) {
            case 'guest_relations':
                data.guestIssues = document.getElementById('guestIssues')?.value || 0;
                data.vipGuests = document.getElementById('vipGuests')?.value || 0;
                data.complaints = document.getElementById('complaints')?.value || '';
                break;
            case 'concierge':
                data.safariBookings = document.getElementById('safariBookings')?.value || 0;
                data.tourArrangements = document.getElementById('tourArrangements')?.value || '';
                data.transportRequests = document.getElementById('transportRequests')?.value || 0;
                break;
            case 'cashier':
                data.shiftRevenue = document.getElementById('shiftRevenue')?.value || 0;
                data.paymentMethods = document.getElementById('paymentMethods')?.value || '';
                data.refunds = document.getElementById('refunds')?.value || 0;
                break;
            case 'switchboard':
                data.callsHandled = document.getElementById('callsHandled')?.value || 0;
                data.messagesTaken = document.getElementById('messagesTaken')?.value || 0;
                data.wakeUpCalls = document.getElementById('wakeUpCalls')?.value || 0;
                break;
        }

        return data;
    }

    // Charts
    initializeCharts() {
        this.createWeeklyChart();
        this.createDepartmentChart();
        this.createPerformanceChart();
        this.createTrendChart();
        this.createStaffChart();
        this.createIssueChart();
    }

    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: 'Daily Reports',
                    data: this.getWeeklyReportData(),
                    borderColor: 'rgb(139, 195, 74)',
                    backgroundColor: 'rgba(139, 195, 74, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        this.charts.department = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Guest Relations', 'Concierge', 'Cashier', 'Switchboard'],
                datasets: [{
                    data: this.getDepartmentReportData(),
                    backgroundColor: [
                        '#2d5016',
                        '#4a7c28',
                        '#8bc34a',
                        '#689f38'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Reports Submitted', 'Issues Resolved', 'Guest Satisfaction', 'Response Time'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [85, 92, 88, 95],
                    backgroundColor: 'rgba(139, 195, 74, 0.8)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast30Days(),
                datasets: [{
                    label: 'Report Trend',
                    data: this.getMonthlyTrendData(),
                    borderColor: 'rgb(45, 80, 22)',
                    backgroundColor: 'rgba(45, 80, 22, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    createStaffChart() {
        const ctx = document.getElementById('staffChart');
        if (!ctx) return;

        this.charts.staff = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Productivity', 'Quality', 'Teamwork', 'Initiative', 'Communication'],
                datasets: [{
                    label: 'Staff Performance',
                    data: [90, 85, 88, 92, 87],
                    borderColor: 'rgb(139, 195, 74)',
                    backgroundColor: 'rgba(139, 195, 74, 0.2)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    createIssueChart() {
        const ctx = document.getElementById('issueChart');
        if (!ctx) return;

        this.charts.issue = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Room Issues', 'Service Complaints', 'Maintenance', 'Billing', 'Other'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#2d5016',
                        '#4a7c28',
                        '#8bc34a',
                        '#689f38',
                        '#ffa726'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.weekly) {
            this.charts.weekly.data.datasets[0].data = this.getWeeklyReportData();
            this.charts.weekly.update();
        }

        if (this.charts.department) {
            this.charts.department.data.datasets[0].data = this.getDepartmentReportData();
            this.charts.department.update();
        }
    }

    // Chart Data Methods
    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return days;
    }

    getWeeklyReportData() {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = this.reports.filter(r => r.date === dateStr).length;
            data.push(count);
        }
        return data;
    }

    getDepartmentReportData() {
        const departments = ['guest_relations', 'concierge', 'cashier', 'switchboard'];
        return departments.map(dept => 
            this.reports.filter(r => r.department === dept).length
        );
    }

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i -= 5) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    }

    getMonthlyTrendData() {
        const data = [];
        for (let i = 29; i >= 0; i -= 5) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = this.reports.filter(r => r.date === dateStr).length;
            data.push(count);
        }
        return data;
    }

    // Department Summary
    loadDepartmentSummaryData() {
        if (!this.currentUser || this.currentUser.role !== 'department_head') return;

        const today = new Date().toISOString().split('T')[0];
        const departmentReports = this.reports.filter(r => 
            r.department === this.currentUser.department && r.date === today
        );

        document.getElementById('deptTotalReports').textContent = departmentReports.length;
        document.getElementById('deptStaffPresent').textContent = this.getDepartmentStaffCount();
        document.getElementById('deptIssuesResolved').textContent = this.getIssuesResolvedCount(departmentReports);
        document.getElementById('deptPendingActions').textContent = departmentReports.filter(r => r.status === 'pending').length;

        this.loadStaffReportsList(departmentReports);
    }

    getDepartmentStaffCount() {
        return this.users.filter(u => 
            u.department === this.currentUser.department && u.status === 'active'
        ).length;
    }

    getIssuesResolvedCount(reports) {
        return reports.reduce((total, report) => {
            return total + (parseInt(report.content.departmentData?.guestIssues || 0));
        }, 0);
    }

    loadStaffReportsList(reports) {
        const staffReportsList = document.getElementById('staffReportsList');
        staffReportsList.innerHTML = '';

        if (reports.length === 0) {
            staffReportsList.innerHTML = '<p>No staff reports for today</p>';
            return;
        }

        reports.forEach(report => {
            const user = this.users.find(u => u.id === report.userId);
            const reportItem = document.createElement('div');
            reportItem.className = 'report-card';
            reportItem.innerHTML = `
                <div class="report-header">
                    <div class="report-title">${user ? user.name : 'Unknown'}</div>
                    <div class="report-status status-${report.status}">${this.formatStatus(report.status)}</div>
                </div>
                <div class="report-details">
                    <p><strong>Shift:</strong> ${this.formatShift(report.shift)}</p>
                    ${report.content.challenges ? `<p><strong>Challenges:</strong> ${report.content.challenges}</p>` : ''}
                    ${report.content.achievements ? `<p><strong>Achievements:</strong> ${report.content.achievements}</p>` : ''}
                </div>
            `;
            staffReportsList.appendChild(reportItem);
        });
    }

    // User Management
    loadUserManagementData() {
        if (!this.currentUser || this.currentUser.role !== 'admin') return;

        const usersTableBody = document.getElementById('usersTableBody');
        usersTableBody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${this.formatRole(user.role)}</td>
                <td>${this.formatDepartment(user.department)}</td>
                <td><span class="user-status status-${user.status}">${user.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="app.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="app.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    // Staff Management
    loadStaffManagementData() {
        const staffGrid = document.getElementById('staffGrid');
        staffGrid.innerHTML = '';

        const departmentStaff = this.currentUser.role === 'department_head' 
            ? this.users.filter(u => u.department === this.currentUser.department)
            : this.users.filter(u => u.role === 'staff');

        departmentStaff.forEach(staff => {
            const staffCard = document.createElement('div');
            staffCard.className = 'staff-card';
            staffCard.innerHTML = `
                <div class="staff-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="staff-name">${staff.name}</div>
                <div class="staff-role">${this.formatRole(staff.role)}</div>
                <div class="staff-stats">
                    <div class="staff-stat">
                        <div class="staff-stat-number">${this.getStaffReportCount(staff.id)}</div>
                        <div class="staff-stat-label">Reports</div>
                    </div>
                    <div class="staff-stat">
                        <div class="staff-stat-number">${this.getStaffCompletionRate(staff.id)}%</div>
                        <div class="staff-stat-label">Completion</div>
                    </div>
                </div>
            `;
            staffGrid.appendChild(staffCard);
        });
    }

    getStaffReportCount(staffId) {
        return this.reports.filter(r => r.userId === staffId).length;
    }

    getStaffCompletionRate(staffId) {
        const staffReports = this.reports.filter(r => r.userId === staffId);
        if (staffReports.length === 0) return 0;
        
        const completedReports = staffReports.filter(r => r.status === 'approved').length;
        return Math.round((completedReports / staffReports.length) * 100);
    }

    // Analytics
    loadAnalyticsData() {
        // Charts are already initialized, just update them with current data
        this.updateCharts();
    }

    // System Settings
    loadSystemSettings() {
        if (!this.currentUser || this.currentUser.role !== 'admin') return;
        
        // Load settings from localStorage or use defaults
        const settings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        
        document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 5;
        document.getElementById('requireApproval').checked = settings.requireApproval !== false;
        document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
        document.getElementById('desktopNotifications').checked = settings.desktopNotifications || false;
    }

    saveSettings() {
        const settings = {
            autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
            requireApproval: document.getElementById('requireApproval').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            desktopNotifications: document.getElementById('desktopNotifications').checked
        };
        
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        this.showToast('Settings saved successfully!', 'success');
    }

    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatStatus(status) {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatDepartment(department) {
        return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatShift(shift) {
        return shift.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showToast(message, type = 'success') {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            toastContainer.remove();
        }, 3000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    viewReportDetails(report) {
        // Placeholder for viewing detailed report
        this.showToast('Report details view coming soon!', 'info');
    }

    editUser(userId) {
        // Placeholder for editing user
        this.showToast('User editing coming soon!', 'info');
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveToLocalStorage();
            this.loadUserManagementData();
            this.showToast('User deleted successfully!', 'success');
        }
    }

    generateDepartmentSummary() {
        // Placeholder for generating department summary
        this.showToast('Department summary generation coming soon!', 'info');
    }
}

// Global Functions
function openReportModal() {
    app.openReportModal();
}

function closeReportModal() {
    app.closeAllModals();
}

function logout() {
    app.logout();
}

function saveSettings() {
    app.saveSettings();
}

function generateDepartmentSummary() {
    app.generateDepartmentSummary();
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HotelReportingSystem();
});
