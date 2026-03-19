import api from './client';

export interface Delivery {
  id: number;
  trip_id: number;
  numero_cliente: string | null;
  nome_destinatario: string | null;
  numero_nf: string;
  serie_nf: string | null;
  data_emissao: string | null;
  bairro_distrito: string | null;
  municipio: string;
  uf: string | null;
  cep: string | null;
  peso_bruto: number | null;
  peso_liquido: number | null;
  valor_nf: number | null;
  valor_produtos: number | null;
  quantidade_volumes: number | null;
  status: 'pendente' | 'entregue' | 'problema';
  canhoto_path: string | null;
  canhoto_thumb_path: string | null;
  data_criacao: string;
  data_entrega: string | null;
}

export async function fetchDeliveries(params: { trip_id?: number; status?: string; municipio?: string } = {}): Promise<Delivery[]> {
  const res = await api.get<Delivery[]>('/deliveries', { params });
  return res.data;
}

export async function updateDelivery(id: number, data: Partial<Delivery>): Promise<Delivery> {
  const res = await api.patch<Delivery>(`/deliveries/${id}`, data);
  return res.data;
}

export async function uploadCanhoto(id: number, file: File): Promise<Delivery> {
  const form = new FormData();
  form.append('canhoto', file);
  const res = await api.post<Delivery>(`/deliveries/${id}/canhoto`, form);
  return res.data;
}

export async function deleteDelivery(id: number): Promise<void> {
  await api.delete(`/deliveries/${id}`);
}
