import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database';
import { authenticate, JWT_SECRET } from '../middleware/authenticate';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'username e password são obrigatórios' });
  }

  const db = getDb();
  const user = db.prepare(
    'SELECT id, nome, username, password_hash, role, ativo FROM users WHERE username = ?'
  ).get(username) as any;

  if (!user || !user.ativo) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    user: { id: user.id, nome: user.nome, username: user.username, role: user.role },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, nome, username, role FROM users WHERE id = ? AND ativo = 1'
  ).get(req.user!.id) as any;
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  return res.json(user);
});

export default router;
