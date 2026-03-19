import api from './client';

export interface ExtractedRow {
  originalName: string;
  source: 'xml' | 'pdf';
  patternMatched: boolean;
  numero_cliente: string | null;
  nome_destinatario: string | null;
  numero_nf: string | null;
  serie_nf: string | null;
  data_emissao: string | null;
  bairro_distrito: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  peso_bruto: number | null;
  peso_liquido: number | null;
  valor_nf: number | null;
  valor_produtos: number | null;
  quantidade_volumes: number | null;
  produtos?: { codigo: string | null; descricao: string | null; ncm: string | null; cfop: string | null; unidade: string | null; quantidade: number | null; valor_unitario: number | null; valor_total: number | null; }[];
}

export async function extractFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<ExtractedRow[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  if (onProgress) onProgress(0, files.length);

  const res = await api.post<{ results: ExtractedRow[] }>('/pdfs/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onProgress)
        onProgress(Math.round((e.loaded / e.total) * files.length), files.length);
    },
  });
  return res.data.results;
}
