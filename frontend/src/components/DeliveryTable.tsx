import { useState } from 'react';
import { Trash2, ChevronUp, ChevronDown, AlertTriangle, ShoppingCart } from 'lucide-react';
import ProdutosModal from './ProdutosModal';
import type { Delivery } from '../api/deliveries';
import { updateDelivery, deleteDelivery } from '../api/deliveries';
import { useAppStore } from '../store/useAppStore';
import CanhotoUploader from './CanhotoUploader';
import CanhotoModal from './CanhotoModal';

interface Props {
  deliveries: Delivery[];
  onUpdated: (d: Delivery) => void;
  onDeleted: (id: number) => void;
}

const statusConfig = {
  pendente: { label: 'Pendente', cls: 'bg-gray-700 text-gray-300' },
  entregue: { label: 'Entregue', cls: 'bg-green-500/20 text-green-400' },
  problema: { label: 'Problema', cls: 'bg-red-500/20 text-red-400' },
};

type SortField = keyof Delivery;

const TAXA_FRETE = 0.07;
const BRL = (v: number | null) =>
  v !== null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';

export default function DeliveryTable({ deliveries, onUpdated, onDeleted }: Props) {
  const { addToast } = useAppStore();
  const [sortField, setSortField] = useState<SortField>('municipio');
  const [sortAsc, setSortAsc] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [modalCanhoto, setModalCanhoto] = useState<Delivery | null>(null);
  const [modalProdutos, setModalProdutos] = useState<Delivery | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const sorted = [...deliveries].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    return String(av).localeCompare(String(bv)) * (sortAsc ? 1 : -1);
  });

  const handleStatusChange = async (d: Delivery, status: Delivery['status']) => {
    try { onUpdated(await updateDelivery(d.id, { status })); }
    catch { addToast('error', 'Erro ao atualizar status'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDelivery(id);
      onDeleted(id);
      addToast('success', 'Entrega excluída');
    } catch { addToast('error', 'Erro ao excluir'); }
    finally { setDeleteConfirm(null); }
  };

  const Th = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-3 py-3 text-left text-xs uppercase text-gray-400 cursor-pointer hover:text-gray-200 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortField === field ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null}
      </span>
    </th>
  );

  const totalPeso     = deliveries.reduce((s, d) => s + (d.peso_bruto ?? 0), 0);
  const totalValor    = deliveries.reduce((s, d) => s + (d.valor_nf ?? 0), 0);
  const totalEntregue = deliveries.filter(d => d.status === 'entregue').reduce((s, d) => s + (d.valor_nf ?? 0), 0);

  return (
    <>
      {/* Resumo */}
      <div className="flex flex-wrap gap-6 mb-3 text-sm text-gray-400">
        <span><span className="font-bold text-white">{deliveries.length}</span> notas</span>
        <span>Peso: <span className="font-bold text-white">{totalPeso.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span></span>
        <span>NFs: <span className="font-bold text-white">{BRL(totalValor)}</span></span>
        <span>Frete total <span className="text-gray-600">(7%)</span>: <span className="font-bold text-brand-400">{BRL(totalValor * TAXA_FRETE)}</span></span>
        <span>Frete recebido: <span className="font-bold text-green-400">{BRL(totalEntregue * TAXA_FRETE)}</span></span>
        <span>Frete pendente: <span className="font-bold text-amber-400">{BRL((totalValor - totalEntregue) * TAXA_FRETE)}</span></span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900">
              <Th field="numero_nf"         label="NF" />
              <Th field="serie_nf"          label="Série" />
              <Th field="nome_destinatario" label="Destinatário" />
              <Th field="numero_cliente"    label="CNPJ/CPF" />
              <Th field="municipio"         label="Município" />
              <Th field="uf"                label="UF" />
              <Th field="bairro_distrito"   label="Bairro" />
              <Th field="peso_bruto"        label="Peso kg" />
              <Th field="valor_nf"          label="Valor NF" />
              <Th field="status"            label="Status" />
              <th className="px-3 py-3 text-left text-xs uppercase text-gray-400">Produtos</th>
              <th className="px-3 py-3 text-left text-xs uppercase text-gray-400">Canhoto</th>
              <th className="px-3 py-3 text-left text-xs uppercase text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sorted.map((d) => {
              const sc = statusConfig[d.status];
              const thumbSrc = d.canhoto_thumb_path ? `/${d.canhoto_thumb_path}` : null;

              return (
                <tr key={d.id} className="bg-gray-950 hover:bg-gray-900/60">
                  <td className="px-3 py-2 font-mono text-brand-300 font-semibold whitespace-nowrap">{d.numero_nf}</td>
                  <td className="px-3 py-2 text-gray-500">{d.serie_nf || '—'}</td>
                  <td className="px-3 py-2 text-gray-200 max-w-[180px] truncate" title={d.nome_destinatario ?? ''}>
                    {d.nome_destinatario || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-400 font-mono text-xs whitespace-nowrap">{d.numero_cliente || '—'}</td>
                  <td className="px-3 py-2 text-gray-200 whitespace-nowrap">{d.municipio}</td>
                  <td className="px-3 py-2 text-gray-400">{d.uf || '—'}</td>
                  <td className="px-3 py-2 text-gray-300 max-w-[120px] truncate">
                    {d.bairro_distrito
                      ? d.bairro_distrito
                      : <span className="text-gray-600 flex items-center gap-1">— <AlertTriangle size={11} className="text-amber-500" /></span>
                    }
                  </td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                    {d.peso_bruto !== null ? d.peso_bruto.toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-200 whitespace-nowrap font-medium">
                    {BRL(d.valor_nf)}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d, e.target.value as Delivery['status'])}
                      className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer border-0 ${sc.cls} bg-transparent`}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="entregue">Entregue</option>
                      <option value="problema">Problema</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setModalProdutos(d)}
                      className="text-gray-500 hover:text-cpfl-blue transition-colors"
                      title="Ver produtos"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    {thumbSrc ? (
                      <button onClick={() => setModalCanhoto(d)}>
                        <img
                          src={thumbSrc}
                          alt="canhoto"
                          className="w-10 h-10 rounded object-cover border border-gray-700 hover:border-brand-400 transition-colors"
                        />
                      </button>
                    ) : (
                      <CanhotoUploader delivery={d} onUpdated={onUpdated} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => setDeleteConfirm(d.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Confirmar exclusão</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {modalProdutos && (
        <ProdutosModal
          deliveryId={modalProdutos.id}
          nf={modalProdutos.numero_nf}
          destinatario={modalProdutos.nome_destinatario}
          onClose={() => setModalProdutos(null)}
        />
      )}

      {modalCanhoto && modalCanhoto.canhoto_path && (
        <CanhotoModal
          src={`/${modalCanhoto.canhoto_path}`}
          nf={modalCanhoto.numero_nf}
          onClose={() => setModalCanhoto(null)}
        />
      )}
    </>
  );
}
