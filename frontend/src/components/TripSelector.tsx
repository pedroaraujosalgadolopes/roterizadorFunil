import { useEffect, useState } from 'react';
import { fetchTrips, type Trip } from '../api/trips';
import { useAppStore } from '../store/useAppStore';
import { ChevronDown } from 'lucide-react';

export default function TripSelector() {
  const { currentTripId, setCurrentTripId } = useAppStore();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    fetchTrips().then((data) => {
      setTrips(data);
      if (!currentTripId && data.length > 0) setCurrentTripId(data[0].id);
    });
  }, []);

  return (
    <div className="relative inline-block">
      <select
        value={currentTripId ?? ''}
        onChange={(e) => setCurrentTripId(Number(e.target.value))}
        className="appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-9 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500 cursor-pointer"
      >
        {trips.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  );
}
