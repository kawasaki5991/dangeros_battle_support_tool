
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '../store';
import { Team } from '../types';
import UnitItem from './UnitItem';

const UnplacedZone: React.FC<{ team: Team }> = ({ team }) => {
  const { units, activeDragId } = useStore();
  const teamUnits = units.filter((u) => u.team === team && u.pos_x === null);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `unplaced-${team}`,
  });

  const getTeamColors = (t: Team) => {
    switch (t) {
      case '生徒会': return { text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/50' };
      case '番長G': return { text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50/50' };
      case '転校生': return { text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50' };
      default: return { text: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50/50' };
    }
  };

  const colors = getTeamColors(team);

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`text-[11px] font-bold uppercase tracking-wider flex justify-between items-center ${colors.text}`}>
        <span>{team}</span>
        <span className="opacity-50 text-[10px]">{teamUnits.length} Units</span>
      </div>
      <div 
        ref={setNodeRef}
        className={`min-h-[100px] max-h-[220px] border-2 border-dashed rounded-xl p-3 flex flex-wrap gap-2 transition-all shadow-inner
          ${activeDragId ? 'overflow-hidden touch-none' : 'overflow-y-auto custom-scrollbar'}
          ${isOver ? 'border-orange-500 bg-orange-100/50 scale-[1.02]' : `${colors.border} ${colors.bg}`}
        `}
      >
        {teamUnits.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-orange-200 text-[10px] italic py-6 select-none">
            No units in {team}
          </div>
        ) : (
          teamUnits.map((u) => (
            <UnitItem key={u.id} unit={u} />
          ))
        )}
      </div>
    </div>
  );
};

export default UnplacedZone;
