import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { extractPdfContent } from '../services/pdfExtractor';
import { extractXmlContent } from '../services/xmlExtractor';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// DEBUG: texto bruto do PDF
router.post('/debug', upload.single('pdf'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const data = await pdfParse(req.file.buffer);
    return res.json({ text: data.text, numPages: data.numpages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DEBUG: dados brutos do XML
router.post('/debug-xml', upload.single('xml'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const result = extractXmlContent(req.file.buffer);
  return res.json(result);
});

router.post('/extract', upload.array('files', 200), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = await Promise.all(
    files.map(async (file) => {
      if (isXmlFile(file)) {
        const xml = extractXmlContent(file.buffer);
        return {
          originalName: file.originalname,
          source: 'xml' as const,
          patternMatched: true,
          numero_cliente:      xml.numero_cliente,
          nome_destinatario:   xml.nome_destinatario,
          numero_nf:           xml.numero_nf,
          serie_nf:            xml.serie_nf,
          data_emissao:        xml.data_emissao,
          bairro_distrito:     xml.bairro_distrito,
          municipio:           xml.municipio,
          uf:                  xml.uf,
          cep:                 xml.cep,
          peso_bruto:          xml.peso_bruto,
          peso_liquido:        xml.peso_liquido,
          valor_nf:            xml.valor_nf,
          valor_produtos:      xml.valor_produtos,
          quantidade_volumes:  xml.quantidade_volumes,
          produtos:            xml.produtos,
        };
      } else {
        // PDF: extrai conteúdo via regex
        const fromContent = await extractPdfContent(file.buffer);
        return {
          originalName: file.originalname,
          source: 'pdf' as const,
          patternMatched: false,
          numero_cliente:      null,
          nome_destinatario:   null,
          numero_nf:           null,
          serie_nf:            null,
          data_emissao:        null,
          bairro_distrito:     fromContent.bairro_distrito,
          municipio:           fromContent.municipio,
          uf:                  null,
          cep:                 null,
          peso_bruto:          fromContent.peso_bruto,
          peso_liquido:        null,
          valor_nf:            null,
          valor_produtos:      null,
          quantidade_volumes:  null,
        };
      }
    })
  );

  return res.json({ results });
});

function isXmlFile(file: Express.Multer.File): boolean {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.xml')) return true;
  if (file.mimetype.toLowerCase().includes('xml')) return true;
  const start = file.buffer.slice(0, 10).toString('utf-8').trimStart();
  return start.startsWith('<');
}

export default router;
