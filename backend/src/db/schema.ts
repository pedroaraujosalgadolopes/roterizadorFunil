import { getDb } from './database';
import bcrypt from 'bcryptjs';

export function initSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      ativo INTEGER NOT NULL DEFAULT 1,
      data_criacao TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_criacao TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
      numero_cliente TEXT,
      nome_destinatario TEXT,
      numero_nf TEXT NOT NULL,
      serie_nf TEXT,
      data_emissao TEXT,
      bairro_distrito TEXT,
      municipio TEXT NOT NULL,
      uf TEXT,
      cep TEXT,
      peso_bruto REAL,
      peso_liquido REAL,
      valor_nf REAL,
      valor_produtos REAL,
      quantidade_volumes REAL,
      status TEXT DEFAULT 'pendente',
      canhoto_path TEXT,
      canhoto_thumb_path TEXT,
      data_criacao TEXT DEFAULT (datetime('now')),
      data_entrega TEXT
    );
  `);

  // Migrações seguras — adiciona colunas novas se ainda não existirem
  const migrations = [
    'ALTER TABLE deliveries ADD COLUMN nome_destinatario TEXT',
    'ALTER TABLE deliveries ADD COLUMN serie_nf TEXT',
    'ALTER TABLE deliveries ADD COLUMN data_emissao TEXT',
    'ALTER TABLE deliveries ADD COLUMN uf TEXT',
    'ALTER TABLE deliveries ADD COLUMN cep TEXT',
    'ALTER TABLE deliveries ADD COLUMN peso_liquido REAL',
    'ALTER TABLE deliveries ADD COLUMN valor_nf REAL',
    'ALTER TABLE deliveries ADD COLUMN valor_produtos REAL',
    'ALTER TABLE deliveries ADD COLUMN quantidade_volumes REAL',
    'ALTER TABLE deliveries ADD COLUMN produtos_json TEXT',
  ];

  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* coluna já existe */ }
  }

  // Seed admin padrão
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    `INSERT OR IGNORE INTO users (nome, username, password_hash, role) VALUES (?, ?, ?, ?)`
  ).run('Administrador', 'admin', adminHash, 'admin');

  console.log('Database schema initialized successfully.');
}

if (require.main === module) {
  initSchema();
  process.exit(0);
}
