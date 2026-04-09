import express from 'express';
import authRoutes from './routes/auth.routes.js';
import waitlistRoutes from './routes/waitlist.routes.js';
import connectDB from './config/db.js';
import { errorHandler, notFoundHandler, sendSuccess } from './utils/http.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

let dbConnectionPromise = null;

app.use(async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;
    return next();
  } catch (error) {
    dbConnectionPromise = null;
    console.error('Database connection error:', error);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed.'
    });
  }
});

app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is healthy.', { status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/waitlist', waitlistRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;