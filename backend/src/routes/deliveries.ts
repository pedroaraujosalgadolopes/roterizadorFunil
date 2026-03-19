import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { getDb } from '../db/database';

const router = Router();

// GET /api/deliveries?trip_id=X
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { trip_id, status, municipio } = req.query;

  let query = 'SELECT * FROM deliveries WHERE 1=1';
  const params: any[] = [];

  if (trip_id) { query += ' AND trip_id = ?'; params.push(trip_id); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (municipio) { query += ' AND municipio LIKE ?'; params.push(`%${municipio}%`); }

  query += ' ORDER BY municipio, bairro_distrito, numero_nf';

  const deliveries = db.prepare(query).all(...params);
  res.json(deliveries);
});

// PATCH /api/deliveries/:id
router.patch('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const fields = req.body as Record<string, any>;

  const allowed = ['numero_cliente', 'numero_nf', 'bairro_distrito', 'municipio', 'peso_bruto', 'status'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([, v]) => v);

  db.prepare(`UPDATE deliveries SET ${setClauses} WHERE id = ?`).run(...values, id);
  const updated = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id);
  res.json(updated);
});

// POST /api/deliveries/:id/canhoto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const delivery = getDb().prepare('SELECT trip_id FROM deliveries WHERE id = ?').get(parseInt(req.params.id)) as any;
    if (!delivery) return cb(new Error('Delivery not found'), '');
    const dir = path.join(__dirname, '../../../uploads', String(delivery.trip_id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `nf_${req.params.id}_${Date.now()}${ext}`);
  },
});
const uploadCanhoto = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/:id/canhoto', uploadCanhoto.single('canhoto'), async (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;
  const relPath = path.relative(path.join(__dirname, '../../../'), filePath);

  // Generate thumbnail
  let thumbRelPath: string | null = null;
  try {
    const thumbDir = path.dirname(filePath);
    const thumbName = `thumb_${path.basename(filePath, path.extname(filePath))}.webp`;
    const thumbPath = path.join(thumbDir, thumbName);

    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.heic'].includes(ext)) {
      await sharp(filePath).resize(200, 200, { fit: 'inside' }).webp({ quality: 80 }).toFile(thumbPath);
      thumbRelPath = path.relative(path.join(__dirname, '../../../'), thumbPath);
    }
  } catch (e) {
    console.warn('Thumbnail generation failed:', e);
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE deliveries
    SET canhoto_path = ?, canhoto_thumb_path = ?, status = 'entregue', data_entrega = ?
    WHERE id = ?
  `).run(relPath, thumbRelPath, now, id);

  const updated = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/deliveries/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id) as any;
  if (!delivery) return res.status(404).json({ error: 'Not found' });

  // Clean up files
  if (delivery.canhoto_path) {
    try { fs.unlinkSync(path.join(__dirname, '../../../', delivery.canhoto_path)); } catch {}
  }
  if (delivery.canhoto_thumb_path) {
    try { fs.unlinkSync(path.join(__dirname, '../../../', delivery.canhoto_thumb_path)); } catch {}
  }

  db.prepare('DELETE FROM deliveries WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
