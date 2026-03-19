import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import type { TripSummaryGroup } from '../api/trips';

interface Props {
  summary: TripSummaryGroup[];
  onExport: (ordered: TripSummaryGroup[]) => void;
}

export default function RouteView({ summary, onExport }: Props) {
  const [ordered, setOrdered] = useState(summary);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrdered((items) => {
        const oldIndex = items.findIndex((i) => i.municipio === active.id);
        const newIndex = items.findIndex((i) => i.municipio === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => onExport(ordered)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Exportar Roteiro (PDF)
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((o) => o.municipio)} strategy={verticalListSortingStrategy}>
          {ordered.map((group, idx) => (
            <SortableMunicipio
              key={group.municipio}
              group={group}
              index={idx}
              expanded={expanded}
              onToggle={(mun) => setExpanded((e) => ({ ...e, [mun]: !e[mun] }))}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableMunicipio({
  group, index, expanded, onToggle,
}: {
  group: TripSummaryGroup;
  index: number;
  expanded: Record<string, boolean>;
  onToggle: (mun: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.municipio });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isOpen = expanded[group.municipio];

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50"
        onClick={() => onToggle(group.municipio)}
      >
        <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={18} />
        </button>
        <span className="text-brand-400 font-bold text-sm">{index + 1}.</span>
        <span className="font-semibold text-gray-100 flex-1">{group.municipio}</span>
        <span className="text-gray-400 text-xs">{group.total_notas} notas · {group.total_peso.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span>
        {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
      </div>

      {isOpen && (
        <div className="border-t border-gray-800 divide-y divide-gray-800">
          {group.bairros.map((b) => (
            <div key={b.bairro} className="p-4 pl-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-300 text-sm">{b.bairro}</span>
                <span className="text-gray-500 text-xs">— {b.total_notas} notas · {b.total_peso.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span>
              </div>
              <ul className="space-y-1">
                {b.entregas.map((e: any) => (
                  <li key={e.numero_nf} className="text-xs text-gray-500 font-mono flex gap-4">
                    <span>NF {e.numero_nf}</span>
                    {e.numero_cliente && <span>CLI {e.numero_cliente}</span>}
                    {e.peso_bruto && <span>{e.peso_bruto} kg</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
