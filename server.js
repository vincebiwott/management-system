const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// API endpoint for status check
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint for Supabase config (client-side will use this)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://rldkwnwoohzfubkygrpk.supabase.co',
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uvcZA1LXniHPscO9DIAbaw_1JR3QiEy',
  });
});

// All other routes serve index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Press Ctrl+C to stop the server`);
});
