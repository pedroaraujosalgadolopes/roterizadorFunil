import api from './client';

export interface Trip {
  id: number;
  nome: string;
  data_criacao: string;
  total_notas: number;
  total_peso: number;
  total_valor: number;
  total_cidades: number;
  percentual_entregue: number;
}

export interface TripSummaryGroup {
  municipio: string;
  uf: string | null;
  total_notas: number;
  total_peso: number;
  total_valor: number;
  bairros: {
    bairro: string;
    total_notas: number;
    total_peso: number;
    total_valor: number;
    entregas: any[];
  }[];
}

export async function fetchTrips(): Promise<Trip[]> {
  const res = await api.get<Trip[]>('/trips');
  return res.data;
}

export async function fetchTripSummary(id: number): Promise<{ trip: Trip; summary: TripSummaryGroup[] }> {
  const res = await api.get(`/trips/${id}/summary`);
  return res.data;
}

export async function createTrip(nome: string, deliveries: any[]): Promise<Trip> {
  const res = await api.post<Trip>('/trips', { nome, deliveries });
  return res.data;
}
