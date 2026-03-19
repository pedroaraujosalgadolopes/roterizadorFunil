import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';

const router = Router();

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const users = db.prepare(
    'SELECT id, nome, username, role, ativo, data_criacao FROM users ORDER BY data_criacao DESC'
  ).all();
  return res.json(users);
});

// POST /api/users
router.post('/', (req: Request, res: Response) => {
  const { nome, username, password, role } = req.body as {
    nome: string; username: string; password: string; role: 'admin' | 'user';
  };
  if (!nome || !username || !password) {
    return res.status(400).json({ error: 'nome, username e password são obrigatórios' });
  }
  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare(
      'INSERT INTO users (nome, username, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(nome, username, hash, role || 'user');
    const user = db.prepare('SELECT id, nome, username, role, ativo, data_criacao FROM users WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(user);
  } catch {
    return res.status(409).json({ error: 'Username já está em uso' });
  }
});

// PUT /api/users/:id
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const { nome, username, password, role } = req.body as {
    nome?: string; username?: string; password?: string; role?: 'admin' | 'user';
  };

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' });

  const newHash = password ? bcrypt.hashSync(password, 10) : existing.password_hash;
  try {
    db.prepare(
      'UPDATE users SET nome = ?, username = ?, password_hash = ?, role = ? WHERE id = ?'
    ).run(nome ?? existing.nome, username ?? existing.username, newHash, role ?? existing.role, id);
    const user = db.prepare('SELECT id, nome, username, role, ativo, data_criacao FROM users WHERE id = ?').get(id);
    return res.json(user);
  } catch {
    return res.status(409).json({ error: 'Username já está em uso' });
  }
});

// PATCH /api/users/:id/ativo
router.patch('/:id/ativo', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);

  // Impede desativar o próprio admin chamante
  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' });

  const newAtivo = existing.ativo === 1 ? 0 : 1;
  db.prepare('UPDATE users SET ativo = ? WHERE id = ?').run(newAtivo, id);
  return res.json({ id, ativo: newAtivo });
});

export default router;
