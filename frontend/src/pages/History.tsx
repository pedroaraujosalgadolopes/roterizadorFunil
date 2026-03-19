import { useEffect, useState } from 'react';
import { fetchTrips, type Trip } from '../api/trips';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { Loader2, Truck, CheckCircle, Clock } from 'lucide-react';

const TAXA_FRETE = 0.07;
const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function History() {
  const { addToast, setCurrentTripId } = useAppStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips()
      .then(setTrips)
      .catch(() => addToast('error', 'Erro ao carregar histórico'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: number) => {
    setCurrentTripId(id);
    navigate('/entregas');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Histórico de Viagens</h1>
        <p className="text-gray-400 text-sm mt-1">Selecione uma viagem para ver suas entregas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-400" size={36} />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Nenhuma viagem registrada ainda</div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-brand-500/50 hover:bg-gray-900/80 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="text-brand-500 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-100 group-hover:text-brand-300 transition-colors">{t.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(t.data_criacao).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-200">{t.total_notas}</p>
                    <p className="text-xs text-gray-500">{t.total_cidades ?? 0} cidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-200">{Number(t.total_peso).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</p>
                    <p className="text-xs text-gray-500">peso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{BRL(Number(t.total_valor) * TAXA_FRETE)}</p>
                    <p className="text-xs text-gray-500">frete (7%)</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(t.percentual_entregue ?? 0) === 100 ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <Clock size={16} className="text-amber-400" />
                    )}
                    <span className={`text-sm font-bold ${(t.percentual_entregue ?? 0) === 100 ? 'text-green-400' : 'text-amber-400'}`}>
                      {t.percentual_entregue ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${t.percentual_entregue ?? 0}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
