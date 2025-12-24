# Hotel Operations Reporting System

A modern, secure, and efficient system for managing daily operations reports across hotel departments.

## Features

- **User Authentication** - Secure login with email/password
- **Role-Based Access Control** - Different views for staff and supervisors
- **Report Management** - Create, view, and manage daily reports
- **Incident Tracking** - Flag and track important incidents
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Authentication, Database, Storage)
- **Deployment**: Vercel/Netlify (TBD)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Initialize Database**
   Run the setup script:
   ```bash
   node setup.js
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Tables

#### users
- `id` - UUID (primary key)
- `email` - text
- `role` - enum('staff', 'supervisor', 'admin')
- `department_id` - integer (foreign key to departments)

#### departments
- `id` - integer (primary key)
- `name` - text

#### reports
- `id` - UUID (primary key)
- `user_id` - UUID (foreign key to users)
- `department_id` - integer (foreign key to departments)
- `shift` - enum('morning', 'evening', 'night')
- `activities` - text
- `guest_feedback` - text (nullable)
- `issues` - text (nullable)
- `has_incident` - boolean
- `status` - enum('draft', 'submitted', 'reviewed', 'action_required')
- `created_at` - timestamp with time zone
- `updated_at` - timestamp with time zone

## Security

- Row Level Security (RLS) enabled on all tables
- JWT authentication for API requests
- Role-based access control
- Input validation on all forms

## Deployment

1. Push to your GitHub repository
2. Connect to Vercel/Netlify
3. Set up environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
