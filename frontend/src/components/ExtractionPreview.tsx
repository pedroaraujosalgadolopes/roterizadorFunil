import { useState } from 'react';
import { AlertTriangle, CheckCircle, Save } from 'lucide-react';
import type { ExtractedRow } from '../api/pdfs';

interface EditableRow extends ExtractedRow { _key: string; }

interface Props {
  rows: ExtractedRow[];
  onConfirm: (rows: ExtractedRow[], tripName: string) => void;
  loading: boolean;
}

const BRL = (v: number | null) =>
  v !== null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null;

export default function ExtractionPreview({ rows, onConfirm, loading }: Props) {
  const [editRows, setEditRows] = useState<EditableRow[]>(
    rows.map((r, i) => ({ ...r, _key: `${i}-${r.originalName}` }))
  );
  const [tripName, setTripName] = useState('');

  const update = (key: string, field: keyof ExtractedRow, value: string) => {
    setEditRows((prev) =>
      prev.map((r) =>
        r._key === key
          ? {
              ...r,
              [field]: ['peso_bruto', 'peso_liquido', 'valor_nf', 'valor_produtos', 'quantidade_volumes'].includes(field)
                ? (value === '' ? null : parseFloat(value.replace(',', '.')))
                : value || null,
            }
          : r
      )
    );
  };

  const attentionCount = editRows.filter((r) => !r.municipio || !r.numero_nf).length;
  const canSave = editRows.every((r) => r.municipio && r.numero_nf) && tripName.trim().length > 0;
  const xmlCount = editRows.filter((r) => r.source === 'xml').length;
  const pdfCount = editRows.filter((r) => r.source === 'pdf').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-300 text-sm">
            <span className="font-bold text-white">{editRows.length}</span> notas lidas
          </span>
          {xmlCount > 0 && (
            <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
              {xmlCount} XML
            </span>
          )}
          {pdfCount > 0 && (
            <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              {pdfCount} PDF
            </span>
          )}
          {attentionCount > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-400 text-sm">
              <AlertTriangle size={15} />
              {attentionCount} campo{attentionCount > 1 ? 's precisam' : ' precisa'} de atenção
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle size={15} /> Tudo pronto
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Nome da viagem (ex: SP Centro — 18/03)"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 w-72 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={() => onConfirm(editRows, tripName.trim())}
            disabled={!canSave || loading}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Save size={16} />
            Confirmar e Salvar Viagem
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-400 uppercase text-xs">
              <th className="px-3 py-3 text-left">Fonte</th>
              <th className="px-3 py-3 text-left">NF</th>
              <th className="px-3 py-3 text-left">Série</th>
              <th className="px-3 py-3 text-left">Destinatário</th>
              <th className="px-3 py-3 text-left">CNPJ/CPF</th>
              <th className="px-3 py-3 text-left">Município</th>
              <th className="px-3 py-3 text-left">UF</th>
              <th className="px-3 py-3 text-left">Bairro</th>
              <th className="px-3 py-3 text-left">Peso kg</th>
              <th className="px-3 py-3 text-left">Valor NF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {editRows.map((row) => (
              <tr key={row._key} className="bg-gray-950 hover:bg-gray-900/50">
                {/* Fonte */}
                <td className="px-3 py-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    row.source === 'xml' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {(row.source ?? 'pdf').toUpperCase()}
                  </span>
                </td>
                <Cell value={row.numero_nf} warn={!row.numero_nf} required onChange={(v) => update(row._key, 'numero_nf', v)} />
                <Cell value={row.serie_nf} onChange={(v) => update(row._key, 'serie_nf', v)} />
                <td className="px-3 py-1.5 text-gray-400 text-xs max-w-[160px] truncate" title={row.nome_destinatario ?? ''}>
                  {row.nome_destinatario || '—'}
                </td>
                <Cell value={row.numero_cliente} onChange={(v) => update(row._key, 'numero_cliente', v)} mono />
                <Cell value={row.municipio} warn={!row.municipio} required onChange={(v) => update(row._key, 'municipio', v)} />
                <Cell value={row.uf} onChange={(v) => update(row._key, 'uf', v)} small />
                <Cell value={row.bairro_distrito} warn={!row.bairro_distrito} onChange={(v) => update(row._key, 'bairro_distrito', v)} />
                <Cell
                  value={row.peso_bruto !== null ? String(row.peso_bruto) : null}
                  warn={!row.peso_bruto}
                  onChange={(v) => update(row._key, 'peso_bruto', v)}
                  small
                />
                <td className="px-3 py-1.5 text-gray-300 text-xs whitespace-nowrap">
                  {BRL(row.valor_nf) ?? <span className="text-gray-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({
  value, warn, required, onChange, mono, small,
}: {
  value: string | null; warn?: boolean; required?: boolean;
  onChange: (v: string) => void; mono?: boolean; small?: boolean;
}) {
  return (
    <td className="px-3 py-1.5">
      <div className="relative">
        {warn && <AlertTriangle className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" size={11} />}
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={required ? '⚠️' : '—'}
          className={`rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-500 ${small ? 'w-16' : 'w-full'} ${mono ? 'font-mono' : ''} ${
            warn
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-200 pl-6'
              : 'bg-gray-800 border border-transparent hover:border-gray-700 text-gray-100'
          }`}
        />
      </div>
    </td>
  );
}
