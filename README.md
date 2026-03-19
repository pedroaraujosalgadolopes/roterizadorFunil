# CPFL Funil — Roteirizador de Entregas

Sistema web completo para gerenciamento e roteirização de entregas a partir de notas fiscais eletrônicas (NF-e XML).

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
cd delivery-manager
npm run install:all
```

## Rodando em desenvolvimento

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

Deixe o terminal aberto enquanto estiver usando o sistema.

## Arquivos aceitos

- **XML da NF-e** (recomendado) — extração 100% automática de todos os campos
- **PDF DANFE** — extração parcial via regex (fallback)

## Campos extraídos do XML automaticamente

| Campo | Origem no XML |
|---|---|
| Número da NF | `ide/nNF` |
| Série | `ide/serie` |
| Data de emissão | `ide/dhEmi` |
| CNPJ/CPF destinatário | `dest/CNPJ` ou `dest/CPF` |
| Nome destinatário | `dest/xNome` |
| Bairro | `dest/enderDest/xBairro` |
| Município | `dest/enderDest/xMun` |
| UF | `dest/enderDest/UF` |
| CEP | `dest/enderDest/CEP` |
| Peso bruto | `transp/vol/pesoB` |
| Peso líquido | `transp/vol/pesoL` |
| Valor total da NF | `total/ICMSTot/vNF` |
| Produtos/itens | `det/prod` |

## Backup do banco de dados

```bash
cp backend/deliveries.db backend/deliveries.backup.$(date +%Y%m%d).db
```

## Documentação completa

Ver `docs/MANUAL.md` e `docs/ARQUITETURA.md`.
