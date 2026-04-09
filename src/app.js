import express from 'express';
import authRoutes from './routes/auth.routes.js';
import waitlistRoutes from './routes/waitlist.routes.js';
import { errorHandler, notFoundHandler, sendSuccess } from './utils/http.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is healthy.', { status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/waitlist', waitlistRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
