import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '../store';
import UnitItem from './UnitItem';

const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = [1, 2, 3, 4, 5, 6, 7];

const Cell: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const { units } = useStore();
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${y}-${x}`,
  });

  const unitsAtCell = units.filter((u) => u.pos_x === x && u.pos_y === y);

  let scaleClass = 'scale-100';
  let containerClass = 'flex items-center justify-center';
  
  if (unitsAtCell.length === 2) {
    scaleClass = 'scale-75';
    containerClass = 'flex flex-wrap items-center justify-center gap-[-10px]';
  } else if (unitsAtCell.length >= 3 && unitsAtCell.length <= 4) {
    scaleClass = 'scale-50';
    containerClass = 'grid grid-cols-2 place-items-center';
  } else if (unitsAtCell.length > 4) {
    scaleClass = 'scale-[0.4]';
    containerClass = 'grid grid-cols-3 place-items-center';
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative w-24 h-24 md:w-32 md:h-32 border border-orange-300 transition-colors overflow-hidden
        ${isOver ? 'bg-orange-300/40' : 'bg-white'}
        ${containerClass}
      `}
    >
      {unitsAtCell.map((unit) => (
        <div key={unit.id} className={`${scaleClass} transition-transform duration-200 origin-center -m-4`}>
           <UnitItem unit={unit} />
        </div>
      ))}
      <span className="absolute bottom-1 right-1 text-[10px] md:text-[11px] text-orange-400 font-black font-mono select-none drop-shadow-sm pointer-events-none z-0">
        {ROWS[y]}{COLS[x]}
      </span>
    </div>
  );
};

const Grid: React.FC = () => {
  return (
    <div className="inline-block p-4 md:p-8 bg-white border-4 border-orange-800 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)]">
      <div className="flex ml-8 md:ml-12">
        {COLS.map((c) => (
          <div key={c} className="w-24 md:w-32 text-center text-orange-900 font-black mb-2 md:mb-4 text-lg md:text-xl drop-shadow-sm">
            {c}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col mr-2 md:mr-4 pt-1">
          {ROWS.map((r) => (
            <div key={r} className="h-24 md:h-32 flex items-center justify-center text-orange-900 font-black w-6 md:w-8 text-lg md:text-xl drop-shadow-sm">
              {r}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-4 border-orange-950 bg-orange-100 overflow-hidden rounded-xl shadow-2xl">
          {ROWS.map((_, y) => (
            <React.Fragment key={y}>
              {COLS.map((_, x) => (
                <Cell key={`${x}-${y}`} x={x} y={y} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;
