# 🏨 Safari Park Hotel Daily Reporting System

A comprehensive, modern web application for managing daily operations reports in a safari park hotel. Built with a focus on role-based access, beautiful analytics, and seamless workflow from staff to management.

## 🌟 Features

### **Multi-Role System**
- **Staff Members**: Submit daily reports specific to their department
- **Department Heads**: Review staff reports, create department summaries, manage team performance
- **General Manager**: Overview of all departments, hotel-wide analytics
- **Administrator**: Full system control, user management, system settings

### **Department-Specific Reporting**
- **Guest Relations**: Guest issues, VIP assistance, complaint handling
- **Concierge**: Safari bookings, tour arrangements, transportation requests
- **Cashier**: Shift revenue, payment processing, refunds, cash management
- **Switchboard**: Call handling, messages, wake-up calls, emergency communications

### **Advanced Analytics**
- Interactive charts and visualizations
- Weekly/monthly trend analysis
- Department performance comparisons
- Staff productivity metrics
- Real-time dashboard updates

### **Modern UI/UX**
- Glass morphism design with safari-themed colors
- Responsive layout for all devices
- Smooth animations and transitions
- Professional gradients and modern styling
- Intuitive navigation and user experience

## 🚀 Technology Stack

### **Frontend**
- **HTML5** with semantic markup
- **CSS3** with advanced features (Grid, Flexbox, Glass Morphism)
- **JavaScript (ES6+)** with modern patterns
- **Chart.js** for interactive data visualizations
- **Font Awesome** for professional icons

### **Backend (Ready for Supabase)**
- **Supabase** for database and authentication
- **PostgreSQL** with advanced features
- **Row Level Security (RLS)** for data protection
- **Edge Functions** for server-side logic
- **Real-time subscriptions** for live updates

### **Deployment**
- **GitHub Pages** for frontend hosting
- **Supabase** for backend services
- **CI/CD ready** with GitHub Actions

## 📁 Project Structure

```
safari-hotel-reports/
├── index.html                 # Main application entry point
├── assets/
│   ├── css/
│   │   └── styles.css        # Complete styling with glass morphism
│   └── js/
│       └── app.js            # Main application logic
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Database schema
│   └── functions/
│       ├── auth.js           # Authentication functions
│       └── reports.js        # Report management functions
├── README.md                  # This file
└── package.json              # Project metadata
```

## 🛠 Installation & Setup

### **Prerequisites**
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+)
- Node.js (for development, optional)
- Supabase account (for production deployment)

### **Local Development**
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safari-hotel-reports
   ```

2. **Start local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### **Supabase Setup (Production)**
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Run Database Migration**
   ```bash
   # Using Supabase CLI
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy auth
   supabase functions deploy reports
   ```

4. **Configure Environment**
   - Update `assets/js/app.js` with your Supabase credentials
   - Set up authentication providers
   - Configure Row Level Security policies

## 👥 Demo Accounts

The application comes with pre-configured demo accounts for testing:

| Role | Email | Password | Department |
|------|-------|----------|------------|
| Staff | `staff@guest.com` | `123456` | Guest Relations |
| Department Head | `hod@guest.com` | `123456` | Guest Relations |
| General Manager | `gm@hotel.com` | `123456` | Management |
| Administrator | `admin@hotel.com` | `123456` | Administration |

## 📊 User Guide

### **For Staff Members**
1. **Login** with your credentials and select your department
2. **Dashboard** shows your personal statistics and recent activity
3. **Create Reports** by clicking "New Report" and filling department-specific fields
4. **View History** of your submitted reports and any feedback from department heads

### **For Department Heads**
1. **Review Staff Reports** submitted by your team members
2. **Provide Feedback** and approve/reject reports
3. **Generate Department Summaries** for daily management review
4. **Monitor Team Performance** through analytics and staff management tools

### **For General Managers**
1. **Hotel-Wide Overview** of all departments and operations
2. **Compare Department Performance** with interactive charts
3. **Review Trends** and identify areas for improvement
4. **Access All Reports** and department summaries

### **For Administrators**
1. **User Management** - Add, edit, or remove user accounts
2. **System Configuration** - Adjust settings and preferences
3. **Report Templates** - Customize forms for each department
4. **System Health** - Monitor performance and usage statistics

## 🎨 Design System

### **Color Palette**
- **Primary**: Safari Green (#2d5016, #4a7c28)
- **Accent**: Light Green (#8bc34a, #689f38)
- **Gold**: Safari Gold (#ffa726)
- **Earth**: Brown Tones (#6d4c41, #8d6e63)
- **Neutral**: Grays and whites for balance

### **Typography**
- **Primary**: Inter (modern, clean, highly readable)
- **Weights**: 300, 400, 500, 600, 700
- **System Font Fallback**: San-serif stack for compatibility

### **Design Principles**
- **Glass Morphism**: Modern, elegant visual style
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 AA compliance
- **Professional**: Business-appropriate design

## 🔧 Configuration

### **System Settings**
- Auto-save interval (minutes)
- Report approval requirements
- Email notifications
- Desktop notifications
- Session timeout
- File upload limits

### **Report Templates**
Each department has customized report fields:
- **Guest Relations**: Issues resolved, VIP guests, complaints
- **Concierge**: Safari bookings, tours, transportation
- **Cashier**: Revenue, payments, refunds, discrepancies
- **Switchboard**: Calls, messages, wake-up calls

### **User Roles & Permissions**
- **Staff**: Create/edit own reports, view personal analytics
- **Department Head**: Review department reports, manage staff
- **General Manager**: View all departments, hotel analytics
- **Admin**: Full system access, user management

## 📈 Analytics & Reports

### **Dashboard Metrics**
- Today's reports count
- Pending reports
- Completed reports
- Satisfaction rate
- Weekly trends
- Department distribution

### **Advanced Analytics**
- Performance metrics
- Trend analysis
- Staff performance radar charts
- Issue distribution pie charts
- Department comparisons

### **Report Generation**
- Daily operational summaries
- Department performance reports
- Staff productivity analysis
- Hotel-wide analytics
- Export capabilities (PDF, Excel)

## 🔒 Security Features

### **Authentication**
- Role-based access control
- Secure password handling
- Session management
- Auto-logout on inactivity

### **Data Protection**
- Row Level Security (RLS)
- Encrypted data transmission
- GDPR compliance
- Audit logging

### **Access Control**
- Department-based data isolation
- Hierarchical permissions
- Admin override capabilities
- Activity tracking

## 🚀 Deployment Guide

### **GitHub Pages (Frontend)**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy Safari Hotel Reports"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository settings
   - Enable Pages from main branch
   - Site will be live at `https://username.github.io/repository`

