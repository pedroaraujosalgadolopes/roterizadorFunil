import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/trips
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const trips = db.prepare(`
    SELECT
      t.id, t.nome, t.data_criacao,
      COUNT(d.id)                                                            AS total_notas,
      COALESCE(SUM(d.peso_bruto), 0)                                         AS total_peso,
      COALESCE(SUM(d.valor_nf), 0)                                           AS total_valor,
      COUNT(DISTINCT d.municipio)                                            AS total_cidades,
      ROUND(100.0 * SUM(CASE WHEN d.status = 'entregue' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(d.id), 0), 1)                                     AS percentual_entregue
    FROM trips t
    LEFT JOIN deliveries d ON d.trip_id = t.id
    GROUP BY t.id
    ORDER BY t.data_criacao DESC
  `).all();
  res.json(trips);
});

// GET /api/trips/:id/summary
router.get('/:id/summary', (req: Request, res: Response) => {
  const db = getDb();
  const tripId = parseInt(req.params.id);

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId) as any;
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const deliveries = db.prepare(`
    SELECT municipio, bairro_distrito, uf, numero_nf, numero_cliente,
           nome_destinatario, peso_bruto, valor_nf, status
    FROM deliveries
    WHERE trip_id = ?
    ORDER BY municipio, bairro_distrito, numero_nf
  `).all(tripId) as any[];

  const grouped: Record<string, any> = {};
  for (const d of deliveries) {
    const mun    = d.municipio      || 'Sem Município';
    const bairro = d.bairro_distrito || 'Sem Bairro';
    if (!grouped[mun]) grouped[mun] = { municipio: mun, uf: d.uf, bairros: {}, total_notas: 0, total_peso: 0, total_valor: 0 };
    if (!grouped[mun].bairros[bairro]) grouped[mun].bairros[bairro] = { bairro, entregas: [], total_notas: 0, total_peso: 0, total_valor: 0 };
    grouped[mun].bairros[bairro].entregas.push(d);
    grouped[mun].bairros[bairro].total_notas++;
    grouped[mun].bairros[bairro].total_peso  += d.peso_bruto || 0;
    grouped[mun].bairros[bairro].total_valor += d.valor_nf   || 0;
    grouped[mun].total_notas++;
    grouped[mun].total_peso  += d.peso_bruto || 0;
    grouped[mun].total_valor += d.valor_nf   || 0;
  }

  const summary = Object.values(grouped).map((m: any) => ({
    ...m,
    bairros: Object.values(m.bairros),
  }));

  res.json({ trip, summary });
});

// POST /api/trips
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { nome, deliveries } = req.body as { nome: string; deliveries: any[] };

  if (!nome || !deliveries || deliveries.length === 0) {
    return res.status(400).json({ error: 'nome and deliveries are required' });
  }

  const createTrip = db.transaction(() => {
    const tripResult = db.prepare('INSERT INTO trips (nome) VALUES (?)').run(nome);
    const tripId = tripResult.lastInsertRowid as number;

    const insertDelivery = db.prepare(`
      INSERT INTO deliveries (
        trip_id, numero_cliente, nome_destinatario, numero_nf, serie_nf, data_emissao,
        bairro_distrito, municipio, uf, cep,
        peso_bruto, peso_liquido, valor_nf, valor_produtos, quantidade_volumes, produtos_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of deliveries) {
      insertDelivery.run(
        tripId,
        d.numero_cliente     || null,
        d.nome_destinatario  || null,
        d.numero_nf,
        d.serie_nf           || null,
        d.data_emissao       || null,
        d.bairro_distrito    || null,
        d.municipio,
        d.uf                 || null,
        d.cep                || null,
        d.peso_bruto         ?? null,
        d.peso_liquido       ?? null,
        d.valor_nf           ?? null,
        d.valor_produtos     ?? null,
        d.quantidade_volumes ?? null,
        d.produtos && d.produtos.length > 0 ? JSON.stringify(d.produtos) : null,
      );
    }

    return tripId;
  });

  const tripId = createTrip();
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  res.status(201).json(trip);
});

export default router;
