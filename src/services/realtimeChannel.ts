import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; payload: { id: string; name: string; isHost: boolean; profile: any } }
  | { type: 'PLAYER_LEFT'; payload: { id: string } }
  | { type: 'PLAYER_PROFILE_UPDATED'; payload: { playerId: string; stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }; profile?: any } }
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
  private pollingInterval: any = null;
  private lastPollId: number = 0;
  private eventHandlers: Set<EventHandler> = new Set();
  public isConnectedToSupabase: boolean = false;
  private processedEventIds: Set<number> = new Set();

  public subscribe(roomCode: string, onEvent: EventHandler) {
    const formattedCode = roomCode.toUpperCase().trim();
    this.roomCode = formattedCode;
    this.eventHandlers.add(onEvent);
    this.processedEventIds.clear();
    this.lastPollId = 0;

    // 1. LAN Realtime Server-Sent Events (SSE) - Works across all Wi-Fi / Local Network devices (PC + Mobile)
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        this.eventSource = new EventSource(`/api/sync/events?room=${encodeURIComponent(formattedCode)}`);
        
        this.eventSource.onmessage = (event) => {
          try {
            if (!event.data || event.data === ': ping') return;
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.id && this.processedEventIds.has(parsed.id)) {
              return; // avoid duplicate processing
            }
            if (parsed && parsed.id) {
              this.processedEventIds.add(parsed.id);
              this.lastPollId = Math.max(this.lastPollId, parsed.id);
              if (this.processedEventIds.size > 300) {
                const first = this.processedEventIds.values().next().value;
                if (first !== undefined) this.processedEventIds.delete(first);
              }
            }
            if (parsed && parsed.event) {
              this.notifyHandlers(parsed.event as MultiplayerEvent);
            }
          } catch (e) {
            console.warn('LAN SSE parse notice:', e);
          }
        };

        this.eventSource.onerror = (err) => {
          console.warn('LAN SSE connection notice:', err);
        };
      }
    } catch (e) {
      console.warn('EventSource initialization notice:', e);
    }

    // 2. High-Frequency Polling Fallback (Guarantees immediate receipt on mobile / unstable browsers)
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.roomCode) return;
        const res = await fetch(`/api/sync/poll?room=${encodeURIComponent(this.roomCode)}&since=${this.lastPollId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.events)) {
          data.events.forEach((rec: { id: number; event: MultiplayerEvent }) => {
            if (rec && rec.id && !this.processedEventIds.has(rec.id)) {
              this.processedEventIds.add(rec.id);
              this.lastPollId = Math.max(this.lastPollId, rec.id);
              if (rec.event) {
                this.notifyHandlers(rec.event);
              }
            }
          });
        }
        if (data && data.lastId !== undefined) {
          this.lastPollId = Math.max(this.lastPollId, data.lastId);
        }
      } catch (err) {
        // silent catch
      }
    }, 450);

    // 3. Supabase Realtime Channel (Cloud fallback)
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

    // 4. Same-Browser Local Fallback (Tabs on same browser)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
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
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }
  }

  public async broadcast(event: MultiplayerEvent, explicitRoomCode?: string) {
    const targetRoom = (explicitRoomCode || this.roomCode).toUpperCase().trim();
    if (!targetRoom) return;

    // 1. Send via LAN Local Sync API (Instantly reaches all mobile & desktop clients on network)
    try {
      await fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: targetRoom,
          event
        })
      });
    } catch (err) {
      console.warn('LAN sync broadcast notice:', err);
    }

    // 2. Send via Supabase if connected
    if (this.supabaseChannel && this.isConnectedToSupabase) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      }).catch(err => console.warn('Supabase broadcast error:', err));
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

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
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
