import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

const TrashZone: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash-zone',
  });

  return (
    <div className="flex flex-col gap-1.5 mt-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
        <Trash2 size={12} />
        <span>ユニット削除</span>
      </div>
      <div 
        ref={setNodeRef}
        className={`h-[80px] border-2 border-dashed rounded-xl flex items-center justify-center transition-all shadow-inner
          ${isOver 
            ? 'border-red-600 bg-red-100 scale-[1.05] ring-4 ring-red-500/20' 
            : 'border-red-200 bg-red-50/30'
          }
        `}
      >
        <div className={`flex flex-col items-center gap-1 transition-all ${isOver ? 'text-red-700 animate-bounce' : 'text-red-300'}`}>
          <Trash2 size={24} strokeWidth={isOver ? 3 : 2} />
          <span className="text-[10px] font-black italic">DRAG HERE TO DELETE</span>
        </div>
      </div>
    </div>
  );
};

export default TrashZone;