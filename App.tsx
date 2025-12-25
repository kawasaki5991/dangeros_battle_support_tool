
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Peer, { DataConnection } from 'peerjs';
import { SyncPayload } from './types';

const PEER_PREFIX = 'dangeros-room-';

const App: React.FC = () => {
  const { session, setSession, onSync, setBroadcastHandler, users, setUsers } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<{ conn: DataConnection; handleName?: string }[]>([]);
  const migrationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (session.roomId && session.handleName && !peerRef.current) {
      const roomPeerId = PEER_PREFIX + session.roomName;
      
      const initializeConnection = () => {
        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('My Peer ID:', id);
          const conn = peer.connect(roomPeerId);
          
          conn.on('open', () => {
            console.log('Connected to host');
            connectionsRef.current = [{ conn }];
            setSession({ isConnected: true, isHost: false });
            conn.send({ type: 'USER_JOIN', handleName: session.handleName });
          });

          conn.on('data', (data) => {
            onSync(data as SyncPayload);
          });

          conn.on('close', () => {
            console.log('Host disconnected. Attempting migration...');
            setSession({ isConnected: false });
            handleHostMigration();
          });

          conn.on('error', (err) => {
            console.log('Connection error:', err);
            handleHostMigration();
          });

          // 初期接続がタイムアウトした（ホストがいない）場合
          const initialTimeout = window.setTimeout(() => {
            if (connectionsRef.current.length === 0) {
              setupAsHost(peer, roomPeerId);
            }
          }, 4000);
          
          return () => window.clearTimeout(initialTimeout);
        });
      };

      const handleHostMigration = () => {
        if (migrationTimeoutRef.current) window.clearTimeout(migrationTimeoutRef.current);
        
        const state = useStore.getState();
        const myIndex = state.users.indexOf(session.handleName);
        
        // ユーザーリスト内の自分の位置に応じた待機時間（Thundering Herd防止）
        // リストにいない場合は後回し
        const waitTime = myIndex >= 0 ? myIndex * 1500 : 8000;
        
        console.log(`Migration: waiting ${waitTime}ms (index: ${myIndex})`);
        
        migrationTimeoutRef.current = window.setTimeout(() => {
          if (peerRef.current) {
            setupAsHost(peerRef.current, roomPeerId);
          }
        }, waitTime);
      };

      const setupAsHost = (p: Peer, id: string) => {
        p.destroy();
        // 指定された部屋名IDでPeerを作成（成功すればホストになれる）
        const hostPeer = new Peer(id);
        peerRef.current = hostPeer;

        hostPeer.on('open', () => {
          console.log('You are now the HOST:', id);
          setSession({ isConnected: true, isHost: true });
          
          // ホストになったことをシステムメッセージで通知（任意）
          const state = useStore.getState();
          useStore.getState().addMessage({
            id: 'system-' + Date.now(),
            room_id: session.roomId!,
            handle_name: 'SYSTEM',
            content: `${session.handleName} が新しいホストになりました。`,
            is_system: true,
            created_at: new Date().toISOString(),
          });
        });

        hostPeer.on('connection', (conn) => {
          console.log('Client connected:', conn.peer);
          
          conn.on('open', () => {
            const state = useStore.getState();
            // 現在の全状態を同期
            conn.send({
              type: 'STATE_SYNC',
              units: state.units,
              messages: state.messages,
              teamDP: state.teamDP,
              users: state.users,
            });
          });

          conn.on('data', (data) => {
            const payload = data as SyncPayload;
            
            // ユーザー参加通知の場合、ハンドルネームを保存
            if (payload.type === 'USER_JOIN') {
              const existing = connectionsRef.current.find(c => c.conn.peer === conn.peer);
              if (existing) existing.handleName = payload.handleName;
              else connectionsRef.current.push({ conn, handleName: payload.handleName });
            }

            onSync(payload);
            
            // 他の全クライアントにブロードキャスト
            connectionsRef.current.forEach(c => {
              if (c.conn.peer !== conn.peer && c.conn.open) {
                c.conn.send(payload);
              }
            });
          });
          
          conn.on('close', () => {
            const closedConn = connectionsRef.current.find(c => c.conn.peer === conn.peer);
            if (closedConn?.handleName) {
              const newUsers = useStore.getState().users.filter(u => u !== closedConn.handleName);
              setUsers(newUsers);
              // ユーザーリストの更新を通知
              const updatePayload: SyncPayload = { type: 'USERS_UPDATE', users: newUsers };
              connectionsRef.current.forEach(c => {
                if (c.conn.open) c.conn.send(updatePayload);
              });
            }
            connectionsRef.current = connectionsRef.current.filter(c => c.conn.peer !== conn.peer);
          });
        });

        hostPeer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
            console.log('Host ID taken. Trying to reconnect as client...');
            // 他の誰かがホストになったので、自分はクライアントとして再接続
            setTimeout(() => initializeConnection(), 1000);
          }
        });
      };

      setBroadcastHandler((payload: SyncPayload) => {
        connectionsRef.current.forEach(c => {
          if (c.conn.open) {
            c.conn.send(payload);
          }
        });
      });

      initializeConnection();
    }

    if (session.roomId && session.handleName) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
        connectionsRef.current = [];
      }
    }

    return () => {
      if (migrationTimeoutRef.current) window.clearTimeout(migrationTimeoutRef.current);
    };
  }, [session.roomId, session.handleName, session.roomName]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoggedIn ? (
        <Login />
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default App;
