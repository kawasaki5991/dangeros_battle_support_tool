import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Unit } from '../types';
import { useStore } from '../store';

const UnitItem: React.FC<{ unit: Unit }> = ({ unit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: unit.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isWall = unit.type === 'wall';
  const isDead = unit.is_dead || unit.hp <= 0;

  const getTeamStyles = () => {
    if (isDead) {
      return 'bg-gray-300 border-gray-400 text-gray-600';
    }
    if (unit.is_ability_rest) {
      return 'bg-purple-100 border-purple-400 text-purple-900';
    }
    if (isWall) {
      return 'bg-black border-slate-700 text-white';
    }
    switch (unit.team) {
      case '生徒会': return 'bg-blue-100 border-blue-600 text-blue-950';
      case '番長G': return 'bg-red-100 border-red-600 text-red-950';
      case '転校生': return 'bg-emerald-100 border-emerald-600 text-emerald-950';
      default: return 'bg-orange-100 border-orange-500 text-orange-950';
    }
  };

  const displayName = unit.name.substring(0, 7);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        ${isDragging ? 'opacity-0' : 'opacity-100'}
        ${getTeamStyles()}
        w-20 h-20 rounded-xl border-4 flex flex-col items-center justify-center p-1 cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-105 hover:rotate-1 relative
      `}
    >
      <div className={`text-[11px] font-black text-center leading-tight w-full px-0.5 ${isDead ? 'opacity-70' : ''}`}>
        {displayName}
      </div>
    </div>
  );
};

export default UnitItem;