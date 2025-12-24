
import React, { useState } from 'react';
import { useStore } from '../store.ts';
import { User, DoorOpen, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [handleName, setHandleName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { setSession, users, setUsers } = useStore();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !handleName) return;

    setIsConnecting(true);
    // PeerJS initialization is handled in App.tsx via session update
    setSession({
      roomId: 'room-' + roomName,
      roomName: roomName,
      handleName: handleName,
    });
    
    if (!users.includes(handleName)) {
      setUsers([...users, handleName]);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-orange-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full mb-6 overflow-hidden rounded-lg">
            <img 
              src="title.jpg" 
              alt="Title" 
              className="w-full h-auto object-contain"
              style={{ aspectRatio: '709/147' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-orange-900 text-center uppercase tracking-tight">戦闘破壊学園ダンゲロス</h1>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-orange-800 mb-1.5 flex items-center gap-2">
              <DoorOpen size={16} /> 部屋名 (共通のものを使用)
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-white border border-orange-200 rounded-lg px-4 py-2 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-orange-200"
              placeholder="例: my-battle-01"
              disabled={isConnecting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-800 mb-1.5 flex items-center gap-2">
              <User size={16} /> ハンドルネーム
            </label>
            <input
              type="text"
              required
              value={handleName}
              onChange={(e) => setHandleName(e.target.value)}
              className="w-full bg-white border border-orange-200 rounded-lg px-4 py-2 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-orange-200"
              placeholder="あなたの名前"
              disabled={isConnecting}
            />
          </div>

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-900/20 active:scale-95 transform flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <><Loader2 className="animate-spin" size={20} /> 接続中...</>
            ) : (
              '入室して開始'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
