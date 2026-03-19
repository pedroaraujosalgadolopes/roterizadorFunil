import { useEffect, useState } from 'react';
import { fetchStatus, type StatusDelivery, type StatusTrip } from '../api/status';
import { ChevronDown, CheckCircle, Clock, AlertCircle, Search, X, ImageIcon } from 'lucide-react';
import CanhotoModal from '../components/CanhotoModal';

const statusConfig = {
  pendente: {
    label: 'Pendente',
    icon: <Clock size={13} />,
    cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  },
  entregue: {
    label: 'Entregue',
    icon: <CheckCircle size={13} />,
    cls: 'bg-green-500/15 text-green-400 border border-green-500/30',
  },
  problema: {
    label: 'Problema',
    icon: <AlertCircle size={13} />,
    cls: 'bg-red-500/15 text-red-400 border border-red-500/30',
  },
};

export default function StatusEntregas() {
  const [trips, setTrips]           = useState<StatusTrip[]>([]);
  const [deliveries, setDeliveries] = useState<StatusDelivery[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<number | ''>('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [canhotoModal, setCanhotoModal] = useState<StatusDelivery | null>(null);

  const load = async (tripId?: number) => {
    setLoading(true);
    try {
      const data = await fetchStatus(tripId);
      setTrips(data.trips);
      setDeliveries(data.deliveries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTripChange = (val: string) => {
    const id = val === '' ? undefined : Number(val);
    setSelectedTrip(val === '' ? '' : Number(val));
    load(id);
  };

  const filtered = deliveries.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      d.numero_nf.toLowerCase().includes(s) ||
      (d.nome_destinatario ?? '').toLowerCase().includes(s) ||
      d.municipio.toLowerCase().includes(s)
    );
  });

  const total     = filtered.length;
  const entregues = filtered.filter(d => d.status === 'entregue').length;
  const pendentes = filtered.filter(d => d.status === 'pendente').length;
  const problemas = filtered.filter(d => d.status === 'problema').length;
  const pct       = total > 0 ? Math.round((entregues / total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header institucional */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo-cpfl.jpeg" alt="CPFL Funil" className="h-16 object-contain rounded" />
            <div>
              <h1 className="text-xl font-bold text-gray-100">Status de Entregas</h1>
              <p className="text-gray-400 text-sm">Acompanhamento de notas fiscais</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 text-green-400 font-medium">
              <CheckCircle size={14} /> {entregues} entregues
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Clock size={14} /> {pendentes} pendentes
            </span>
            {problemas > 0 && (
              <span className="flex items-center gap-1.5 text-red-400 font-medium">
                <AlertCircle size={14} /> {problemas} problemas
              </span>
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{total} notas no total</span>
              <span className="text-green-400 font-semibold">{pct}% entregue</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(entregues/total)*100}%` }} />
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${(pendentes/total)*100}%` }} />
              <div className="h-full bg-red-500 transition-all"   style={{ width: `${(problemas/total)*100}%` }} />
            </div>
            <div className="flex gap-4 mt-1.5 text-[10px] text-gray-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>Entregue</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Pendente</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Problema</span>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <select
            value={selectedTrip}
            onChange={(e) => handleTripChange(e.target.value)}
            className="appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-200 focus:outline-none focus:border-cpfl-blue"
          >
            <option value="">Todas as viagens</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar NF, destinatário ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cpfl-blue"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-cpfl-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cpfl-navy/60 text-gray-300 text-xs uppercase">
                <th className="px-4 py-3 text-left">Nº NF</th>
                <th className="px-4 py-3 text-left">Destinatário</th>
                <th className="px-4 py-3 text-left">Município</th>
                {!selectedTrip && <th className="px-4 py-3 text-left">Viagem</th>}
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Data Entrega</th>
                <th className="px-4 py-3 text-left">Canhoto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((d) => {
                const sc = statusConfig[d.status];
                const thumb = d.canhoto_thumb_path ? `/${d.canhoto_thumb_path}` : null;
                return (
                  <tr key={d.id} className="bg-gray-950 hover:bg-gray-900/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-cpfl-blue font-semibold">{d.numero_nf}</td>
                    <td className="px-4 py-3 text-gray-200 max-w-[200px] truncate" title={d.nome_destinatario ?? ''}>
                      {d.nome_destinatario || <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {d.municipio}{d.uf ? `/${d.uf}` : ''}
                    </td>
                    {!selectedTrip && (
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{d.viagem}</td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.cls}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {d.data_entrega
                        ? new Date(d.data_entrega).toLocaleString('pt-BR')
                        : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {thumb ? (
                        <button onClick={() => setCanhotoModal(d)} title="Ver comprovante">
                          <img
                            src={thumb}
                            alt="canhoto"
                            className="w-10 h-10 rounded object-cover border border-gray-700 hover:border-cpfl-blue transition-colors"
                          />
                        </button>
                      ) : d.status === 'entregue' ? (
                        <span className="text-gray-600 text-xs">sem foto</span>
                      ) : (
                        <ImageIcon size={14} className="text-gray-700" />
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                    Nenhuma entrega encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-xs text-gray-700 mt-6">
        CPFL Funil Logística · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      {/* Modal canhoto */}
      {canhotoModal && canhotoModal.canhoto_path && (
        <CanhotoModal
          src={`/${canhotoModal.canhoto_path}`}
          nf={canhotoModal.numero_nf}
          onClose={() => setCanhotoModal(null)}
        />
      )}
    </div>
  );
}
