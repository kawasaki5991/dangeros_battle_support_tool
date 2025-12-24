
import React, { useState } from 'react';
import { useStore } from '../store.ts';
import { Unit, Gender, Team } from '../types.ts';
import { Plus, Crown, Ghost } from 'lucide-react';

const CharacterForm: React.FC = () => {
  const { session, addUnit } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    gender: '男' as Gender,
    atk: 0,
    def: 0,
    hp: 2,
    mp: 0,
    fs_value: 0,
    team: '生徒会' as Team,
    ability_name: '',
    activation_rate: 100,
    success_rate: 100,
    remarks: '',
    is_leader: false,
    is_secret: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit: Unit = {
      id: Math.random().toString(36).substring(2, 11),
      room_id: session.roomId!,
      type: 'character',
      name: formData.name,
      gender: formData.gender,
      atk: formData.atk,
      def: formData.def,
      hp: formData.hp,
      max_hp: formData.hp,
      mp: formData.mp,
      max_mp: formData.mp,
      fs_value: formData.fs_value,
      team: formData.team,
      ability_name: formData.ability_name,
      activation_rate: formData.activation_rate,
      success_rate: formData.success_rate,
      remarks: formData.remarks,
      pos_x: null,
      pos_y: null,
      is_dead: false,
      is_leader: formData.is_leader,
      is_secret: formData.is_secret,
      is_ability_rest: false,
    };

    addUnit(newUnit);
    setFormData({
      ...formData,
      name: '',
      ability_name: '',
      remarks: '',
      activation_rate: 100,
      success_rate: 100,
      is_leader: false,
      is_secret: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[13px] bg-orange-50/50 p-4 rounded-xl border border-orange-100 shadow-inner">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <label className="block text-orange-950 mb-1 font-bold">キャラクター名</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border-2 border-orange-200 rounded-lg px-3 py-1.5 text-orange-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
        <div className="col-span-5">
          <label className="block text-orange-950 mb-1 font-bold">陣営</label>
          <select
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value as Team })}
            className="w-full bg-white border-2 border-orange-200 rounded-lg px-2 py-1.5 text-orange-900 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer font-bold"
          >
            <option>生徒会</option>
            <option>番長G</option>
            <option>転校生</option>
            <option>その他</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6 py-1 px-2 bg-white/50 rounded-lg border border-orange-200">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={formData.is_leader}
              onChange={(e) => setFormData({ ...formData, is_leader: e.target.checked })}
            />
            <div className="w-5 h-5 bg-white border-2 border-orange-300 rounded peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all"></div>
            <Crown size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="font-black text-orange-900 group-hover:text-orange-600 transition-colors">リーダー</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={formData.is_secret}
              onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })}
            />
            <div className="w-5 h-5 bg-white border-2 border-orange-300 rounded peer-checked:bg-slate-700 peer-checked:border-slate-700 transition-all"></div>
            <Ghost size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="font-black text-orange-900 group-hover:text-orange-600 transition-colors">シークレット</span>
        </label>

        <div className="flex-1 flex items-center justify-end">
          <span className="text-orange-950 font-bold mr-2">性別:</span>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            className="bg-white border-2 border-orange-200 rounded px-2 py-0.5 text-orange-900 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option>男</option>
            <option>女</option>
            <option>両</option>
            <option>無</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {['atk', 'def', 'hp', 'mp', 'fs_value'].map((field) => (
          <div key={field}>
            <label className="block text-orange-950 mb-1 text-center font-black uppercase text-[10px]">
              {field === 'atk' ? '攻撃' : field === 'def' ? '防御' : field === 'hp' ? '体力' : field === 'mp' ? '精神' : 'FS'}
            </label>
            <input
              type="number"
              min="0"
              value={formData[field as keyof typeof formData] as number}
              onChange={(e) => setFormData({ ...formData, [field]: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-white border-2 border-orange-200 rounded-lg px-1 py-1.5 text-orange-900 text-center font-black outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <label className="block text-orange-950 mb-1 font-bold">能力名</label>
          <input
            type="text"
            value={formData.ability_name}
            onChange={(e) => setFormData({ ...formData, ability_name: e.target.value })}
            className="w-full bg-white border-2 border-orange-200 rounded-lg px-3 py-1.5 text-orange-900 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-orange-950 mb-1 font-bold">発動率</label>
          <input
            type="number"
            min="0"
            value={formData.activation_rate}
            onChange={(e) => setFormData({ ...formData, activation_rate: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full bg-white border-2 border-orange-200 rounded-lg px-1 py-1.5 text-orange-900 text-center outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-orange-950 mb-1 font-bold">成功率</label>
          <input
            type="number"
            min="0"
            value={formData.success_rate}
            onChange={(e) => setFormData({ ...formData, success_rate: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full bg-white border-2 border-orange-200 rounded-lg px-1 py-1.5 text-orange-900 text-center outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-orange-950 mb-1 font-bold">備考</label>
        <textarea
          rows={3}
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          className="w-full bg-white border-2 border-orange-200 rounded-lg px-3 py-2 text-orange-900 outline-none resize-none focus:ring-2 focus:ring-orange-500"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-orange-700 hover:bg-orange-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 transform uppercase tracking-widest text-sm"
      >
        <Plus size={20} strokeWidth={3} /> 作成
      </button>
    </form>
  );
};

export default CharacterForm;
