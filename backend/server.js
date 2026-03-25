const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local first
const envPath = path.join(__dirname, '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Could not load .env.local from ${envPath}:`, result.error.message);
} else {
  console.log('✅ Loaded environment variables from .env.local');
}

// Fallback to standard .env
dotenv.config();

// Debug logs (Safe versions)
console.log('🔍 Environment Check:');
console.log('   - PORT:', process.env.PORT || '3001 (default)');
console.log('   - SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('   - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { globalLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');
const exportRoutes = require('./routes/export');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & performance middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ResumeAI Backend API', docs: '/health' });
});

// API routes
app.use('/resume', resumeRoutes);
app.use('/ai', aiRoutes);
app.use('/export', exportRoutes);
app.use('/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 ResumeAI Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
