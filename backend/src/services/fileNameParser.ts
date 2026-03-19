export interface ParsedFileName {
  numero_cliente: string | null;
  numero_nf: string | null;
  patternMatched: boolean;
}

export function parseFileName(fileName: string): ParsedFileName {
  const regex = /CLIENTE\s+(\d+)\s+NOTA\s+(\d+)\.pdf/i;
  const match = fileName.match(regex);

  if (!match) {
    return { numero_cliente: null, numero_nf: null, patternMatched: false };
  }

  return {
    numero_cliente: match[1],
    numero_nf: match[2],
    patternMatched: true,
  };
}
