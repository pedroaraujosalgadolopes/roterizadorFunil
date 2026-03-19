import { useEffect, useState } from 'react';
import { X, Package, Loader2 } from 'lucide-react';
import { fetchProdutos, type ProdutoItem } from '../api/status';

interface Props {
  deliveryId: number;
  nf: string;
  destinatario: string | null;
  onClose: () => void;
}

const BRL = (v: number | null) =>
  v !== null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';

export default function ProdutosModal({ deliveryId, nf, destinatario, onClose }: Props) {
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProdutos(deliveryId)
      .then(d => setProdutos(d.produtos))
      .finally(() => setLoading(false));
  }, [deliveryId]);

  const totalValor = produtos.reduce((s, p) => s + (p.valor_total ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Package className="text-cpfl-blue" size={20} />
            <div>
              <p className="font-semibold text-gray-100">Produtos — NF {nf}</p>
              {destinatario && <p className="text-xs text-gray-500">{destinatario}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-cpfl-blue" size={32} />
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              Nenhum produto extraído desta nota
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">NCM</th>
                  <th className="px-4 py-3 text-right">Qtd</th>
                  <th className="px-4 py-3 text-left">Un</th>
                  <th className="px-4 py-3 text-right">Vl Unit</th>
                  <th className="px-4 py-3 text-right">Vl Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {produtos.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-800/50">
                    <td className="px-4 py-2.5 font-mono text-gray-400 text-xs">{p.codigo || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-200">{p.descricao || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{p.ncm || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-gray-300">
                      {p.quantidade !== null ? p.quantidade.toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{p.unidade || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400">{BRL(p.valor_unitario)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-200">{BRL(p.valor_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && produtos.length > 0 && (
          <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{produtos.length} item{produtos.length > 1 ? 's' : ''}</span>
            <span className="text-sm font-bold text-gray-200">Total: {BRL(totalValor)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
