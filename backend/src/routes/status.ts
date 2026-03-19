import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/status?trip_id=X
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { trip_id } = req.query;

  let deliveries;
  if (trip_id) {
    deliveries = db.prepare(`
      SELECT id, numero_nf, nome_destinatario, municipio, uf, status, data_entrega,
             canhoto_path, canhoto_thumb_path
      FROM deliveries
      WHERE trip_id = ?
      ORDER BY municipio, nome_destinatario
    `).all(trip_id);
  } else {
    deliveries = db.prepare(`
      SELECT d.id, d.numero_nf, d.nome_destinatario, d.municipio, d.uf,
             d.status, d.data_entrega, d.canhoto_path, d.canhoto_thumb_path,
             t.nome AS viagem
      FROM deliveries d
      JOIN trips t ON t.id = d.trip_id
      ORDER BY t.data_criacao DESC, d.municipio, d.nome_destinatario
    `).all();
  }

  const trips = db.prepare(
    'SELECT id, nome, data_criacao FROM trips ORDER BY data_criacao DESC'
  ).all();

  res.json({ trips, deliveries });
});

// GET /api/status/produtos/:id
router.get('/produtos/:id', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const delivery = db.prepare(
    'SELECT numero_nf, nome_destinatario, municipio, produtos_json FROM deliveries WHERE id = ?'
  ).get(id) as any;

  if (!delivery) return res.status(404).json({ error: 'Not found' });

  const produtos = delivery.produtos_json ? JSON.parse(delivery.produtos_json) : [];
  res.json({ ...delivery, produtos });
});

export default router;
