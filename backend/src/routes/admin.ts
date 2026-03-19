import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

// GET /api/admin/stats — painel geral
router.get('/stats', (req: Request, res: Response) => {
  const db = getDb();

  const geral = db.prepare(`
    SELECT
      COUNT(DISTINCT t.id)              AS total_viagens,
      COUNT(d.id)                       AS total_notas,
      COUNT(DISTINCT d.municipio)       AS total_cidades,
      COALESCE(SUM(d.peso_bruto), 0)    AS total_peso,
      COALESCE(SUM(d.valor_nf), 0)      AS total_valor,
      SUM(CASE WHEN d.status = 'entregue' THEN 1 ELSE 0 END) AS total_entregues,
      SUM(CASE WHEN d.status = 'pendente' THEN 1 ELSE 0 END) AS total_pendentes,
      SUM(CASE WHEN d.status = 'problema' THEN 1 ELSE 0 END) AS total_problemas,
      COALESCE(SUM(CASE WHEN d.status = 'entregue' THEN d.valor_nf ELSE 0 END), 0) AS valor_entregue,
      COALESCE(SUM(CASE WHEN d.status = 'pendente' THEN d.valor_nf ELSE 0 END), 0) AS valor_pendente
    FROM trips t
    LEFT JOIN deliveries d ON d.trip_id = t.id
  `).get() as any;

  // Top cidades
  const top_cidades = db.prepare(`
    SELECT
      municipio,
      uf,
      COUNT(*)                       AS total_notas,
      COALESCE(SUM(peso_bruto), 0)   AS total_peso,
      COALESCE(SUM(valor_nf), 0)     AS total_valor,
      SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues
    FROM deliveries
    WHERE municipio IS NOT NULL
    GROUP BY municipio
    ORDER BY total_notas DESC
    LIMIT 10
  `).all();

  // Viagens recentes com stats
  const viagens_recentes = db.prepare(`
    SELECT
      t.id, t.nome, t.data_criacao,
      COUNT(d.id)                    AS total_notas,
      COUNT(DISTINCT d.municipio)    AS total_cidades,
      COALESCE(SUM(d.peso_bruto), 0) AS total_peso,
      COALESCE(SUM(d.valor_nf), 0)   AS total_valor,
      ROUND(100.0 * SUM(CASE WHEN d.status = 'entregue' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(d.id), 0), 1) AS percentual_entregue
    FROM trips t
    LEFT JOIN deliveries d ON d.trip_id = t.id
    GROUP BY t.id
    ORDER BY t.data_criacao DESC
    LIMIT 10
  `).all();

  // Distribuição por status por viagem (últimas 6)
  const status_por_viagem = db.prepare(`
    SELECT
      t.id, t.nome,
      SUM(CASE WHEN d.status = 'entregue' THEN 1 ELSE 0 END) AS entregues,
      SUM(CASE WHEN d.status = 'pendente' THEN 1 ELSE 0 END) AS pendentes,
      SUM(CASE WHEN d.status = 'problema' THEN 1 ELSE 0 END) AS problemas
    FROM trips t
    LEFT JOIN deliveries d ON d.trip_id = t.id
    GROUP BY t.id
    ORDER BY t.data_criacao DESC
    LIMIT 6
  `).all();

  res.json({ geral, top_cidades, viagens_recentes, status_por_viagem });
});

export default router;
