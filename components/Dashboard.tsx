import React, { useEffect, useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useStore } from '../store';
import Grid from './Grid';
import ChatBoard from './ChatBoard';
import CharacterForm from './CharacterForm';
import UnplacedZone from './UnplacedZone';
import TrashZone from './TrashZone';
import StatusEditor from './StatusEditor';
import UnitItem from './UnitItem';
import WikiExportButton from './WikiExportButton';
import WikiImportButton from './WikiImportButton';
import { MessageSquare, Users, LogOut, LayoutDashboard, ChevronDown, Menu, X, List } from 'lucide-react';
import { Team } from '../types';

const Dashboard: React.FC = () => {
  const { session, units, updateUnit, addUnit, deleteUnit, setSession, users } = useStore();
  
  const [isPC, setIsPC] = useState(window.innerWidth > 768);
  const [isCreationOpen, setIsCreationOpen] = useState(isPC);
  const [isUnplacedOpen, setIsUnplacedOpen] = useState(isPC);
  const [isStatusOpen, setIsStatusOpen] = useState(isPC); 
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, 
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    const handleResize = () => {
      const pc = window.innerWidth > 768;
      setIsPC(pc);
      if (pc) {
        setIsCreationOpen(true);
        setIsUnplacedOpen(true);
        setIsStatusOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (session.isHost && session.roomId) {
      const hasWalls = units.some(u => u.type === 'wall');
      if (!hasWalls) {
        const initialWalls = [
          { id: 'wall-1', type: 'wall', name: '壁', pos_x: 3, pos_y: 0, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId, is_leader: false, is_secret: false, is_ability_rest: false },
          { id: 'wall-2', type: 'wall', name: '壁', pos_x: 3, pos_y: 2, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId, is_leader: false, is_secret: false, is_ability_rest: false },
          { id: 'wall-3', type: 'wall', name: '壁', pos_x: 3, pos_y: 4, is_dead: false, hp: 2, max_hp: 2, atk: 0, def: 0, mp: 0, max_mp: 0, fs_value: 0, room_id: session.roomId, is_leader: false, is_secret: false, is_ability_rest: false },
        ];
        initialWalls.forEach(w => addUnit(w as any));
      }
    }
  }, [session.isHost, session.roomId, units.length]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const unitId = active.id as string;
    const overId = over.id as string;

    if (overId === 'trash-zone') {
      if (window.confirm('このユニットを削除しますか？')) {
        deleteUnit(unitId);
      }
      return;
    }

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

  const closeMobileSidebars = () => {
    setIsCreationOpen(false);
    setIsUnplacedOpen(false);
  };

  const getSidebarClasses = () => {
    if (isPC) return 'relative w-0 md:w-14 transition-all duration-300';
    if (isCreationOpen) return 'fixed inset-y-0 left-0 w-full z-[60]';
    if (isUnplacedOpen) return 'fixed inset-x-0 bottom-0 h-[35vh] w-full z-[60] rounded-t-3xl';
    return 'fixed inset-y-0 left-0 w-0 z-[60] overflow-hidden translate-x-[-100%]';
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <header className="bg-orange-800 border-b border-orange-950 h-14 md:h-16 flex items-center justify-between px-3 md:px-6 shrink-0 z-50 shadow-lg text-white">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <h2 className="text-lg md:text-xl font-black tracking-tighter italic shrink-0">DANGEROS</h2>
          <div className="hidden sm:flex items-center gap-2 text-orange-200 text-xs md:text-sm border-l border-orange-600 pl-4 font-bold truncate">
            <span>Room: {session.roomName}</span>
          </div>
        </div>
        
        <div className="flex-1 flex items-center gap-3 overflow-x-auto mx-2 md:mx-8 custom-scrollbar scrollbar-hide">
          <div className="flex gap-1.5">
            {users.map((u, i) => (
              <span key={i} className="text-[10px] md:text-xs bg-orange-900/40 px-2 py-0.5 rounded-full border border-orange-700 whitespace-nowrap font-bold flex items-center gap-1">
                {u === session.handleName && <span className="w-1 h-1 bg-green-400 rounded-full" />}
                {u}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setSession({ roomId: null, handleName: '', isConnected: false })}
            className="text-orange-100 hover:text-white transition-all p-2 hover:bg-red-700 rounded-lg shadow-sm shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-orange-100 relative h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
        <div className={`
          ${isPC ? (isLeftCollapsed ? 'w-14' : 'w-[400px]') : getSidebarClasses()}
          transition-all duration-300 bg-white border-r border-orange-200 flex flex-col overflow-hidden shadow-2xl md:z-10
          ${!isPC && !isCreationOpen && isUnplacedOpen ? 'translate-y-0 translate-x-0' : ''}
          ${!isPC && isCreationOpen ? 'translate-x-0' : ''}
        `}>
          {!isPC && !isLeftCollapsed && (
            <button 
              onClick={closeMobileSidebars}
              className="absolute top-4 right-4 z-[70] p-2 bg-orange-100 text-orange-900 rounded-full shadow-lg border-2 border-orange-200 active:scale-90"
            >
              <X size={24} />
            </button>
          )}

          <div className={`flex flex-col border-b border-orange-100 min-h-0 ${!isPC && !isCreationOpen ? 'hidden' : 'block'}`}>
            <button 
              onClick={() => setIsCreationOpen(!isCreationOpen)}
              className={`flex items-center text-orange-950 font-black hover:bg-orange-50 transition-colors w-full h-14 ${!isCreationOpen ? 'justify-center p-0' : 'justify-between p-4'}`}
            >
              <div className={`flex items-center gap-3 truncate ${!isCreationOpen ? 'w-full justify-center flex' : 'flex'}`}>
                <Users size={24} className="text-orange-700 shrink-0" /> 
                {(isPC || isCreationOpen) && <span className="text-lg">キャラクター作成</span>}
              </div>
              {isCreationOpen && <ChevronDown size={20} className={`${!isPC ? 'hidden' : 'block'}`} />}
            </button>
            <div className={`overflow-y-auto transition-all duration-300 ${isCreationOpen ? 'max-h-[80vh] md:max-h-[800px] p-5 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}>
              <CharacterForm />
            </div>
          </div>

          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!isPC && !isUnplacedOpen ? 'hidden' : 'block'}`}>
            <button 
              onClick={() => setIsUnplacedOpen(!isUnplacedOpen)}
              className={`flex items-center text-orange-950 font-black hover:bg-orange-50 transition-colors w-full h-14 ${!isUnplacedOpen ? 'justify-center p-0' : 'justify-between p-4'}`}
            >
              <div className={`flex items-center gap-3 truncate ${!isUnplacedOpen ? 'w-full justify-center flex' : 'flex'}`}>
                <LayoutDashboard size={24} className="text-orange-700 shrink-0" />
                {(isPC || isUnplacedOpen) && <span className="text-lg">未配置エリア</span>}
              </div>
              {isUnplacedOpen && <ChevronDown size={20} className={`${!isPC ? 'hidden' : 'block'}`} />}
            </button>
            <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isUnplacedOpen ? 'p-5 pt-0 opacity-100' : 'opacity-0 max-h-0 p-0'}`}>
              <div className="space-y-6">
                {teams.map(team => (
                  <UnplacedZone key={team} team={team} />
                ))}
                <TrashZone />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0 border-r border-orange-200">
          <div className="flex-1 overflow-auto custom-scrollbar bg-[radial-gradient(#fdba74_1px,transparent_1px)] [background-size:24px_24px] p-0 relative touch-pan-x touch-pan-y">
            <div className="min-w-max min-h-full flex p-4 md:p-12">
               <div className="m-auto transform transition-transform duration-300 origin-center scale-[0.85] lg:scale-100">
                 <Grid />
               </div>
            </div>
            
            <div className="fixed bottom-6 left-6 md:absolute md:bottom-6 md:left-6 z-20 flex flex-col gap-3">
              <WikiExportButton />
              <WikiImportButton />
              <button 
                onClick={() => {setIsCreationOpen(false); setIsUnplacedOpen(true)}}
                className="md:hidden bg-orange-800 text-white p-3 rounded-full shadow-lg active:scale-90"
              >
                <LayoutDashboard size={24} />
              </button>
              <button 
                onClick={() => {setIsCreationOpen(true); setIsUnplacedOpen(false)}}
                className="md:hidden bg-orange-700 text-white p-3 rounded-full shadow-lg active:scale-90"
              >
                <Users size={24} />
              </button>
            </div>
            
            <div className="fixed bottom-6 right-6 md:hidden z-20 flex flex-col gap-3">
              <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="bg-blue-700 text-white p-3 rounded-full shadow-lg active:scale-90"
              >
                <List size={24} />
              </button>
              <button 
                onClick={() => setIsMobileChatOpen(true)}
                className="bg-orange-700 text-white p-3 rounded-full shadow-lg active:scale-90"
              >
                <MessageSquare size={24} />
              </button>
            </div>
          </div>
          
          <div className={`
            bg-white border-t-2 md:border-t-4 border-orange-200 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 overflow-hidden flex flex-col
            ${isPC 
              ? `min-h-[400px] max-h-[50%]` 
              : `fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl ${isStatusOpen ? 'h-[80vh]' : 'h-0 translate-y-full'}`
            }
          `}>
            {!isPC && (
               <div className="flex justify-between items-center px-4 py-3 border-b border-orange-100 bg-orange-50 shrink-0">
                 <span className="font-black text-orange-900">ステータス管理</span>
                 <button onClick={() => setIsStatusOpen(false)} className="p-2 text-orange-800"><X size={24}/></button>
               </div>
            )}
            <div className="flex-1 overflow-y-auto p-2 md:p-6 custom-scrollbar">
              <StatusEditor />
            </div>
          </div>
        </div>

        <div className={`
          ${isPC ? 'w-[320px] md:w-[420px]' : 'fixed inset-0 z-[60] w-full'}
          bg-white flex flex-col shadow-2xl overflow-hidden shrink-0 transition-transform duration-300
          ${!isPC && !isMobileChatOpen ? 'translate-x-full' : 'translate-x-0'}
        `}>
          <div className="bg-orange-50 border-b border-orange-100 flex items-center justify-between p-4 h-14 shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare size={24} className="text-orange-700 shrink-0" />
              <span className="text-lg font-black text-orange-950">チャットログ</span>
            </div>
            {!isPC && (
              <button onClick={() => setIsMobileChatOpen(false)} className="p-2 text-orange-800"><X size={24}/></button>
            )}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatBoard />
          </div>
        </div>

        {((!isPC && (isCreationOpen || (isUnplacedOpen && !isPC && false) || isStatusOpen || isMobileChatOpen))) && !isPC && (
          <div 
            className="fixed inset-0 bg-black/30 z-[55]" 
            onClick={() => { closeMobileSidebars(); setIsStatusOpen(false); setIsMobileChatOpen(false); }}
          />
        )}
      </main>

      <DragOverlay dropAnimation={null}>
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
