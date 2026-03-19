import { useEffect, useState } from 'react';
import { fetchDeliveries, type Delivery } from '../api/deliveries';
import { useAppStore } from '../store/useAppStore';
import DeliveryTable from '../components/DeliveryTable';
import TripSelector from '../components/TripSelector';
import { Loader2, Filter } from 'lucide-react';

export default function Deliveries() {
  const { currentTripId, addToast } = useAppStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');

  useEffect(() => {
    if (!currentTripId) return;
    setLoading(true);
    fetchDeliveries({ trip_id: currentTripId })
      .then(setDeliveries)
      .catch(() => addToast('error', 'Erro ao carregar entregas'))
      .finally(() => setLoading(false));
  }, [currentTripId]);

  const filtered = deliveries.filter((d) => {
    if (filterStatus && d.status !== filterStatus) return false;
    if (filterMunicipio && !d.municipio.toLowerCase().includes(filterMunicipio.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Entregas</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as entregas da viagem</p>
        </div>
        <TripSelector />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter size={15} className="text-gray-500" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="entregue">Entregue</option>
          <option value="problema">Problema</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por município..."
          value={filterMunicipio}
          onChange={(e) => setFilterMunicipio(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-400" size={36} />
        </div>
      ) : !currentTripId ? (
        <div className="text-center py-20 text-gray-500">Nenhuma viagem selecionada</div>
      ) : (
        <DeliveryTable
          deliveries={filtered}
          onUpdated={(d) => setDeliveries((prev) => prev.map((p) => (p.id === d.id ? d : p)))}
          onDeleted={(id) => setDeliveries((prev) => prev.filter((p) => p.id !== id))}
        />
      )}
    </div>
  );
}
