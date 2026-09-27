import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import planRoutes from './routes/planRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import patternRoutes from './routes/patternRoutes.js';
import spacedRoutes from './routes/spacedRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import systemDesignRoutes from './routes/systemDesignRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { extractAuthUser } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(extractAuthUser);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/plans', scheduleRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/spaced-repetition', spacedRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/system-design', systemDesignRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '100-Day FAANG DSA Preparation Engine',
    engine: 'Todait Adaptive Rebalancing Active'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Bootstrap
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 100-Day FAANG DSA Tracker Backend running on port ${PORT}`);
    console.log(`🎯 Todait Adaptive Rebalancer: http://localhost:${PORT}/api/plan/daily`);
    console.log(`📚 455 Striver A2Z Problems: http://localhost:${PORT}/api/problems`);
    console.log(`====================================================`);
  });
}

startServer();
