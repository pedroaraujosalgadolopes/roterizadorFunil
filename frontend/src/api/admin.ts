import api from './client';

export interface AdminStats {
  geral: {
    total_viagens: number;
    total_notas: number;
    total_cidades: number;
    total_peso: number;
    total_valor: number;
    total_entregues: number;
    total_pendentes: number;
    total_problemas: number;
    valor_entregue: number;
    valor_pendente: number;
  };
  top_cidades: {
    municipio: string;
    uf: string | null;
    total_notas: number;
    total_peso: number;
    total_valor: number;
    entregues: number;
  }[];
  viagens_recentes: {
    id: number;
    nome: string;
    data_criacao: string;
    total_notas: number;
    total_cidades: number;
    total_peso: number;
    total_valor: number;
    percentual_entregue: number;
  }[];
  status_por_viagem: {
    id: number;
    nome: string;
    entregues: number;
    pendentes: number;
    problemas: number;
  }[];
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await api.get<AdminStats>('/admin/stats');
  return res.data;
}
