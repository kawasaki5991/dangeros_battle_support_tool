import React from 'react';
import { useStore } from '../store';
import { Team, Unit } from '../types';
import { Sword, Shield, Heart, Zap, Star, MessageSquare, Crown, Ghost, Coins, Wrench } from 'lucide-react';

const StatusEditor: React.FC = () => {
  const { units, updateUnit, teamDP, updateTeamDP } = useStore();
  const characterUnits = units.filter(u => u.type === 'character');
  const teams: Team[] = ['生徒会', '番長G', '転校生', 'その他'];

  const handleValueChange = (id: string, field: keyof Unit, val: any) => {
    if (typeof val === 'string' && field !== 'remarks') {
      const num = parseInt(val) || 0;
      updateUnit({ id, [field]: Math.max(0, num) });
    } else {
      updateUnit({ id, [field]: val });
    }
  };

  const getTeamColor = (t: Team) => {
    switch (t) {
      case '生徒会': return 'text-blue-800';
      case '番長G': return 'text-red-800';
      case '転校生': return 'text-emerald-800';
      default: return 'text-orange-900';
    }
  };

  const getTeamBg = (t: Team) => {
    switch (t) {
      case '生徒会': return 'bg-blue-100/50';
      case '番長G': return 'bg-red-100/50';
      case '転校生': return 'bg-emerald-100/50';
      default: return 'bg-orange-100/50';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <Star className="text-orange-600 fill-orange-200" size={24} />
          <h3 className="text-xl font-black text-orange-950 uppercase tracking-tighter">ステータス管理</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 md:pr-3 custom-scrollbar space-y-6 md:space-y-10 pb-6">
        {teams.map(team => {
          const teamCharacters = characterUnits.filter(u => u.team === team);
          if (teamCharacters.length === 0) return null;
          const livingCount = teamCharacters.filter(u => !u.is_dead).length;

          return (
            <div key={team} className={`${getTeamBg(team)} rounded-2xl p-3 md:p-5 border-2 border-orange-200 shadow-xl`}>
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h4 className={`text-base md:text-lg font-black flex items-center gap-2 md:gap-3 ${getTeamColor(team)}`}>
                  <span className="w-3 h-3 rounded-full bg-current shadow-md animate-pulse" />
                  {team}
                  <span className="text-[10px] md:text-sm font-black bg-white/50 px-2 md:px-3 py-0.5 rounded-full ml-1 md:ml-2">生存：{livingCount}</span>
                </h4>
                <div className="flex items-center gap-2 bg-white/80 border border-orange-300 px-3 py-1 rounded-xl shadow-inner">
                  <Coins className="text-yellow-600" size={14} />
                  <span className="text-[10px] font-black text-orange-900 uppercase">DP:</span>
                  <input 
                    type="number"
                    value={teamDP[team]}
                    onChange={(e) => updateTeamDP(team, parseInt(e.target.value) || 0)}
                    className="w-12 md:w-16 bg-transparent text-center font-black text-orange-950 focus:outline-none rounded text-xs md:text-sm"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full text-left text-xs border-separate border-spacing-y-1.5">
                  <thead>
                    <tr className="text-orange-950/60 uppercase font-black tracking-widest text-[9px] md:text-[10px]">
                      <th className="pb-2 pl-3 min-w-[100px] md:w-40">名前</th>
                      <th className="pb-2 text-center w-12 md:w-20">役職</th>
                      <th className="pb-2 text-center w-14 md:w-16"><Sword size={12} className="inline mr-1" strokeWidth={3} />攻</th>
                      <th className="pb-2 text-center w-14 md:w-16"><Shield size={12} className="inline mr-1" strokeWidth={3} />防</th>
                      <th className="pb-2 text-center w-16 md:w-20"><Heart size={12} className="inline mr-1" strokeWidth={3} />体</th>
                      <th className="pb-2 text-center w-14 md:w-16"><Zap size={12} className="inline mr-1" strokeWidth={3} />精</th>
                      <th className="pb-2 text-center w-14 md:w-16"><Wrench size={12} className="inline mr-1" strokeWidth={3} />FS</th>
                      <th className="pb-2 pl-4 md:pl-6 min-w-[150px]"><MessageSquare size={12} className="inline mr-1" strokeWidth={3} />備考</th>
                      <th className="pb-2 text-center w-16 md:w-24">休</th>
                      <th className="pb-2 text-center w-16 md:w-24">生死</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamCharacters.map(unit => (
                      <tr key={unit.id} className={`group hover:bg-white transition-all bg-white/60 rounded-xl shadow-sm`}>
                        <td className={`py-3 pl-3 font-black truncate text-xs md:text-sm ${unit.is_dead ? 'text-red-800 line-through' : 'text-orange-950'}`}>
                          {unit.name}
                        </td>
                        <td className="py-3 px-1 text-center">
                          <div className="flex justify-center gap-1">
                            {unit.is_leader && <span title="リーダー"><Crown size={14} className="text-yellow-600 fill-yellow-200" /></span>}
                            {unit.is_secret && <span title="シークレット"><Ghost size={14} className="text-slate-600 fill-slate-100" /></span>}
                            {!unit.is_leader && !unit.is_secret && <span className="text-orange-200">—</span>}
                          </div>
                        </td>
                        <td className="py-2 px-0.5 text-center">
                          <input 
                            type="number" 
                            className="w-10 md:w-12 bg-white border border-orange-100 rounded-lg text-center py-1.5 md:py-1 text-red-800 font-black focus:border-orange-500 outline-none shadow-sm text-xs md:text-sm"
                            value={unit.atk}
                            onChange={(e) => handleValueChange(unit.id, 'atk', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-0.5 text-center">
                          <input 
                            type="number" 
                            className="w-10 md:w-12 bg-white border border-orange-100 rounded-lg text-center py-1.5 md:py-1 text-blue-800 font-black focus:border-orange-500 outline-none shadow-sm text-xs md:text-sm"
                            value={unit.def}
                            onChange={(e) => handleValueChange(unit.id, 'def', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-0.5 text-center">
                             <input 
                                type="number" 
                                className="w-10 md:w-12 bg-white border border-orange-100 rounded-lg text-center py-1.5 md:py-1 text-green-700 font-black focus:border-orange-500 outline-none shadow-sm text-xs md:text-sm"
                                value={unit.hp}
                                onChange={(e) => handleValueChange(unit.id, 'hp', e.target.value)}
                              />
                        </td>
                        <td className="py-2 px-0.5 text-center">
                          <input 
                            type="number" 
                            className="w-10 md:w-12 bg-white border border-orange-100 rounded-lg text-center py-1.5 md:py-1 text-purple-800 font-black focus:border-orange-500 outline-none shadow-sm text-xs md:text-sm"
                            value={unit.mp}
                            onChange={(e) => handleValueChange(unit.id, 'mp', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-0.5 text-center">
                          <input 
                            type="number" 
                            className="w-10 md:w-12 bg-white border border-orange-100 rounded-lg text-center py-1.5 md:py-1 text-orange-800 font-black focus:border-orange-500 outline-none shadow-sm text-xs md:text-sm"
                            value={unit.fs_value}
                            onChange={(e) => handleValueChange(unit.id, 'fs_value', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="text" 
                            className="w-full bg-white/40 border-b border-orange-100 px-2 py-1 text-[11px] md:text-[12px] text-orange-950 font-medium focus:bg-white focus:border-orange-500 outline-none transition-all italic"
                            value={unit.remarks || ''}
                            onChange={(e) => handleValueChange(unit.id, 'remarks', e.target.value)}
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input 
                            type="checkbox"
                            checked={unit.is_ability_rest}
                            onChange={(e) => updateUnit({ id: unit.id, is_ability_rest: e.target.checked })}
                            className="w-5 h-5 md:w-5 md:h-5 rounded border-2 border-orange-300 text-purple-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <button 
                            onClick={() => updateUnit({ id: unit.id, is_dead: !unit.is_dead })}
                            className={`px-2 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest transition-all shadow-md ${unit.is_dead ? 'bg-red-800 text-white' : 'bg-orange-800 text-white'}`}
                          >
                            {unit.is_dead ? '死亡' : '生存'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusEditor;
