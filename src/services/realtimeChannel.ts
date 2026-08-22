import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MultiplayerEvent = 
  | { type: 'PLAYER_JOINED'; payload: { id: string; name: string; isHost: boolean; profile: any } }
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
  private supabaseChannel: RealtimeChannel | null = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private cloudEventSource: EventSource | null = null;
  private localEventSource: EventSource | null = null;
  private pollingInterval: any = null;
  private lastPollTimestamp: number = 0;
  private eventHandlers: Set<EventHandler> = new Set();
  public isConnectedToSupabase: boolean = false;
  public isCloudConnected: boolean = false;
  private processedEventIds: Set<string> = new Set();

  private getTopic(roomCode: string): string {
    const clean = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `scm_auct_${clean || 'MAIN'}`;
  }

  public subscribe(roomCode: string, onEvent: EventHandler) {
    const formattedCode = roomCode.toUpperCase().trim();
    this.roomCode = formattedCode;
    this.eventHandlers.add(onEvent);
    this.processedEventIds.clear();
    this.lastPollTimestamp = Math.floor(Date.now() / 1000) - 10;

    const topic = this.getTopic(formattedCode);

    // 1. Universal Cloud Real-Time PubSub via HTTPS/SSE (Works globally on Vercel, Mobile, Desktop with 0 config)
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        if (this.cloudEventSource) {
          this.cloudEventSource.close();
          this.cloudEventSource = null;
        }

        const sseUrl = `https://ntfy.sh/${encodeURIComponent(topic)}/sse`;
        this.cloudEventSource = new EventSource(sseUrl);

        this.cloudEventSource.onopen = () => {
          this.isCloudConnected = true;
        };

        this.cloudEventSource.onmessage = (event) => {
          try {
            if (!event.data) return;
            const parsed = JSON.parse(event.data);
            if (parsed.event === 'open' || parsed.event === 'keepalive') return;

            const msgId = parsed.id || '';
            if (msgId && this.processedEventIds.has(msgId)) return;
            if (msgId) {
              this.processedEventIds.add(msgId);
              if (this.processedEventIds.size > 300) {
                const first = this.processedEventIds.values().next().value;
                if (first !== undefined) this.processedEventIds.delete(first);
              }
            }

            if (parsed.message) {
              const gameEvent = JSON.parse(parsed.message) as MultiplayerEvent;
              if (gameEvent && gameEvent.type) {
                this.notifyHandlers(gameEvent);
              }
            }
          } catch (e) {
            console.warn('Cloud SSE parse notice:', e);
          }
        };

        this.cloudEventSource.onerror = () => {
          // Automatic browser reconnect
        };
      }
    } catch (err) {
      console.warn('Cloud EventSource initialization notice:', err);
    }

    // 2. High-Frequency Polling Fallback over Cloud PubSub (Protects against Mobile Background Sleeping)
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.roomCode) return;
        const topic = this.getTopic(this.roomCode);
        const pollUrl = `https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1&since=${this.lastPollTimestamp}`;
        const res = await fetch(pollUrl);
        if (!res.ok) return;

        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);

        lines.forEach(line => {
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === 'message' && parsed.message) {
              const msgId = parsed.id || '';
              if (!this.processedEventIds.has(msgId)) {
                if (msgId) this.processedEventIds.add(msgId);
                const gameEvent = JSON.parse(parsed.message) as MultiplayerEvent;
                if (gameEvent && gameEvent.type) {
                  this.notifyHandlers(gameEvent);
                }
              }
              if (parsed.time) {
                this.lastPollTimestamp = Math.max(this.lastPollTimestamp, parsed.time);
              }
            }
          } catch (e) {}
        });
      } catch (err) {}
    }, 600);

    // 3. Local Vite Dev Server Fallback (For local localhost / LAN mode)
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        if (this.localEventSource) {
          this.localEventSource.close();
          this.localEventSource = null;
        }

        this.localEventSource = new EventSource(`/api/sync/events?room=${encodeURIComponent(formattedCode)}`);
        this.localEventSource.onmessage = (event) => {
          try {
            if (!event.data || event.data === ': ping') return;
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.event) {
              this.notifyHandlers(parsed.event as MultiplayerEvent);
            }
          } catch (e) {}
        };
        this.localEventSource.onerror = () => {};
      }
    } catch (e) {}

    // 4. Supabase Realtime Channel (If user provided custom Supabase credentials)
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

    // 5. Local BroadcastChannel (For tabs on the same browser)
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
    } catch (e) {}
  }

  public async broadcast(event: MultiplayerEvent, explicitRoomCode?: string) {
    const targetRoom = (explicitRoomCode || this.roomCode).toUpperCase().trim();
    if (!targetRoom) return;

    const topic = this.getTopic(targetRoom);
    const eventPayload = JSON.stringify(event);

    // 1. Worldwide Cloud PubSub via HTTPS (Reaches all mobile & desktop devices on Vercel instantly)
    try {
      fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: {
          'Title': 'SCM_EVENT',
          'Priority': 'urgent',
          'Content-Type': 'text/plain'
        },
        body: eventPayload
      }).catch(err => {
        console.warn('Cloud broadcast notice:', err);
      });
    } catch (err) {}

    // 2. LAN Local Sync API (If running locally via vite dev server)
    try {
      fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: targetRoom,
          event
        })
      }).catch(() => {});
    } catch (err) {}

    // 3. Send via Supabase if connected
    if (this.supabaseChannel && this.isConnectedToSupabase) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      }).catch(err => console.warn('Supabase broadcast error:', err));
    }

    // 4. Local BroadcastChannel
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

    if (this.cloudEventSource) {
      this.cloudEventSource.close();
      this.cloudEventSource = null;
    }

    if (this.localEventSource) {
      this.localEventSource.close();
      this.localEventSource = null;
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
