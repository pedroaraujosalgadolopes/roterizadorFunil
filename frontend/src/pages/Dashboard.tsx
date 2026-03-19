import { useEffect, useState } from 'react';
import { fetchAdminStats, type AdminStats } from '../api/admin';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, MapPin, Weight, DollarSign,
  CheckCircle, Clock, AlertCircle, Loader2, TrendingUp,
} from 'lucide-react';

const TAXA_FRETE = 0.07; // 7% do valor das NFs

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const KG = (v: number) =>
  v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg';

export default function Dashboard() {
  const { addToast, setCurrentTripId } = useAppStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => addToast('error', 'Erro ao carregar painel'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="animate-spin text-brand-400" size={40} />
    </div>
  );

  if (!stats) return null;
  const g = stats.geral;

  const totalNotas   = g.total_notas || 1;
  const pctEntregue  = Math.round(((g.total_entregues ?? 0) / totalNotas) * 100);
  const pctPendente  = Math.round(((g.total_pendentes ?? 0) / totalNotas) * 100);
  const pctProblema  = Math.round(((g.total_problemas ?? 0) / totalNotas) * 100);

  // Valor recebido = 7% do valor total das NFs
  const freteTotal     = g.total_valor   * TAXA_FRETE;
  const freteEntregue  = g.valor_entregue * TAXA_FRETE;
  const fretePendente  = g.valor_pendente * TAXA_FRETE;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Painel Geral</h1>
        <p className="text-gray-400 text-sm mt-1">Visão consolidada de todas as viagens</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Truck size={20} />} label="Viagens" value={g.total_viagens} color="orange" />
        <StatCard icon={<Package size={20} />} label="Notas Fiscais" value={g.total_notas} color="blue" />
        <StatCard icon={<MapPin size={20} />} label="Municípios" value={g.total_cidades} color="purple" />
        <StatCard icon={<Weight size={20} />} label="Peso Total" value={KG(g.total_peso)} color="teal" raw />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BigStatCard
          icon={<DollarSign size={22} />}
          label="Valor total das NFs"
          value={BRL(g.total_valor)}
          sub={`Frete a receber (7%): ${BRL(freteTotal)}`}
          color="green"
        />
        <BigStatCard
          icon={<CheckCircle size={22} />}
          label="Frete já recebido (entregues)"
          value={BRL(freteEntregue)}
          sub={`${g.total_entregues ?? 0} de ${g.total_notas} NFs entregues · NFs: ${BRL(g.valor_entregue)}`}
          color="green"
        />
        <BigStatCard
          icon={<Clock size={22} />}
          label="Frete pendente de recebimento"
          value={BRL(fretePendente)}
          sub={`${g.total_pendentes ?? 0} pendentes · ${g.total_problemas ?? 0} c/ problema · NFs: ${BRL(g.valor_pendente)}`}
          color="amber"
        />
      </div>

      {/* Barra de progresso geral */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-200 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-400" />
            Progresso geral de entregas
          </span>
          <span className="text-brand-400 font-bold">{pctEntregue}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${pctEntregue}%` }} />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${pctPendente}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${pctProblema}%` }} />
        </div>
        <div className="flex gap-5 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Entregue</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Pendente</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Problema</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top municípios */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-brand-400" />
            Top Municípios
          </h2>
          <div className="space-y-3">
            {stats.top_cidades.map((c, i) => {
              const pct = Math.round((c.entregues / (c.total_notas || 1)) * 100);
              return (
                <div key={c.municipio}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-brand-500 font-bold text-xs w-4">{i + 1}.</span>
                      {c.municipio}
                      {c.uf && <span className="text-gray-600 text-xs">/{c.uf}</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {c.total_notas} NFs · {BRL(c.total_valor)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {stats.top_cidades.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4">Nenhum dado ainda</p>
            )}
          </div>
        </div>

        {/* Viagens recentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Truck size={16} className="text-brand-400" />
            Viagens Recentes
          </h2>
          <div className="space-y-2">
            {stats.viagens_recentes.map((v) => (
              <button
                key={v.id}
                onClick={() => { setCurrentTripId(v.id); navigate('/entregas'); }}
                className="w-full text-left bg-gray-800/50 hover:bg-gray-800 rounded-lg px-4 py-3 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-brand-300 transition-colors truncate max-w-[200px]">
                      {v.nome}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(v.data_criacao).toLocaleDateString('pt-BR')} · {v.total_notas} NFs · {v.total_cidades} cidades
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">NFs: {BRL(v.total_valor)}</p>
                    <p className="text-sm font-bold text-green-400">Frete: {BRL(v.total_valor * TAXA_FRETE)}</p>
                    <p className={`text-xs font-medium ${(v.percentual_entregue ?? 0) === 100 ? 'text-green-400' : 'text-amber-400'}`}>
                      {v.percentual_entregue ?? 0}% entregue
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full"
                    style={{ width: `${v.percentual_entregue ?? 0}%` }}
                  />
                </div>
              </button>
            ))}
            {stats.viagens_recentes.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4">Nenhuma viagem ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* Status por viagem */}
      {stats.status_por_viagem.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-brand-400" />
            Status por Viagem
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left pb-2">Viagem</th>
                  <th className="text-right pb-2 text-green-400">Entregues</th>
                  <th className="text-right pb-2 text-amber-400">Pendentes</th>
                  <th className="text-right pb-2 text-red-400">Problemas</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stats.status_por_viagem.map((v) => {
                  const total = v.entregues + v.pendentes + v.problemas;
                  return (
                    <tr key={v.id} className="hover:bg-gray-800/50">
                      <td className="py-2.5 text-gray-300 max-w-[200px] truncate">{v.nome}</td>
                      <td className="py-2.5 text-right font-mono text-green-400">{v.entregues}</td>
                      <td className="py-2.5 text-right font-mono text-amber-400">{v.pendentes}</td>
                      <td className="py-2.5 text-right font-mono text-red-400">{v.problemas}</td>
                      <td className="py-2.5 text-right font-mono text-gray-400">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, raw }: {
  icon: React.ReactNode; label: string; value: number | string; color: string; raw?: boolean;
}) {
  const colors: Record<string, string> = {
    orange: 'text-brand-400 bg-brand-500/10',
    blue:   'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    teal:   'text-teal-400 bg-teal-500/10',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-100">
        {raw ? value : typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function BigStatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-xl font-bold text-gray-100">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
      <p className="text-gray-400 text-sm mt-2">{label}</p>
    </div>
  );
}
