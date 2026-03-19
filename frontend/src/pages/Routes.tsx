import { useEffect, useState } from 'react';
import { fetchTripSummary, type TripSummaryGroup } from '../api/trips';
import { useAppStore } from '../store/useAppStore';
import RouteView from '../components/RouteView';
import TripSelector from '../components/TripSelector';
import { Loader2 } from 'lucide-react';

export default function Routes() {
  const { currentTripId, addToast } = useAppStore();
  const [summary, setSummary] = useState<TripSummaryGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTripId) return;
    setLoading(true);
    fetchTripSummary(currentTripId)
      .then((data) => setSummary(data.summary))
      .catch(() => addToast('error', 'Erro ao carregar roteiro'))
      .finally(() => setLoading(false));
  }, [currentTripId]);

  const handleExport = (ordered: TripSummaryGroup[]) => {
    const lines: string[] = ['ROTEIRO DE ENTREGAS\n', '='.repeat(50)];
    ordered.forEach((mun, i) => {
      lines.push(`\n${i + 1}. ${mun.municipio.toUpperCase()} — ${mun.total_notas} notas, ${mun.total_peso.toFixed(1)} kg`);
      mun.bairros.forEach((b) => {
        lines.push(`   ▸ ${b.bairro} (${b.total_notas} notas)`);
        b.entregas.forEach((e: any) => {
          lines.push(`     • NF ${e.numero_nf}${e.numero_cliente ? ` | CLI ${e.numero_cliente}` : ''}${e.peso_bruto ? ` | ${e.peso_bruto} kg` : ''}`);
        });
      });
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roteiro.txt';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Roteiro exportado!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Roteiro</h1>
          <p className="text-gray-400 text-sm mt-1">Agrupado por município e bairro. Arraste para reordenar.</p>
        </div>
        <TripSelector />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-400" size={36} />
        </div>
      ) : summary.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Nenhuma viagem selecionada ou sem entregas</div>
      ) : (
        <RouteView summary={summary} onExport={handleExport} />
      )}
    </div>
  );
}
