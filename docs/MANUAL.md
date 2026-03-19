# Manual do Usuário — Roteirizador CPFL Funil

## Visão Geral

O Roteirizador é um sistema interno da CPFL Funil para gerenciar e organizar entregas a partir de notas fiscais eletrônicas. Ele é usado pela equipe operacional para montar roteiros de entrega e registrar comprovantes (canhotos), e pode ser compartilhado com clientes (como a Disprol) para acompanhamento de status.

---

## Fluxo Principal

### 1. Nova Viagem

1. Acesse **Nova Viagem** no menu lateral
2. Arraste os arquivos **XML das NF-e** para a área de upload
3. O sistema lê cada nota automaticamente
4. Revise os dados na tabela de confirmação:
   - Campos em **amarelo** não foram lidos e precisam ser preenchidos manualmente
   - Todos os outros campos são editáveis antes de salvar
5. Digite o **nome da viagem** (ex: "SP Centro — 19/03/2026")
6. Clique em **Confirmar e Salvar Viagem**

> A viagem não é salva no banco enquanto você não confirmar. Você pode corrigir qualquer dado antes de salvar.

---

### 2. Entregas

Após salvar a viagem, você vai direto para a tabela de entregas. Aqui você pode:

- **Ordenar** por qualquer coluna (clique no cabeçalho)
- **Filtrar** por status ou município
- **Alterar o status** de cada entrega diretamente na tabela:
  - `Pendente` — ainda não entregue
  - `Entregue` — entregue com sucesso
  - `Problema` — ocorreu algum imprevisto
- **Ver produtos** da nota (ícone de carrinho 🛒)
- **Registrar canhoto** (ícone de câmera 📷) — ao enviar a foto, o status muda automaticamente para Entregue
- **Excluir** entregas com confirmação

O resumo no topo mostra: total de notas, peso total, valor das NFs, frete total (7%), frete recebido e frete pendente.

---

### 3. Roteiro

A aba **Roteiro** organiza automaticamente as entregas por:

```
Município
  └── Bairro
        └── Lista de NFs
```

- Clique em um município para expandir os bairros
- **Arraste os municípios** para reordenar a sequência de visita
- Clique em **Exportar Roteiro** para baixar um arquivo de texto com a lista ordenada

---

### 4. Dashboard

Painel com estatísticas consolidadas de todas as viagens:

- Total de viagens, notas, municípios e peso
- Valor total das NFs e frete a receber (7%)
- Progresso geral de entregas (entregues / pendentes / problemas)
- Top 10 municípios com mais entregas
- Viagens recentes com clique direto para ver as entregas

---

### 5. Status Entregas

Tela simplificada para compartilhar com clientes (ex: Disprol). Mostra apenas:

- Número da NF
- Nome do destinatário
- Município / UF
- Status (Entregue / Pendente / Problema)
- Data e hora da entrega
- **Foto do canhoto** (clique na miniatura para ampliar) como comprovante

Possui filtro por viagem e busca livre por NF, destinatário ou cidade.

---

### 6. Histórico

Lista de todas as viagens registradas, com:

- Data de criação
- Total de notas e cidades
- Frete estimado (7% do valor das NFs)
- Percentual de entregas concluídas

Clique em uma viagem para ir direto para as entregas dela.

---

## Registro de Canhoto

1. Na tabela de Entregas, clique no ícone de câmera (📷) na linha da entrega
2. Selecione a foto do canhoto assinado (JPG, PNG, HEIC ou PDF)
3. O sistema salva a imagem, gera uma miniatura e muda o status para **Entregue**
4. A miniatura fica visível na tabela — clique para ver em tamanho maior
5. A foto também aparece na página **Status Entregas** como comprovante para o cliente

---

## Cálculo do Frete

O valor recebido pela CPFL Funil é calculado como **7% do valor total das NFs entregues**.

| Indicador | Cálculo |
|---|---|
| Frete total da carga | Soma dos valores das NFs × 7% |
| Frete já recebido | Soma das NFs com status "Entregue" × 7% |
| Frete pendente | Soma das NFs com status "Pendente" × 7% |

---

## Dicas

- Você pode usar a mesma viagem para múltiplas fábricas — basta nomear claramente (ex: "Disprol — Lote 03 — 19/03")
- Para corrigir dados de uma entrega após salvar, clique no campo desejado na tabela de Entregas
- Se um XML não tiver bairro cadastrado, o campo fica em amarelo mas não impede de salvar
