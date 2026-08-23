import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Peer, DataConnection } from 'peerjs';

export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; payload: { id: string; name: string; isHost: boolean; profile: any; ready?: boolean } }
  | { type: 'PLAYER_HEARTBEAT'; payload: { player: any } }
  | { type: 'PLAYER_LEFT'; payload: { id: string } }
  | { type: 'PLAYER_PROFILE_UPDATED'; payload: { playerId: string; stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }; profile?: any } }
  | { type: 'PLAYER_READY_TOGGLED'; payload: { playerId: string; ready: boolean } }
  | { type: 'ROOM_STATE_SYNC'; payload: any }
  | { type: 'QUOTE_SUBMITTED'; payload: { playerId: string; quote: any } }
  | { type: 'AUCTION_BID'; payload: { playerId: string; playerName: string; amount: number; isAi: boolean } }
  | { type: 'AUCTION_BUZZ'; payload: { playerId: string; playerName: string; price: number } }
  | { type: 'AUCTION_EXIT'; payload: { playerId: string; playerName: string; exitPrice: number } }
  | { type: 'DYNAMIC_EVENT_TRIGGERED'; payload: any }
  | { type: 'NEXT_PHASE'; payload: { phase: string; data?: any } };

type EventHandler = (event: MultiplayerEvent) => void;

class RoomSyncManager {
  private roomCode: string = '';
  private isHost: boolean = false;
  private peer: Peer | null = null;
  private hostConnection: DataConnection | null = null;
  private guestConnections: Map<string, DataConnection> = new Map();
  private supabaseChannel: RealtimeChannel | null = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  public isConnectedToSupabase: boolean = false;
  public isPeerConnected: boolean = false;
  private pendingOutgoing: MultiplayerEvent[] = [];
  private reconnectInterval: any = null;
  private storageListener: any = null;

  private getHostPeerId(roomCode: string): string {
    const clean = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `scm-auction-host-${clean || 'MAIN'}`;
  }

