import React, { useEffect, useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useStore } from '../store';
import Grid from './Grid';
import ChatBoard from './ChatBoard';
import CharacterForm from './CharacterForm';
import UnplacedZone from './UnplacedZone';
import StatusEditor from './StatusEditor';
import UnitItem from './UnitItem';
import WikiExportButton from './WikiExportButton';
import { MessageSquare, Users, LogOut, LayoutDashboard, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { Team } from '../types';

const Dashboard: React.FC = () => {
  const { session, units, setUnits, updateUnit, setSession, users } = useStore();
  
  const [isCreationOpen, setIsCreationOpen] = useState(true);
  const [isUnplacedOpen, setIsUnplacedOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (session.isHost && units.length === 0) {
      const initialUnits = [
        { id: 'wall-1', type: 'wall', name: '壁', pos_x: 3, pos_y: 0, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId!, is_leader: false, is_secret: false, is_ability_rest: false },
        { id: 'wall-2', type: 'wall', name: '壁', pos_x: 3, pos_y: 2, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId!, is_leader: false, is_secret: false, is_ability_rest: false },
        { id: 'wall-3', type: 'wall', name: '壁', pos_x: 3, pos_y: 4, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId!, is_leader: false, is_secret: false, is_ability_rest: false },
      ] as any;
      setUnits(initialUnits);
    }
  }, [session.isHost, session.roomId, units.length, setUnits]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const unitId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('cell-')) {
      const [_, yStr, xStr] = overId.split('-');
      updateUnit({
        id: unitId,
        pos_x: parseInt(xStr),
        pos_y: parseInt(yStr),
      });
    } else if (overId.startsWith('unplaced-')) {
      updateUnit({
        id: unitId,
        pos_x: null,
        pos_y: null,
      });
    }
  };

  const teams: Team[] = ['生徒会', '番長G', '転校生', 'その他'];
  const activeUnit = units.find(u => u.id === activeId);

  const isLeftCollapsed = !isCreationOpen && !isUnplacedOpen;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <header className="bg-orange-800 border-b border-orange-950 h-14 flex items-center justify-between px-6 shrink-0 z-20 shadow-lg text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black tracking-tighter italic">DANGEROS</h2>
          <div className="flex items-center gap-2 text-orange-200 text-sm border-l border-orange-600 pl-4 font-bold">
            <span>Room: {session.roomName}</span>
            {session.isConnected ? (
              <span className="flex items-center gap-1 text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full text-[10px]">
                <Wifi size={12} /> {session.isHost ? 'HOST' : 'SYNCED'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full text-[10px]">
                <WifiOff size={12} /> OFFLINE
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center gap-3 overflow-x-auto mx-8 custom-scrollbar">
          <Users size={16} className="text-orange-300 shrink-0" />
          <div className="flex gap-2">
            {users.map((u, i) => (
              <span key={i} className="text-xs bg-orange-900/40 px-3 py-1 rounded-full border border-orange-700 whitespace-nowrap font-bold flex items-center gap-1">
                {u === session.handleName && <span className="w-1 h-1 bg-green-400 rounded-full" />}
                {u}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-orange-900/50 px-3 py-1 rounded-full border border-orange-700">
            <span className="text-orange-300 font-bold">User:</span>
            <span className="font-black text-white">{session.handleName}</span>
          </div>
          <button 
            onClick={() => setSession({ roomId: null, handleName: '', isConnected: false })}
            className="text-orange-100 hover:text-white transition-all p-1.5 hover:bg-red-700 rounded-lg shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-orange-100">
        <div className={`${!isLeftCollapsed ? 'w-[400px]' : 'w-14'} transition-all duration-300 bg-white border-r border-orange-200 flex flex-col overflow-hidden shadow-2xl z-10`}>
          <div className="flex flex-col border-b border-orange-100 min-h-0">
            <button 
              onClick={() => setIsCreationOpen(!isCreationOpen)}
              className={`flex items-center text-orange-950 font-black hover:bg-orange-50 transition-colors w-full h-14 ${!isCreationOpen ? 'justify-center p-0' : 'justify-between p-4'}`}
            >
              <div className={`flex items-center gap-3 truncate ${!isCreationOpen ? 'w-full justify-center flex' : 'flex'}`}>
                <Users size={24} className="text-orange-700 shrink-0" /> 
                {isCreationOpen && <span className="text-lg">キャラクター作成</span>}
              </div>
              {isCreationOpen && <ChevronDown size={20} />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isCreationOpen ? 'max-h-[800px] p-5 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}>
              <CharacterForm />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <button 
              onClick={() => setIsUnplacedOpen(!isUnplacedOpen)}
              className={`flex items-center text-orange-950 font-black hover:bg-orange-50 transition-colors w-full h-14 ${!isUnplacedOpen ? 'justify-center p-0' : 'justify-between p-4'}`}
            >
              <div className={`flex items-center gap-3 truncate ${!isUnplacedOpen ? 'w-full justify-center flex' : 'flex'}`}>
                <LayoutDashboard size={24} className="text-orange-700 shrink-0" />
                {isUnplacedOpen && <span className="text-lg">未配置エリア</span>}
              </div>
              {isUnplacedOpen && <ChevronDown size={20} />}
            </button>
            <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isUnplacedOpen ? 'p-5 pt-0 opacity-100' : 'opacity-0 max-h-0 p-0'}`}>
              <div className="space-y-6">
                {teams.map(team => (
                  <UnplacedZone key={team} team={team} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex items-center justify-center overflow-auto custom-scrollbar bg-[radial-gradient(#fdba74_1px,transparent_1px)] [background-size:24px_24px] p-0 relative">
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4 md:p-8">
              <Grid />
            </div>
            <div className="absolute bottom-6 left-6 z-10">
              <WikiExportButton />
            </div>
          </div>
          <div className="bg-white border-t-4 border-orange-200 p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[45%]">
            <StatusEditor />
          </div>
        </div>

        <div className={`${isChatOpen ? 'w-[420px]' : 'w-14'} transition-all duration-300 bg-white border-l border-orange-200 flex flex-col shadow-2xl overflow-hidden shrink-0`}>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`bg-orange-50 border-b border-orange-100 flex items-center text-orange-950 font-black hover:bg-orange-100 transition-colors w-full h-14 ${!isChatOpen ? 'justify-center p-0' : 'justify-between p-4'}`}
          >
            <div className={`flex items-center gap-3 truncate ${!isChatOpen ? 'w-full justify-center flex' : 'flex'}`}>
              <MessageSquare size={24} className="text-orange-700 shrink-0" />
              {isChatOpen && <span className="text-lg">チャットログ</span>}
            </div>
            {isChatOpen && <ChevronDown size={20} />}
          </button>
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0'}`}>
            <ChatBoard />
          </div>
        </div>
      </main>

      <DragOverlay>
        {activeUnit ? (
          <div className="scale-110 opacity-90 rotate-3 pointer-events-none">
            <UnitItem unit={activeUnit} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Dashboard;
