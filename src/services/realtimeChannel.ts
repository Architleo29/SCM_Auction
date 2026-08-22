import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; payload: { id: string; name: string; isHost: boolean; profile: any } }
  | { type: 'PLAYER_LEFT'; payload: { id: string } }
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
  private supabaseChannel: RealtimeChannel | null = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  public isConnectedToSupabase: boolean = false;
  private processedEventIds: Set<number> = new Set();

  public subscribe(roomCode: string, onEvent: EventHandler) {
    this.roomCode = roomCode.toUpperCase();
    this.eventHandlers.add(onEvent);

    // 1. LAN Realtime Server-Sent Events (SSE) - Works across all Wi-Fi / Local Network devices (PC + Mobile)
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        this.eventSource = new EventSource(`/api/sync/events?room=${encodeURIComponent(this.roomCode)}`);
        
        this.eventSource.onmessage = (event) => {
          try {
            if (!event.data || event.data === ': ping') return;
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.id && this.processedEventIds.has(parsed.id)) {
              return; // avoid duplicate processing
            }
            if (parsed && parsed.id) {
              this.processedEventIds.add(parsed.id);
              // limit set size
              if (this.processedEventIds.size > 200) {
                const first = this.processedEventIds.values().next().value;
                if (first !== undefined) this.processedEventIds.delete(first);
              }
            }
            if (parsed && parsed.event) {
              this.notifyHandlers(parsed.event as MultiplayerEvent);
            }
          } catch (e) {
            console.warn('LAN SSE parse error:', e);
          }
        };

        this.eventSource.onerror = (err) => {
          console.warn('LAN SSE connection notice:', err);
        };
      }
    } catch (e) {
      console.warn('EventSource initialization notice:', e);
    }

    // 2. Supabase Realtime Channel (Cloud fallback)
    const client = getSupabaseClient();
    if (client) {
      try {
        this.supabaseChannel = client.channel(`room:${this.roomCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: this.roomCode }
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

    // 3. Same-Browser Local Fallback (Tabs on same browser)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.localBroadcastChannel = new BroadcastChannel(`scm_room_${this.roomCode}`);
        this.localBroadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.notifyHandlers(event.data as MultiplayerEvent);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }
  }

  public broadcast(event: MultiplayerEvent) {
    if (!this.roomCode) return;

    // 1. Send via LAN Local Sync API (Instantly reaches all mobile & desktop clients on network)
    try {
      fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: this.roomCode,
          event
        })
      }).catch(err => {
        console.warn('LAN sync broadcast notice:', err);
      });
    } catch (e) {}

    // 2. Send via Supabase if connected
    if (this.supabaseChannel && this.isConnectedToSupabase) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      });
    }

    // 3. Send via Local BroadcastChannel
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.postMessage(event);
    }
  }

  public unsubscribe(onEvent?: EventHandler) {
    if (onEvent) {
      this.eventHandlers.delete(onEvent);
    } else {
      this.eventHandlers.clear();
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

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
