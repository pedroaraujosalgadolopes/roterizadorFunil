# Guia de Operação — Roteirizador CPFL Funil

## Iniciando o sistema

Abra o Terminal, cole o comando abaixo e pressione Enter:

```bash
cd "/Users/pedrodearaujosalgadolopes/Desktop/CPFL/Sistema de roterizacao/delivery-manager" && npm run dev
```

Aguarde aparecer:
```
Backend running on http://localhost:3001
VITE ready in ... ms  →  Local: http://localhost:5173/
```

Abra o Safari e acesse: **http://localhost:5173**

> Mantenha o terminal aberto enquanto usar o sistema. Ao fechar o terminal, o sistema para.

---

## Parando o sistema

No terminal onde o sistema está rodando, pressione **Ctrl + C**.

---

## Backup do banco de dados

O banco de dados fica em `backend/deliveries.db`. Para fazer backup:

```bash
cp "/Users/pedrodearaujosalgadolopes/Desktop/CPFL/Sistema de roterizacao/delivery-manager/backend/deliveries.db" \
   "/Users/pedrodearaujosalgadolopes/Desktop/CPFL/backup_$(date +%Y%m%d_%H%M).db"
```

Recomendado: fazer backup antes de grandes importações de XMLs.

---

## Backup dos canhotos

As fotos ficam em `backend/uploads/`. Para copiar tudo:

```bash
cp -r "/Users/pedrodearaujosalgadolopes/Desktop/CPFL/Sistema de roterizacao/delivery-manager/backend/uploads" \
      "/Users/pedrodearaujosalgadolopes/Desktop/CPFL/backup_uploads_$(date +%Y%m%d)"
```

---

## Problemas comuns

### "Não consegui conectar em localhost:5173"

O sistema não está rodando. Abra o terminal e rode `npm run dev` (ver acima).

### "Cannot GET /" no navegador

Você acessou `localhost:3001` (backend). O endereço correto é **localhost:5173**.

### Peso ou valor vieram errados

Use a rota de debug para ver o que está no XML:

```bash
curl -X POST http://localhost:3001/api/pdfs/debug-xml \
  -F "xml=@/caminho/para/nota.xml"
```

Verifique o campo `pesoB` no resultado. Se o valor estiver correto no XML mas errado no sistema, abra uma issue.

### Campo em amarelo após importar XML

O campo não foi encontrado naquele XML específico. Preencha manualmente antes de confirmar a viagem. Pode indicar que o emitente usa um layout de XML diferente do padrão.

---

## Adicionando suporte a mais de uma fábrica

O sistema já está preparado para múltiplos clientes/fábricas. Basta:

1. Ao criar a viagem, incluir o nome da fábrica no nome da viagem (ex: "Disprol — Lote 05 — 19/03")
2. Na página **Status Entregas**, o filtro por viagem permite selecionar apenas as notas de um cliente específico
3. Compartilhe a URL `http://localhost:5173/status` com o cliente para acompanhamento

---

## Alterando a taxa de frete

A taxa atual é **7%**. Para alterar, edite a constante `TAXA_FRETE` nos arquivos:

```
frontend/src/pages/Dashboard.tsx       → linha 10
frontend/src/pages/History.tsx          → linha 8
frontend/src/components/DeliveryTable.tsx → linha 31
```

Altere `0.07` para o novo valor (ex: `0.08` para 8%).
