import api from './client';

export interface StatusDelivery {
  id: number;
  numero_nf: string;
  nome_destinatario: string | null;
  municipio: string;
  uf: string | null;
  status: 'pendente' | 'entregue' | 'problema';
  data_entrega: string | null;
  canhoto_path: string | null;
  canhoto_thumb_path: string | null;
  viagem?: string;
}

export interface StatusTrip {
  id: number;
  nome: string;
  data_criacao: string;
}

export interface ProdutoItem {
  codigo: string | null;
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  unidade: string | null;
  quantidade: number | null;
  valor_unitario: number | null;
  valor_total: number | null;
}

export async function fetchStatus(trip_id?: number): Promise<{ trips: StatusTrip[]; deliveries: StatusDelivery[] }> {
  const res = await api.get('/status', { params: trip_id ? { trip_id } : {} });
  return res.data;
}

export async function fetchProdutos(deliveryId: number): Promise<{ numero_nf: string; nome_destinatario: string; produtos: ProdutoItem[] }> {
  const res = await api.get(`/status/produtos/${deliveryId}`);
  return res.data;
}
