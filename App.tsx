import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Peer, { DataConnection } from 'peerjs';
import { SyncPayload } from './types';

const PEER_PREFIX = 'dangeros-room-';

const App: React.FC = () => {
  const { session, setSession, onSync, setBroadcastHandler } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);

  useEffect(() => {
    if (session.roomId && session.handleName && !peerRef.current) {
      const peerId = PEER_PREFIX + session.roomName;
      
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Peer ID:', id);
        
        const conn = peer.connect(peerId);
        
        conn.on('open', () => {
          console.log('Connected to host');
          connectionsRef.current.push(conn);
          setSession({ isConnected: true, isHost: false });
          conn.send({ type: 'USER_JOIN', handleName: session.handleName });
        });

        conn.on('data', (data) => {
          onSync(data as SyncPayload);
        });

        conn.on('error', (err) => {
          console.log('Connection error, becoming host...');
          setupAsHost(peer, peerId);
        });

        const timeout = setTimeout(() => {
          if (connectionsRef.current.length === 0) {
            setupAsHost(peer, peerId);
          }
        }, 3000);

        return () => clearTimeout(timeout);
      });

      const setupAsHost = (p: Peer, id: string) => {
        p.destroy();
        const hostPeer = new Peer(id);
        peerRef.current = hostPeer;

        hostPeer.on('open', () => {
          console.log('Acting as Host:', id);
          setSession({ isConnected: true, isHost: true });
        });

        hostPeer.on('connection', (conn) => {
          console.log('New client connected');
          connectionsRef.current.push(conn);

          conn.on('open', () => {
            const state = useStore.getState();
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
            onSync(payload);
            connectionsRef.current.forEach(c => {
              if (c.peer !== conn.peer) c.send(payload);
            });
          });
          
          conn.on('close', () => {
            connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          });
        });

        hostPeer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
             console.error('ID taken, someone else is host.');
          }
        });
      };

      setBroadcastHandler((payload: SyncPayload) => {
        connectionsRef.current.forEach(conn => {
          if (conn.open) {
            conn.send(payload);
          }
        });
      });
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
  }, [session.roomId, session.handleName, onSync, setBroadcastHandler, setSession, session.roomName]);

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