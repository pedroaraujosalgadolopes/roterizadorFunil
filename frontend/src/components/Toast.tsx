import { useAppStore } from '../store/useAppStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-green-400" size={18} />,
  error: <XCircle className="text-red-400" size={18} />,
  info: <Info className="text-blue-400" size={18} />,
};

export function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 shadow-xl min-w-[300px] animate-slide-up"
        >
          {icons[t.type]}
          <span className="text-sm text-gray-100 flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
