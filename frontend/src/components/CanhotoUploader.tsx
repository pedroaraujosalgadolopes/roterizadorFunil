import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { uploadCanhoto } from '../api/deliveries';
import { useAppStore } from '../store/useAppStore';
import type { Delivery } from '../api/deliveries';

interface Props {
  delivery: Delivery;
  onUpdated: (d: Delivery) => void;
}

export default function CanhotoUploader({ delivery, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useAppStore();

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const updated = await uploadCanhoto(delivery.id, file);
      onUpdated(updated);
      addToast('success', `Canhoto registrado — NF ${delivery.numero_nf}`);
    } catch {
      addToast('error', 'Erro ao enviar canhoto');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.heic"
        className="hidden"
        onChange={handle}
      />
      {loading ? (
        <Loader2 size={16} className="animate-spin text-brand-400" />
      ) : (
        <Camera size={16} className="text-gray-400 hover:text-brand-400 transition-colors" />
      )}
    </label>
  );
}