### **Supabase (Backend)**
1. **Database Setup**
   - Run migration script
   - Set up RLS policies
   - Create initial users

2. **Edge Functions**
   - Deploy authentication functions
   - Deploy report management functions
   - Configure CORS settings

3. **Environment Variables**
   - Set Supabase URL and keys
   - Configure authentication providers
   - Set up email templates

### **Custom Domain (Optional)**
1. **DNS Configuration**
   - Add A records for GitHub Pages
   - Configure SSL certificates
   - Update repository settings

2. **Supabase Custom Domain**
   - Configure custom domain in Supabase dashboard
   - Update CORS settings
   - Test API endpoints

## 🔄 Maintenance

### **Regular Tasks**
- Monitor database performance
- Update user accounts
- Review system logs
- Backup data regularly
- Update dependencies

### **Scaling Considerations**
- Database optimization
- CDN implementation
- Load balancing
- Caching strategies
- Performance monitoring

## 🐛 Troubleshooting

### **Common Issues**
- **Login Problems**: Check user credentials and role assignments
- **Report Submission**: Verify department settings and permissions
- **Chart Display**: Ensure Chart.js is loaded properly
- **Data Sync**: Check Supabase connection and RLS policies

### **Debug Mode**
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### **Support**
- Check browser console for errors
- Verify network requests in DevTools
- Review Supabase logs
- Test with different user roles

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request
5. Code review and merge

### **Code Standards**
- Use ES6+ JavaScript features
- Follow CSS naming conventions
- Maintain responsive design
- Ensure accessibility compliance
- Add proper documentation

### **Testing**
- Test all user roles
- Verify responsive behavior
- Check cross-browser compatibility
- Validate form inputs
- Test error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Chart.js** for beautiful data visualizations
- **Font Awesome** for professional icons
- **Inter Font** for excellent typography

---

## 🎯 Future Roadmap

### **Phase 2 Features**
- [ ] Mobile app development
- [ ] Advanced reporting with PDF export
- [ ] Integration with hotel PMS systems
- [ ] Multi-language support
- [ ] Offline functionality

### **Phase 3 Enhancements**
- [ ] AI-powered insights and recommendations
- [ ] Predictive analytics for staffing
- [ ] Guest satisfaction correlation analysis
- [ ] Automated report generation
- [ ] Integration with safari booking systems

### **Long-term Vision**
- [ ] Multi-property management
- [ ] Franchise support
- [ ] Advanced BI dashboard
- [ ] API marketplace for integrations
- [ ] Machine learning for operational optimization

---

**Built with ❤️ for Safari Park Hotels worldwide**

*For support, feature requests, or contributions, please open an issue or submit a pull request.*
