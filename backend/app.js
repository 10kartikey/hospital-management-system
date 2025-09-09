// Hospital Management System - Main Server File
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");
const session = require('express-session');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(bodyParser.json());

// Session configuration for admin authentication
app.use(session({
  secret: process.env.SESSION_SECRET ,  // fallback secret
    resave: false,
    saveUninitialized: true,
    cookie: {
    httpOnly: true,
    secure: false,   // true only if HTTPS
    sameSite: "lax"  // or "none" if frontend & backend are on different domains with HTTPS
  } 
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Static HTML Page Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/admin.html"));
});

app.get("/patient-portal.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/patient-portal.html"));
});

app.get("/html/admin-login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/admin-login.html"));
});

// API Routes Setup
const appointmentRoutes = require('./routes/appointment');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');

// Mount API routes with /api prefix
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

// Admin Authentication Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Verify admin credentials from environment variables
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Admin Authorization Middleware (Note: This is also defined in middleware/requireAdmin.js)
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

app.use(cors({
  origin: "http://localhost:5000",  // e.g. http://localhost:3000 or your ELB domain
  credentials: true                       // ✅ allow cookies
}));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Hospital Management System running on http://localhost:${PORT}`);
});

