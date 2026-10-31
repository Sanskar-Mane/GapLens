const dns = require('dns');
const net = require('net');
const https = require('https');

// Force IPv4 DNS resolution first to avoid Windows Cloudflare/IPv6 timeouts
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}

// Global HTTPS agent enforcing IPv4 with keep-alive
const globalIpv4Agent = new https.Agent({
  family: 4,
  keepAlive: true,
  timeout: 30000,
});

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Explicitly load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { isSupabaseConfigured } = require('./config/supabaseClient');
const { getDefaultModel } = require('./config/openRouterConfig');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration allowing cross-origin calls and custom OpenRouter headers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-gemini-key',
      'x-gemini-model',
      'x-openrouter-key',
      'x-openrouter-model',
    ],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'GapLens API',
    tagline: 'AI-Assisted Information Gap Detection Platform',
    hackathon: 'Shinchan Online Hackathon 2026: Digital Dark Spot',
    status: 'online',
    port: PORT,
    supabaseConfigured: isSupabaseConfigured,
    storageEngine: isSupabaseConfigured ? 'Supabase Database' : 'In-Memory Fallback',
    endpoints: {
      health: '/api/health',
      scenarios: '/api/scenarios',
      extractUrl: '/api/extract-url',
      sessions: '/api/sessions',
      analyze: '/api/analyze',
    },
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found on GapLens Server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GapLens Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + (err.message || 'Unknown error'),
  });
});

// Start Server
app.listen(PORT, () => {
  const hasKey = Boolean(
    (process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== '' &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') ||
    (process.env.OPENROUTER_API_KEY &&
      process.env.OPENROUTER_API_KEY.trim() !== '' &&
      process.env.OPENROUTER_API_KEY !== 'your_openrouter_key_here')
  );

  console.log('====================================================');
  console.log('   🔍 GapLens Backend Engine v1.0.0 Started');
  console.log(`   🚀 Server URL: http://localhost:${PORT}`);
  console.log(`   📡 Health:     http://localhost:${PORT}/api/health`);
  console.log(`   📦 Scenarios:  http://localhost:${PORT}/api/scenarios`);
  console.log(`   🗄️  Database:   ${isSupabaseConfigured ? 'Supabase Connected' : 'In-Memory Fallback Store'}`);
  console.log(`   🤖 OpenRouter: ${hasKey ? 'Configured in .env' : 'Ready (Client Header / Demo Mode)'}`);
  console.log(`   🧠 AI Models:  ${process.env.OPENROUTER_MODEL || getDefaultModel()}`);
  console.log('====================================================');
});
