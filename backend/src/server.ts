import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
const isProd = process.env.NODE_ENV === 'production';

// Garante que o diretório de uploads existe
const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(__dirname, '../uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Init DB
initSchema();

app.use(cors({
  origin: isProd ? true : 'http://localhost:5173',
}));
app.use(express.json({ limit: '50mb' }));

// Arquivos estáticos — uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Em produção, serve o frontend compilado
if (isProd) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
}

// Rotas PÚBLICAS
app.use('/api/status', statusRouter);
app.use('/api/auth', authRouter);

// Rotas PROTEGIDAS
app.use('/api/pdfs',       authenticate, pdfsRouter);
app.use('/api/trips',      authenticate, tripsRouter);
app.use('/api/deliveries', authenticate, deliveriesRouter);
app.use('/api/admin',      authenticate, adminRouter);
app.use('/api/users',      authenticate, requireAdmin, usersRouter);

// SPA fallback — em produção, qualquer rota desconhecida serve o index.html
if (isProd) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
