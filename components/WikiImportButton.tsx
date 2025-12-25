import React, { useState } from 'react';
import { useStore } from '../store';
import { Download, Check, AlertCircle } from 'lucide-react';
import { Team, Unit, Gender } from '../types';

const WikiImportButton: React.FC = () => {
  const { session, addUnit, updateTeamDP } = useStore();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const parseWikiText = (text: string) => {
    const lines = text.split('\n');
    let currentTeam: Team = 'その他';
    
    const teamMap: Record<string, Team> = {
      '生徒会': '生徒会',
      '番長G': '番長G',
      '転校生': '転校生',
      'その他': 'その他'
    };

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // Parse Team and DP: *TeamName　DP：1
      if (line.startsWith('*')) {
        const teamMatch = line.match(/^\*([^\s　]+)/);
        if (teamMatch) {
          const rawTeam = teamMatch[1];
          if (teamMap[rawTeam]) {
            currentTeam = teamMap[rawTeam];
          }
        }
        
        const dpMatch = line.match(/DP[：:]\s*(\d+)/i);
        if (dpMatch) {
          updateTeamDP(currentTeam, parseInt(dpMatch[1]));
        }
        return;
      }

      // Parse Character Row: |[[aaa]]|男|6|14|7|3|0|スパゲッティ・コード|100|0||
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        
        // Skip header rows
        if (cells.length < 5 || cells[0].includes('名前') || cells[1].includes('性別')) return;

        // Extract name
        const nameMatch = cells[0].match(/\[\[(.*?)\]\]/);
        const name = nameMatch ? nameMatch[1] : cells[0];
        if (!name) return;

        const gender = (cells[1] || '無') as Gender;
        const atk = parseInt(cells[2]) || 0;
        const def = parseInt(cells[3]) || 0;
        const hp = parseInt(cells[4]) || 0;
        const mp = parseInt(cells[5]) || 0;
        const fs = parseInt(cells[6]) || 0;
        const ability = cells[7] || '';
        const act = parseInt(cells[8]) || 100;
        const succ = parseInt(cells[9]) || 100;
        const remarks = cells[10] || '';

        const isDead = remarks.includes('死亡') || hp <= 0;
        const isAbilityRest = remarks.includes('能力休み');

        const newUnit: Unit = {
          id: Math.random().toString(36).substring(2, 11),
          room_id: session.roomId!,
          type: 'character',
          name,
          gender,
          atk,
          def,
          hp,
          max_hp: hp,
          mp,
          max_mp: mp,
          fs_value: fs,
          team: currentTeam,
          ability_name: ability,
          activation_rate: act,
          success_rate: succ,
          remarks,
          pos_x: null,
          pos_y: null,
          is_dead: isDead,
          is_leader: false,
          is_secret: false,
          is_ability_rest: isAbilityRest,
        };

        addUnit(newUnit);
      }
    });
  };

  const handleImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert('クリップボードが空です。');
        return;
      }
      
      parseWikiText(text);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      alert('クリップボードの読み取り権限がないか、失敗しました。');
    }
  };

  return (
    <button
      onClick={handleImport}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm transition-all shadow-md active:scale-95 ${
        status === 'success' 
          ? 'bg-green-600 text-white' 
          : status === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-blue-700 hover:bg-blue-600 text-white'
      }`}
    >
      {status === 'success' ? (
        <Check size={18} strokeWidth={3} />
      ) : status === 'error' ? (
        <AlertCircle size={18} strokeWidth={3} />
      ) : (
        <Download size={18} strokeWidth={3} />
      )}
      {status === 'success' ? '読込完了' : status === 'error' ? '失敗' : 'Wiki読込'}
    </button>
  );
};

export default WikiImportButton;
