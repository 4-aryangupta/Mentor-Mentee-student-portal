import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sequelize from './config/db.js';
import './models/index.js';
import { authMiddleware } from './middleware/auth.js';
import { errorMiddleware, notFound } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.get('/api/health', (req, res) => res.json({ success: true, service: 'mentor-mentee-portal-api', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/mentorships', authMiddleware, mentorshipRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/feedback', authMiddleware, feedbackRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use(notFound);
app.use(errorMiddleware);

const port = Number(process.env.PORT || 5000);
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, async () => {
    try { await sequelize.authenticate(); console.log(`API ready on http://localhost:${port} — MySQL connected`); }
    catch (error) { console.error(`API listening on ${port}, but MySQL connection failed: ${error.message}`); }
  });
}
export { app, server };
