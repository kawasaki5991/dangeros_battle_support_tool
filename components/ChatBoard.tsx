import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Send, Terminal } from 'lucide-react';

const ChatBoard: React.FC = () => {
  const { messages, session, addMessage } = useStore();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const normalizeText = (text: string) => {
    return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => 
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    ).replace(/＝＞/g, '=>');
  };

  const processMessage = (text: string) => {
    const normalized = normalizeText(text.trim());
    let isSystem = false;
    let resultText = normalized;

    const diceRegex = /(\d+)[dD](\d+)/gi;
    let hasDice = false;

    resultText = resultText.replace(diceRegex, (match, countStr, sidesStr) => {
      hasDice = true;
      const count = Math.min(parseInt(countStr), 100);
      const sides = parseInt(sidesStr);
      if (count > 0 && sides > 0) {
        let results = [];
        let total = 0;
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          results.push(r);
          total += r;
        }
        return ` ダイスロール！ (${count}d${sides}): [${results.join(', ')}] = 合計: ${total} `;
      }
      return match;
    });

    const attackRegex = /(\d+)\s*=>\s*(\d+)/g;
    resultText = resultText.replace(attackRegex, (match, atkStr, defStr) => {
      const atk = parseInt(atkStr);
      const def = parseInt(defStr);
      const hitRate = Math.min(100, Math.max(0, (atk - def) * 5 + 50));
      const damage = Math.max(0, atk - def);
      isSystem = true; 
      return ` 通常攻撃：${atk} 攻撃 vs ${def} 防御 ➔ 命中率: ${hitRate}% / ダメージ: ${damage} `;
    });

    if (hasDice) isSystem = true;

    return { content: resultText.trim(), isSystem };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const { content, isSystem } = processMessage(inputValue);

    addMessage({
      id: Math.random().toString(),
      room_id: session.roomId!,
      handle_name: session.handleName,
      content: content,
      is_system: isSystem,
      created_at: new Date().toISOString(),
    });

    setInputValue('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <form onSubmit={handleSend} className="p-5 border-b-2 border-orange-200 bg-white shadow-md z-10">
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="1d100 または 15 => 5"
            className="w-full bg-slate-50 border-2 border-orange-200 rounded-2xl pl-5 pr-14 py-4 text-sm text-orange-950 font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 shadow-inner placeholder-orange-300 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all active:scale-90"
          >
            <Send size={24} strokeWidth={3} />
          </button>
        </div>
      </form>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.is_system ? 'bg-orange-950 text-orange-50 border-l-8 border-orange-500 p-4 rounded-r-2xl shadow-xl' : 'bg-white p-4 rounded-2xl shadow-sm border border-orange-100'}`}>
            <div className="flex justify-between items-baseline mb-2">
              <span className={`text-sm font-black ${msg.is_system ? 'text-orange-200' : 'text-orange-950'}`}>
                {msg.handle_name}
              </span>
              <span className={`text-[10px] font-black font-mono ${msg.is_system ? 'text-orange-400' : 'text-orange-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${msg.is_system ? 'font-black tracking-tight italic' : 'text-slate-900 font-medium'}`}>
              {msg.content}
            </p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 p-10 text-center opacity-50">
            <Terminal size={48} className="mb-4" />
            <p className="font-black italic">AWAITING INPUT...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBoard;