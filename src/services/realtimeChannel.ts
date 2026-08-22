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
  private eventHandlers: Set<EventHandler> = new Set();
  public isConnectedToSupabase: boolean = false;

  public subscribe(roomCode: string, onEvent: EventHandler) {
    this.roomCode = roomCode;
    this.eventHandlers.add(onEvent);

    const client = getSupabaseClient();

    // 1. Supabase Realtime Channel
    if (client) {
      try {
        this.supabaseChannel = client.channel(`room:${roomCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: roomCode }
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
        console.warn('Supabase realtime subscription error, using local fallback:', err);
      }
    }

    // 2. Local Fallback BroadcastChannel (works across tabs in the same browser)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.localBroadcastChannel = new BroadcastChannel(`scm_room_${roomCode}`);
        this.localBroadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.notifyHandlers(event.data as MultiplayerEvent);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }
  }

  public broadcast(event: MultiplayerEvent) {
    // 1. Send via Supabase if connected
    if (this.supabaseChannel && this.isConnectedToSupabase) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      });
    }

    // 2. Send via Local BroadcastChannel
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
