import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import fileRoutes from './routes/fileRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'VaultDrop API is secure and operational.' 
  });
});

app.use('/api/files', fileRoutes);

app.use(errorHandler);

export default app;