import { X } from 'lucide-react';

interface Props {
  src: string;
  nf: string;
  onClose: () => void;
}

export default function CanhotoModal({ src, nf, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <span className="font-semibold text-gray-200">Canhoto — NF {nf}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <img src={src} alt={`Canhoto NF ${nf}`} className="w-full rounded-lg object-contain max-h-[70vh]" />
        </div>
      </div>
    </div>
  );
}
