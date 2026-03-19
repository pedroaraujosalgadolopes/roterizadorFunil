# Arquitetura Técnica — Roteirizador CPFL Funil

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | Tailwind CSS (tema CPFL) |
| Estado global | Zustand |
| Backend | Node.js + Express + TypeScript |
| Banco de dados | SQLite via better-sqlite3 |
| Parsing XML | fast-xml-parser |
| Parsing PDF | pdf-parse |
| Imagens | sharp (thumbnails de canhotos) |
| Drag-and-drop | @dnd-kit/sortable |

---

## Estrutura de Pastas

```
delivery-manager/
├── docs/                        ← Documentação
│   ├── MANUAL.md
│   └── ARQUITETURA.md
├── frontend/
│   ├── public/
│   │   └── logo-cpfl.jpeg
│   └── src/
│       ├── api/                 ← Funções de chamada à API
│       │   ├── client.ts        ← Axios base
│       │   ├── pdfs.ts          ← Extração de arquivos
│       │   ├── trips.ts         ← Viagens
│       │   ├── deliveries.ts    ← Entregas
│       │   ├── admin.ts         ← Dashboard
│       │   └── status.ts        ← Status público
│       ├── components/          ← Componentes reutilizáveis
│       │   ├── Sidebar.tsx
│       │   ├── Layout.tsx
│       │   ├── UploadZone.tsx
│       │   ├── ExtractionPreview.tsx
│       │   ├── DeliveryTable.tsx
│       │   ├── RouteView.tsx
│       │   ├── CanhotoUploader.tsx
│       │   ├── CanhotoModal.tsx
│       │   ├── ProdutosModal.tsx
│       │   └── Toast.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx    ← Painel admin
│       │   ├── NewTrip.tsx      ← Upload + confirmação
│       │   ├── Deliveries.tsx   ← Tabela de entregas
│       │   ├── Routes.tsx       ← Roteirização
│       │   ├── History.tsx      ← Histórico de viagens
│       │   └── StatusDisprol.tsx ← Status para clientes
│       └── store/
│           └── useAppStore.ts   ← Estado global (Zustand)
└── backend/
    ├── src/
    │   ├── db/
    │   │   ├── database.ts      ← Conexão SQLite (singleton)
    │   │   └── schema.ts        ← Criação de tabelas + migrações
    │   ├── routes/
    │   │   ├── pdfs.ts          ← POST /api/pdfs/extract
    │   │   ├── trips.ts         ← CRUD de viagens
    │   │   ├── deliveries.ts    ← CRUD de entregas + canhoto
    │   │   ├── admin.ts         ← GET /api/admin/stats
    │   │   └── status.ts        ← GET /api/status (público)
    │   ├── services/
    │   │   ├── xmlExtractor.ts  ← Parser NF-e XML
    │   │   ├── pdfExtractor.ts  ← Parser DANFE PDF (fallback)
    │   │   └── fileNameParser.ts ← Parser de nome de arquivo
    │   ├── middleware/
    │   │   └── errorHandler.ts
    │   └── server.ts
    ├── uploads/                 ← Canhotos salvos em disco
    └── deliveries.db            ← Banco SQLite
```

---

## Banco de Dados

### Tabela `trips`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INTEGER PK | Identificador da viagem |
| nome | TEXT | Nome descritivo da viagem |
| data_criacao | TEXT | Data/hora de criação (UTC) |

### Tabela `deliveries`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INTEGER PK | Identificador da entrega |
| trip_id | INTEGER FK | Viagem associada |
| numero_cliente | TEXT | CNPJ/CPF do destinatário |
| nome_destinatario | TEXT | Razão social do destinatário |
| numero_nf | TEXT | Número da nota fiscal |
| serie_nf | TEXT | Série da NF |
| data_emissao | TEXT | Data de emissão da NF |
| bairro_distrito | TEXT | Bairro do destinatário |
| municipio | TEXT | Município do destinatário |
| uf | TEXT | Estado do destinatário |
| cep | TEXT | CEP do destinatário |
| peso_bruto | REAL | Peso bruto em kg |
| peso_liquido | REAL | Peso líquido em kg |
| valor_nf | REAL | Valor total da NF (R$) |
| valor_produtos | REAL | Valor dos produtos (R$) |
| quantidade_volumes | REAL | Número de volumes |
| produtos_json | TEXT | JSON com itens da nota |
| status | TEXT | pendente / entregue / problema |
| canhoto_path | TEXT | Caminho relativo da foto do canhoto |
| canhoto_thumb_path | TEXT | Caminho da miniatura (WebP) |
| data_criacao | TEXT | Data/hora de criação |
| data_entrega | TEXT | Data/hora de confirmação de entrega |

---

## API REST

### Extração de arquivos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/pdfs/extract` | Extrai dados de XMLs ou PDFs (sem salvar) |
| POST | `/api/pdfs/debug-xml` | Debug: retorna dados brutos do XML |

### Viagens
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/trips` | Lista viagens com estatísticas |
| POST | `/api/trips` | Cria viagem + salva entregas (transação) |
| GET | `/api/trips/:id/summary` | Agrupamento por município/bairro |

### Entregas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/deliveries?trip_id=X` | Lista entregas com filtros |
| PATCH | `/api/deliveries/:id` | Atualiza campos ou status |
| POST | `/api/deliveries/:id/canhoto` | Upload de canhoto + muda status |
| DELETE | `/api/deliveries/:id` | Remove entrega e arquivos |

### Admin e Status
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/stats` | Estatísticas gerais para o dashboard |
| GET | `/api/status?trip_id=X` | Status simplificado (para clientes) |
| GET | `/api/status/produtos/:id` | Lista de produtos de uma entrega |

### Arquivos estáticos
- `GET /uploads/*` — serve os canhotos salvos em disco

---

## Extração de XML (NF-e)

O parser usa `fast-xml-parser` com `removeNSPrefix: true` para ignorar namespaces e `isArray: (name) => name === 'det'` para garantir que os itens da nota sejam sempre um array.

Suporta dois formatos de NF-e:
- `nfeProc > NFe > infNFe` (NF-e processada pela SEFAZ)
- `NFe > infNFe` (NF-e direta)

O parser numérico lida com os formatos brasileiros:
- `4.320,500` → 4320.5
- `4320,500` → 4320.5
- `4.320` (3 decimais) → 4320
- `4320.500` → 4320.5

---

## Armazenamento de Canhotos

```
backend/uploads/
  {trip_id}/
    nf_{delivery_id}_{timestamp}.jpg
    thumb_nf_{delivery_id}_{timestamp}.webp   ← 200×200px, gerado pelo sharp
```

Os caminhos são salvos relativos à raiz do backend e servidos via `/uploads/*`.

---

## Cálculo do Frete

Taxa fixa de **7% sobre o valor total das NFs**. Definida como constante `TAXA_FRETE = 0.07` nos arquivos:
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/History.tsx`
- `frontend/src/components/DeliveryTable.tsx`

Para alterar a taxa, basta modificar o valor nessas três constantes.