  public subscribe(roomCode: string, onEvent: EventHandler, isHost: boolean = false) {
    const formattedCode = roomCode.toUpperCase().trim();
    this.roomCode = formattedCode;
    this.isHost = isHost;
    this.eventHandlers.add(onEvent);

    const hostPeerId = this.getHostPeerId(formattedCode);

    // 1. WebRTC Direct P2P Transport (PeerJS)
    try {
      if (typeof window !== 'undefined') {
        this.cleanupPeer();

        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ];

        if (isHost) {
          // Host claims the room peer ID
          this.peer = new Peer(hostPeerId, {
            debug: 0,
            config: { iceServers }
          });

          this.peer.on('open', () => {
            this.isPeerConnected = true;
          });

          this.peer.on('connection', (conn) => {
            this.guestConnections.set(conn.peer, conn);

            conn.on('open', () => {
              // Trigger state broadcast when a guest connects
            });

            conn.on('data', (data) => {
              try {
                const event = data as MultiplayerEvent;
                if (event && event.type) {
                  this.notifyHandlers(event);
                  // Host relays guest event to all other connected guests
                  this.guestConnections.forEach((otherConn, pId) => {
                    if (pId !== conn.peer && otherConn.open) {
                      otherConn.send(event);
                    }
                  });
                }
              } catch (e) {}
            });

            conn.on('close', () => {
              this.guestConnections.delete(conn.peer);
            });

            conn.on('error', () => {
              this.guestConnections.delete(conn.peer);
            });
          });

          this.peer.on('error', (err) => {
            console.warn('Host peer notice:', err?.type);
          });

        } else {
          // Guest creates an ephemeral peer and connects to the Host
          this.peer = new Peer({
            debug: 0,
            config: { iceServers }
          });

          this.peer.on('open', () => {
            this.isPeerConnected = true;
            this.connectToHost(hostPeerId);
          });

          this.peer.on('error', (err) => {
            console.warn('Guest peer notice:', err?.type);
          });

          // Periodic guest reconnect attempt if not connected
          if (this.reconnectInterval) clearInterval(this.reconnectInterval);
          this.reconnectInterval = setInterval(() => {
            if (!this.isHost && this.roomCode && (!this.hostConnection || !this.hostConnection.open)) {
              this.connectToHost(hostPeerId);
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.warn('PeerJS init error:', err);
    }

    // 2. Supabase Realtime Channel (If user provided Supabase config)
    const client = getSupabaseClient();
    if (client) {
      try {
        if (this.supabaseChannel) {
          this.supabaseChannel.unsubscribe();
          this.supabaseChannel = null;
        }

        this.supabaseChannel = client.channel(`room:${formattedCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: formattedCode }
          }
        });

        this.supabaseChannel
          .on('broadcast', { event: 'game_event' }, (payload) => {
            if (payload && payload.payload) {
              this.notifyHandlers(payload.payload as MultiplayerEvent);
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.isConnectedToSupabase = true;
            }
          });
      } catch (err) {
        console.warn('Supabase realtime subscription notice:', err);
      }
    }

    // 3. Local BroadcastChannel & Storage Event (For tabs on the same browser/device)
    try {
      if (typeof window !== 'undefined') {
        if ('BroadcastChannel' in window) {
          if (this.localBroadcastChannel) {
            this.localBroadcastChannel.close();
            this.localBroadcastChannel = null;
          }
          this.localBroadcastChannel = new BroadcastChannel(`scm_room_${formattedCode}`);
          this.localBroadcastChannel.onmessage = (event) => {
            if (event.data) {
              this.notifyHandlers(event.data as MultiplayerEvent);
            }
          };
        }

        // localStorage fallback for cross-tab events
        if (this.storageListener) {
          window.removeEventListener('storage', this.storageListener);
        }
        this.storageListener = (e: StorageEvent) => {
          if (e.key && e.key.startsWith(`scm_event_${formattedCode}`) && e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue);
              if (parsed && parsed.type) {
                this.notifyHandlers(parsed as MultiplayerEvent);
              }
            } catch (err) {}
          }
        };
        window.addEventListener('storage', this.storageListener);
      }
    } catch (e) {}
  }

  private connectToHost(hostPeerId: string) {
    if (!this.peer || this.peer.destroyed) return;
    if (this.hostConnection && this.hostConnection.open) return;

    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      conn.on('open', () => {
        // Send all queued outgoing messages
        while (this.pendingOutgoing.length > 0) {
          const ev = this.pendingOutgoing.shift();
          if (ev) conn.send(ev);
        }
      });

      conn.on('data', (data) => {
        try {
          const event = data as MultiplayerEvent;
          if (event && event.type) {
            this.notifyHandlers(event);
          }
        } catch (e) {}
      });

      conn.on('close', () => {
        this.hostConnection = null;
      });

      conn.on('error', () => {
        this.hostConnection = null;
      });
    } catch (e) {}
  }

  public broadcast(event: MultiplayerEvent, explicitRoomCode?: string) {
    const code = explicitRoomCode || this.roomCode;

    // 1. Send via WebRTC P2P
    try {
      if (this.isHost) {
        // Host broadcasts to all connected guests
        this.guestConnections.forEach((conn) => {
          if (conn.open) {
            conn.send(event);
          }
        });
      } else {
        // Guest sends to Host
        if (this.hostConnection && this.hostConnection.open) {
          this.hostConnection.send(event);
        } else {
          this.pendingOutgoing.push(event);
          if (this.pendingOutgoing.length > 25) {
            this.pendingOutgoing.shift();
          }
        }
      }
    } catch (err) {
      console.warn('P2P broadcast notice:', err);
    }

    // 2. Send via Supabase if connected
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      }).catch(err => console.warn('Supabase broadcast error:', err));
    }

    // 3. Local BroadcastChannel
    if (this.localBroadcastChannel) {
      try {
        this.localBroadcastChannel.postMessage(event);
      } catch (e) {}
    }

    // 4. LocalStorage Cross-Tab Notification
    try {
      if (typeof window !== 'undefined' && window.localStorage && code) {
        const key = `scm_event_${code}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        localStorage.setItem(key, JSON.stringify(event));
        setTimeout(() => {
          try { localStorage.removeItem(key); } catch (e) {}
        }, 1000);
      }
    } catch (e) {}
  }

  private cleanupPeer() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }

    if (this.hostConnection) {
      try { this.hostConnection.close(); } catch (e) {}
      this.hostConnection = null;
    }
    this.guestConnections.forEach(conn => {
      try { conn.close(); } catch (e) {}
    });
    this.guestConnections.clear();

    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
      this.isPeerConnected = false;
    }
  }

  public unsubscribe(onEvent?: EventHandler) {
    if (onEvent) {
      this.eventHandlers.delete(onEvent);
    } else {
      this.eventHandlers.clear();
    }

    this.cleanupPeer();

    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
      this.isConnectedToSupabase = false;
    }

    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.close();
      this.localBroadcastChannel = null;
    }
  }

  private notifyHandlers(event: MultiplayerEvent) {
    this.eventHandlers.forEach((handler) => handler(event));
  }
}

export const roomSync = new RoomSyncManager();
