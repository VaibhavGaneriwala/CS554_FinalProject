import express, {Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import redisClient from './config/redis';
import { initMinIO } from './config/minio';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import workoutRoutes from './routes/workout';
import mealRoutes from './routes/meals';
import progressRoutes from './routes/progress';
import postRoutes from './routes/posts';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
        await redisClient.ping();
        await initMinIO();
        app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});
        console.log('MongoDB connected');
        console.log('Redis connected');
        console.log('MinIO connected');
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    process.exit(0);
});

startServer();

export default app;