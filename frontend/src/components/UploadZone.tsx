import { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

function isAccepted(f: File): boolean {
  const name = f.name.toLowerCase();
  return name.endsWith('.xml') || name.endsWith('.pdf') || f.type === 'application/pdf' || f.type.includes('xml');
}

interface Props {
  onFiles: (files: File[]) => void;
  loading: boolean;
  progress?: { done: number; total: number };
}

export default function UploadZone({ onFiles, loading, progress }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(isAccepted);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isAccepted);
    if (files.length > 0) onFiles(files);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
        dragging
          ? 'border-brand-400 bg-brand-500/10'
          : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
      }`}
    >
      {loading ? (
        <div className="space-y-4">
          <Loader2 className="mx-auto text-brand-400 animate-spin" size={48} />
          {progress && (
            <p className="text-gray-300 text-lg">
              Lendo {progress.done} de {progress.total}...
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Upload className="text-brand-400" size={52} />
              <FileText className="absolute -bottom-1 -right-1 text-gray-400" size={22} />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-200 mb-2">Arraste os XMLs ou PDFs aqui</p>
          <p className="text-gray-400 mb-2">XML da NF-e (recomendado) ou DANFE em PDF</p>
          <p className="text-xs text-brand-400 mb-6">XML extrai os dados com 100% de precisão</p>
          <label className="inline-block cursor-pointer bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Ou clique para selecionar
            <input type="file" accept=".xml,.pdf" multiple className="hidden" onChange={handleChange} />
          </label>
        </>
      )}
    </div>
  );
}
