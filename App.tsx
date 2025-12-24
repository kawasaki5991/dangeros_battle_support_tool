
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store.ts';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import Peer, { DataConnection } from 'peerjs';
import { SyncPayload } from './types.ts';

const PEER_PREFIX = 'dangeros-room-';

const App: React.FC = () => {
  const { session, setSession, onSync, setBroadcastHandler, units, messages, teamDP, users } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);

  useEffect(() => {
    if (session.roomId && session.handleName && !peerRef.current) {
      const peerId = PEER_PREFIX + session.roomName;
      
      // Initialize Peer
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Peer ID:', id);
        
        // Try to connect to the host (the person with the ID of the room name)
        const conn = peer.connect(peerId);
        
        conn.on('open', () => {
          console.log('Connected to host');
          connectionsRef.current.push(conn);
          setSession({ isConnected: true, isHost: false });
          // Inform host about join
          conn.send({ type: 'USER_JOIN', handleName: session.handleName });
        });

        conn.on('data', (data) => {
          onSync(data as SyncPayload);
        });

        conn.on('error', (err) => {
          console.log('Connection error, becoming host...');
          setupAsHost(peer, peerId);
        });

        // If connection fails within 3 seconds, assume host
        const timeout = setTimeout(() => {
          if (connectionsRef.current.length === 0) {
            setupAsHost(peer, peerId);
          }
        }, 3000);

        return () => clearTimeout(timeout);
      });

      const setupAsHost = (p: Peer, id: string) => {
        // Re-create peer with the room name as ID if possible
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
            // Send current full state to the new client
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
            // Broadcast to other clients
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
             // Already a host exists? Should not happen often with the logic above
             console.error('ID taken, someone else is host.');
          }
        });
      };

      // Set up broadcast handler
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
  }, [session.roomId, session.handleName]);

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
