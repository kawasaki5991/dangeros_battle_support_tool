import React, { useState } from 'react';
import { useStore } from '../store';
import { Share2, Check } from 'lucide-react';
import { Team } from '../types';

const WikiExportButton: React.FC = () => {
  const { units, teamDP } = useStore();
  const [copied, setCopied] = useState(false);

  const generateWikiText = () => {
    const ROWS_JP = ['Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ'];
    const COLS_JP = ['１', '２', '３', '４', '５', '６', '７'];
    const TEAMS: Team[] = ['生徒会', '番長G', '転校生', 'その他'];

    // Header Row
    let wiki = '|BGCOLOR(silver):';
    for (const col of COLS_JP) {
      wiki += `|BGCOLOR(silver):&color(silver){＿}''${col}''&color(silver){＿}`;
    }
    wiki += '|\n';

    // Grid Rows
    for (let y = 0; y < 5; y++) {
      wiki += `|BGCOLOR(silver):''${ROWS_JP[y]}''`;
      for (let x = 0; x < 7; x++) {
        const cellUnits = units.filter(u => u.pos_x === x && u.pos_y === y);
        if (cellUnits.length === 0) {
          wiki += '|';
        } else {
          const cellContent = cellUnits.map(u => {
            if (u.type === 'wall') return 'BGCOLOR(black):&color(white){&color(black){__}壁&color(black){__}}';
            return `[[${u.name}]]`;
          }).join('');
          wiki += `|${cellContent}`;
        }
      }
      wiki += '|\n';
    }

    // Status Tables
    for (const team of TEAMS) {
      const teamUnits = units.filter(u => u.type === 'character' && u.team === team);
      // Only export if team has units or DP
      if (teamUnits.length === 0 && teamDP[team] === 0) continue;

      wiki += `\n*${team}　DP：${teamDP[team]}\n`;
      wiki += '|BGCOLOR(silver):名前|BGCOLOR(silver):性別|BGCOLOR(silver):攻撃|BGCOLOR(silver):防御|BGCOLOR(silver):体力|BGCOLOR(silver):精神|BGCOLOR(silver):FS|BGCOLOR(silver):能力名|BGCOLOR(silver):発動|BGCOLOR(silver):成功|BGCOLOR(silver):備考|\n';
      
      for (const u of teamUnits) {
        let remarks = u.remarks || '';
        const states = [];
        if (u.is_dead || u.hp <= 0) states.push('死亡');
        if (u.is_ability_rest) states.push('能力休み');
        
        const stateStr = states.join('・');
        if (stateStr) {
          remarks = remarks ? `${remarks}（${stateStr}）` : stateStr;
        }

        wiki += `|[[${u.name}]]|${u.gender || ''}|${u.atk}|${u.def}|${u.hp}|${u.mp}|${u.fs_value}|${u.ability_name || ''}|${u.activation_rate ?? ''}|${u.success_rate ?? ''}|${remarks}|\n`;
      }
    }

    return wiki;
  };

  const handleCopy = async () => {
    const text = generateWikiText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy wiki text:', err);
      alert('クリップボードへのコピーに失敗しました。');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm transition-all shadow-md active:scale-95 ${
        copied 
          ? 'bg-green-600 text-white' 
          : 'bg-orange-700 hover:bg-orange-600 text-white'
      }`}
    >
      {copied ? <Check size={18} strokeWidth={3} /> : <Share2 size={18} strokeWidth={3} />}
      {copied ? 'コピー完了！' : 'Wiki出力'}
    </button>
  );
};

export default WikiExportButton;