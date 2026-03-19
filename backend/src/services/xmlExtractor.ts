import { XMLParser } from 'fast-xml-parser';

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

export interface ExtractedXmlData {
  numero_nf: string | null;
  serie_nf: string | null;
  data_emissao: string | null;
  numero_cliente: string | null;
  nome_destinatario: string | null;
  bairro_distrito: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  peso_bruto: number | null;
  peso_liquido: number | null;
  valor_nf: number | null;
  valor_produtos: number | null;
  quantidade_volumes: number | null;
  produtos: ProdutoItem[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseTagValue: true,
  parseAttributeValue: true,
  isArray: (name) => name === 'det', // det é sempre array
});

export function extractXmlContent(buffer: Buffer): ExtractedXmlData {
  try {
    const parsed = parser.parse(buffer.toString('utf-8'));

    const nfe =
      parsed?.nfeProc?.NFe?.infNFe ??
      parsed?.NFe?.infNFe ??
      parsed?.nfeProc?.nfe?.infNFe ??
      null;

    if (!nfe) {
      console.warn('infNFe não encontrado no XML');
      return emptyResult();
    }

    const ide    = nfe.ide   ?? {};
    const dest   = nfe.dest  ?? {};
    const ender  = dest.enderDest ?? {};
    const transp = nfe.transp ?? {};
    const total  = nfe.total?.ICMSTot ?? {};

    // Peso bruto: soma de todos os volumes
    let pesoBruto: number | null = null;
    let pesoLiquido: number | null = null;
    let qtdVolumes: number | null = null;
    const vols = transp.vol;
    if (vols) {
      const volArr = Array.isArray(vols) ? vols : [vols];
      let sumB = 0, sumL = 0, sumQ = 0;
      for (const v of volArr) {
        const pb = num(v.pesoB);
        const pl = num(v.pesoL);
        sumB += pb ?? 0;
        sumL += pl ?? 0;
        sumQ += num(v.qVol) ?? 0;
      }
      pesoBruto   = sumB > 0 ? sumB : null;
      pesoLiquido = sumL > 0 ? sumL : null;
      qtdVolumes  = sumQ > 0 ? sumQ : null;
    }

    // Produtos (itens da nota)
    const detArr: any[] = Array.isArray(nfe.det) ? nfe.det : (nfe.det ? [nfe.det] : []);
    const produtos: ProdutoItem[] = detArr.map((det: any) => {
      const p = det.prod ?? {};
      return {
        codigo:         str(p.cProd),
        descricao:      str(p.xProd),
        ncm:            str(p.NCM),
        cfop:           str(p.CFOP),
        unidade:        str(p.uCom ?? p.uTrib),
        quantidade:     num(p.qCom ?? p.qTrib),
        valor_unitario: num(p.vUnCom ?? p.vUnTrib),
        valor_total:    num(p.vProd),
      };
    });

    return {
      numero_nf:           str(ide.nNF),
      serie_nf:            str(ide.serie),
      data_emissao:        str(ide.dhEmi ?? ide.dEmi),
      numero_cliente:      str(dest.CNPJ ?? dest.CPF),
      nome_destinatario:   str(dest.xNome),
      bairro_distrito:     str(ender.xBairro),
      municipio:           str(ender.xMun),
      uf:                  str(ender.UF),
      cep:                 str(ender.CEP),
      peso_bruto:          pesoBruto,
      peso_liquido:        pesoLiquido,
      valor_nf:            num(total.vNF),
      valor_produtos:      num(total.vProd),
      quantidade_volumes:  qtdVolumes,
      produtos,
    };
  } catch (err) {
    console.error('XML parse error:', err);
    return emptyResult();
  }
}

function str(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

function num(val: unknown): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let s = String(val).trim();
  if (!s) return null;

  // "4.320,500" → 4320.5
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  // "4320,500" → 4320.5
  else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  // "4.320" com exatamente 3 decimais → milhar BR → 4320
  else if (/^\d+\.\d{3}$/.test(s)) {
    s = s.replace('.', '');
  }

  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function emptyResult(): ExtractedXmlData {
  return {
    numero_nf: null, serie_nf: null, data_emissao: null,
    numero_cliente: null, nome_destinatario: null,
    bairro_distrito: null, municipio: null, uf: null, cep: null,
    peso_bruto: null, peso_liquido: null,
    valor_nf: null, valor_produtos: null, quantidade_volumes: null,
    produtos: [],
  };
}
