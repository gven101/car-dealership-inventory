import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import vehicleRoutes from './routes/vehicle.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use(errorHandler);

export default app;