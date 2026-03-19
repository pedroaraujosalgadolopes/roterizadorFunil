import express from 'express';
import cors from 'cors';
import path from 'path';
import { initSchema } from './db/schema';
import pdfsRouter from './routes/pdfs';
import tripsRouter from './routes/trips';
import deliveriesRouter from './routes/deliveries';
import adminRouter from './routes/admin';
import statusRouter from './routes/status';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import { authenticate, requireAdmin } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Init DB
initSchema();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas PÚBLICAS (sem autenticação)
app.use('/api/status', statusRouter);
app.use('/api/auth', authRouter);

// Rotas PROTEGIDAS (exigem token)
app.use('/api/pdfs',       authenticate, pdfsRouter);
app.use('/api/trips',      authenticate, tripsRouter);
app.use('/api/deliveries', authenticate, deliveriesRouter);
app.use('/api/admin',      authenticate, adminRouter);
app.use('/api/users',      authenticate, requireAdmin, usersRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
