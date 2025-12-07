const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy - Required for Vercel deployment
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Rate Limiting - Compatible with Vercel proxy
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS Configuration - Allow all origins
app.use(cors({
  origin: true, // Accept all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// No API key authentication - service is trusted within internal network

// Routes
const emailRoutes = require('./routes/emailRoutes');
app.use('/api/email', emailRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Email Service',
    timestamp: new Date().toISOString()
  });
});

// Environment Variables Check (for debugging)
app.get('/api/config/check', (req, res) => {
  const hasEmailUser = !!process.env.EMAIL_USER;
  const hasEmailPass = !!process.env.EMAIL_PASS;
  const hasMongoUri = !!process.env.MONGODB_URI;
  
  res.json({
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: hasEmailUser && hasEmailPass,
    details: {
      EMAIL_USER: hasEmailUser ? `${process.env.EMAIL_USER?.substring(0, 5)}***` : '❌ MISSING',
      EMAIL_PASS: hasEmailPass ? '✅ SET' : '❌ MISSING',
      EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail (default)',
      MONGODB_URI: hasMongoUri ? '✅ SET' : '❌ MISSING',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '❌ MISSING'
    },
    message: (hasEmailUser && hasEmailPass) 
      ? '✅ Email credentials are configured' 
      : '❌ EMAIL_USER and/or EMAIL_PASS are missing. Set them in Vercel environment variables.'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`📧 Email Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
