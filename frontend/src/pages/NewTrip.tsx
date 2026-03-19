import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import ExtractionPreview from '../components/ExtractionPreview';
import { extractFiles, type ExtractedRow } from '../api/pdfs';
import { createTrip } from '../api/trips';
import { useAppStore } from '../store/useAppStore';

type Step = 'upload' | 'preview';

export default function NewTrip() {
  const navigate = useNavigate();
  const { addToast, setCurrentTripId } = useAppStore();
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [extracted, setExtracted] = useState<ExtractedRow[]>([]);

  const handleFiles = async (files: File[]) => {
    setLoading(true);
    setProgress({ done: 0, total: files.length });
    try {
      const rows = await extractFiles(files, (done, total) => setProgress({ done, total }));
      setExtracted(rows);
      setStep('preview');
    } catch {
      addToast('error', 'Erro ao processar PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (rows: ExtractedRow[], tripName: string) => {
    setLoading(true);
    try {
      const trip = await createTrip(tripName, rows);
      setCurrentTripId(trip.id);
      addToast('success', `Viagem "${tripName}" salva com ${rows.length} entregas!`);
      navigate('/entregas');
    } catch {
      addToast('error', 'Erro ao salvar viagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Nova Viagem</h1>
        <p className="text-gray-400 text-sm mt-1">Arraste os XMLs (recomendado) ou PDFs das notas fiscais</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {['upload', 'preview'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-brand-500 text-white' : i < ['upload','preview'].indexOf(step) ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-gray-100' : 'text-gray-500'}`}>
              {s === 'upload' ? 'Upload de Arquivos' : 'Confirmar Dados'}
            </span>
            {i < 1 && <div className="w-8 h-px bg-gray-800 mx-1" />}
          </div>
        ))}
      </div>

      {step === 'upload' && (
        <UploadZone onFiles={handleFiles} loading={loading} progress={progress} />
      )}

      {step === 'preview' && (
        <>
          <div className="mb-4">
            <button onClick={() => setStep('upload')} className="text-sm text-gray-500 hover:text-gray-300">
              ← Voltar ao upload
            </button>
          </div>
          <ExtractionPreview rows={extracted} onConfirm={handleConfirm} loading={loading} />
        </>
      )}
    </div>
  );
}
