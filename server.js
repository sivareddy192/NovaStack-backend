import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, isDbConnected } from './config/db.js';
import { seedDatabase } from './utils/seeder.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import estimatorRoutes from './routes/estimatorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5100;

// Connect to Database and run seeding
(async () => {
  await connectDB();
  if (isDbConnected()) {
    await seedDatabase();
  }
})();

// Security & Standard Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: true, // Allow all origins in development and configured in prod
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Ensure DB connection in serverless environment
app.use(async (req, res, next) => {
  if (!isDbConnected()) {
    await connectDB();
  }
  next();
});

// Handle browser favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root welcome & status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'NovaStack API Server',
    message: 'Backend is running successfully',
    healthCheck: '/api/health',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'NovaStack API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/estimator', estimatorRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [NovaStack Server] Running on http://127.0.0.1:${PORT}`);
  });
}

export default app;

