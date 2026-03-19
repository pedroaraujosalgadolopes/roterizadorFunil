import pdfParse from 'pdf-parse';

export interface ExtractedPdfData {
  bairro_distrito: string | null;
  municipio: string | null;
  peso_bruto: number | null;
}

export async function extractPdfContent(buffer: Buffer): Promise<ExtractedPdfData> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;

    const bairro = extractBairro(text);
    const municipio = extractMunicipio(text);
    const peso = extractPesoBruto(text);

    return { bairro_distrito: bairro, municipio, peso_bruto: peso };
  } catch (err) {
    console.error('PDF parse error:', err);
    return { bairro_distrito: null, municipio: null, peso_bruto: null };
  }
}

function extractBairro(text: string): string | null {
  const regex1 = /bairro[\/\s]*distrito[:\s]*([^\n\r]+)/i;
  const regex2 = /bairro[:\s]*([^\n\r]+)/i;

  const match = text.match(regex1) || text.match(regex2);
  if (!match) return null;

  const value = match[1].trim();
  return value.length > 0 ? value.substring(0, 100) : null;
}

function extractMunicipio(text: string): string | null {
  const regex = /munic[íi]pio[:\s]*([^\n\r]+)/i;
  const match = text.match(regex);
  if (!match) return null;

  const value = match[1].trim();
  return value.length > 0 ? value.substring(0, 100) : null;
}

function extractPesoBruto(text: string): number | null {
  const regex = /peso\s*bruto[:\s]*([\d.,]+)/i;
  const match = text.match(regex);
  if (!match) return null;

  const raw = match[1].replace(/\./g, '').replace(',', '.');
  const num = parseFloat(raw);
  return isNaN(num) ? null : num;
}
