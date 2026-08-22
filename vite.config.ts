import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function localSyncPlugin(): Plugin {
  const rooms: Record<string, { state: any; events: Array<{ id: number; event: any }> }> = {};
  let eventCounter = 0;

  return {
    name: 'vite-plugin-local-sync',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        if (!rawUrl.startsWith('/api/sync')) {
          return next();
        }

        const url = new URL(rawUrl, `http://${req.headers.host || 'localhost:3000'}`);

        // CORS headers for all sync requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        // 1. SSE Event Stream: GET /api/sync/events?room=AUCT-XX&since=0
        if (url.pathname === '/api/sync/events' && req.method === 'GET') {
          const roomCode = (url.searchParams.get('room') || 'default').toUpperCase().trim();
          const since = parseInt(url.searchParams.get('since') || '0', 10);

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          if (!rooms[roomCode]) {
            rooms[roomCode] = { state: null, events: [] };
          }

          // Immediately send missed events
          const missed = rooms[roomCode].events.filter(e => e.id > since);
          missed.forEach(e => {
            res.write(`data: ${JSON.stringify(e)}\n\n`);
          });

          let lastSentId = rooms[roomCode].events.length > 0 
            ? rooms[roomCode].events[rooms[roomCode].events.length - 1].id 
            : since;

          const interval = setInterval(() => {
            if (!rooms[roomCode]) return;
            const newEvents = rooms[roomCode].events.filter(e => e.id > lastSentId);
            if (newEvents.length > 0) {
              newEvents.forEach(e => {
                res.write(`data: ${JSON.stringify(e)}\n\n`);
                lastSentId = Math.max(lastSentId, e.id);
              });
            } else {
              res.write(': ping\n\n');
            }
          }, 150);

          req.on('close', () => {
            clearInterval(interval);
          });
          return;
        }

        // 2. Broadcast Event: POST /api/sync/broadcast
        if (url.pathname === '/api/sync/broadcast' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const roomCode = (data.roomCode || 'default').toUpperCase().trim();
              const event = data.event;

              if (!rooms[roomCode]) {
                rooms[roomCode] = { state: null, events: [] };
              }

              eventCounter++;
              const record = { id: eventCounter, event };
              rooms[roomCode].events.push(record);

              // Maintain rolling window of 200 events
              if (rooms[roomCode].events.length > 200) {
                rooms[roomCode].events.splice(0, rooms[roomCode].events.length - 200);
              }

              // Update room state in memory
              if (event?.type === 'ROOM_STATE_SYNC') {
                rooms[roomCode].state = {
                  ...(rooms[roomCode].state || {}),
                  ...event.payload
                };
              } else if (event?.type === 'PLAYER_JOINED' && event.payload?.id) {
                const currentPlayers = rooms[roomCode].state?.players || {};
                rooms[roomCode].state = {
                  ...(rooms[roomCode].state || {}),
                  players: {
                    ...currentPlayers,
                    [event.payload.id]: {
                      id: event.payload.id,
                      name: event.payload.name,
                      isHost: event.payload.isHost,
                      isAi: false,
                      profile: event.payload.profile,
                      score: 0,
                      bankedProfit: 0,
                      contractsWon: 0,
                      reputation: event.payload.profile?.reputationScore || 50,
                      intelPoints: 2,
                      disciplineWalkaways: 0,
                      ready: false,
                      submittedQuote: null,
                      history: []
                    }
                  }
              } else if (event?.type === 'PLAYER_PROFILE_UPDATED' && event.payload?.playerId) {
                const targetId = event.payload.playerId;
                if (rooms[roomCode].state?.players?.[targetId]) {
                  rooms[roomCode].state.players[targetId].profile = {
                    ...rooms[roomCode].state.players[targetId].profile,
                    ...event.payload.stats,
                    ...(event.payload.profile || {})
                  };
                  rooms[roomCode].state.players[targetId].ready = true;
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, id: eventCounter }));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
            }
          });
          return;
        }

        // 3. Room State Snapshot: GET /api/sync/state?room=AUCT-XX
        if (url.pathname === '/api/sync/state' && req.method === 'GET') {
          const roomCode = (url.searchParams.get('room') || 'default').toUpperCase().trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            roomCode,
            state: rooms[roomCode]?.state || null,
            eventsCount: rooms[roomCode]?.events.length || 0
          }));
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localSyncPlugin()],
  server: {
    port: 3000,
    host: true,
    open: false
  }
});
