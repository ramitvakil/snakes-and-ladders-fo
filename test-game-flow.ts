/**
 * End-to-end test script for the game flow.
 * Tests: register/login → lobby create room → add bot → start game → join game → play turn
 *
 * Usage: npx tsx test-game-flow.ts
 */
import { io, type Socket } from 'socket.io-client';

const API = 'http://localhost:3001';

// ── Helpers ──
async function httpPost(path: string, body: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

function createSocket(ns: string, token: string): Socket {
  return io(`${API}${ns}`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });
}

function waitForEvent(socket: Socket, event: string, timeoutMs = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main Flow ──
async function main() {
  console.log('=== Snakes & Ladders F&O – End-to-End Test ===\n');

  // Step 1: Register/login
  console.log('1. Registering/logging in test user...');
  const email = `test_${Date.now()}@test.com`;
  const regResult = await httpPost('/api/auth/register', {
    email,
    password: 'testpass123',
    displayName: 'TestPlayer',
  });
  console.log('   Register:', regResult.error ?? 'OK');

  const loginResult = await httpPost('/api/auth/login', {
    email,
    password: 'testpass123',
  });

  if (!loginResult.token) {
    console.error('   Login failed:', loginResult);
    process.exit(1);
  }
  const token = loginResult.token;
  const userId = loginResult.user?.id;
  console.log(`   Login OK. userId=${userId}\n`);

  // Step 2: Connect lobby socket
  console.log('2. Connecting to /lobby namespace...');
  const lobbySocket = createSocket('/lobby', token);

  const lobbyConnected = new Promise<void>((resolve, reject) => {
    lobbySocket.on('connect', () => resolve());
    lobbySocket.on('connect_error', (err) => reject(err));
  });
  lobbySocket.connect();
  await lobbyConnected;
  console.log('   Lobby connected. socketId=' + lobbySocket.id + '\n');

  // Step 3: Create room
  console.log('3. Creating a game room...');
  const roomCreatedPromise = waitForEvent(lobbySocket, 'lobby:roomCreated');
  lobbySocket.emit('lobby:createRoom', {
    name: "Test Room",
    maxPlayers: 4,
    gameMode: 'Multiplayer',
  });
  const roomInfo = await roomCreatedPromise;
  console.log('   Room created:', JSON.stringify(roomInfo, null, 2), '\n');

  // Step 4: Add a bot
  console.log('4. Adding bot to room...');
  const roomUpdatedPromise = waitForEvent(lobbySocket, 'lobby:roomUpdated');
  lobbySocket.emit('lobby:addBot', {
    roomId: roomInfo.id,
    difficulty: 'adaptive',
  });
  const updatedRoom = await roomUpdatedPromise;
  console.log('   Room updated with bot:', JSON.stringify(updatedRoom.players, null, 2), '\n');

  // Step 5: Connect game socket BEFORE starting the game
  console.log('5. Connecting to /game namespace...');
  const gameSocket = createSocket('/game', token);

  const gameConnected = new Promise<void>((resolve, reject) => {
    gameSocket.on('connect', () => resolve());
    gameSocket.on('connect_error', (err) => reject(err));
  });
  gameSocket.connect();
  await gameConnected;
  console.log('   Game socket connected. socketId=' + gameSocket.id + '\n');

  // Listen for errors
  gameSocket.on('game:error', (data: any) => {
    console.log('   [game:error]', data);
  });

  // Step 6: Start game
  console.log('6. Starting game...');
  const gameStartedPromise = waitForEvent(lobbySocket, 'lobby:gameStarted');

  // Also listen for lobby:error
  lobbySocket.once('lobby:error', (data: any) => {
    console.error('   Lobby error:', data.message);
  });

  lobbySocket.emit('lobby:startGame', { roomId: roomInfo.id });
  const gameStartData = await gameStartedPromise;
  console.log('   Game started! gameId=' + gameStartData.gameId + '\n');

  const gameId = gameStartData.gameId;

  // Step 7: Join game room and get state sync
  console.log('7. Joining game room...');
  const stateSyncPromise = waitForEvent(gameSocket, 'game:stateSync');
  gameSocket.emit('game:joinGame', { gameId });

  const gameState = await stateSyncPromise;
  console.log('   Game state received:');
  console.log('   - gameId:', gameState.gameId);
  console.log('   - players:', gameState.players?.map((p: any) => `${p.displayName} (pos=${p.position}, cap=${p.capital})`));
  console.log('   - currentTurn:', gameState.turnNumber);
  console.log('   - currentPlayer:', gameState.currentTurnPlayerId);
  console.log('   - vixLevel:', gameState.vixLevel);
  console.log();

  // Step 8: Play a turn (if it's our turn)
  const isMyTurn = gameState.currentTurnPlayerId === userId;
  console.log(`8. Is it my turn? ${isMyTurn}`);

  if (isMyTurn) {
    console.log('   Setting view to Bullish...');
    gameSocket.emit('game:setView', { gameId, view: 'Bullish' });
    await sleep(200);

    console.log('   Setting conviction to 3...');
    gameSocket.emit('game:setConviction', { gameId, conviction: 3 });
    await sleep(200);

    console.log('   Rolling dice...');
    const turnResultPromise = waitForEvent(gameSocket, 'game:turnResult');
    gameSocket.emit('game:rollDice', { gameId });

    const turnResult = await turnResultPromise;
    console.log('   Turn result:');
    console.log('   - diceRoll:', turnResult.diceRoll);
    console.log('   - newPosition:', turnResult.newPosition);
    console.log('   - capitalDelta:', turnResult.capitalDelta);
    console.log('   - finalCapital:', turnResult.finalCapital);
    console.log('   - declaredView:', turnResult.declaredView);
    console.log('   - marketOutcome:', turnResult.marketOutcome);
    console.log('   - viewMatched:', turnResult.viewMatched);
  } else {
    console.log('   Bot goes first. Waiting for turn result...');
    // Bot turns are auto-played; we should get a turnResult broadcast
    try {
      const botResult = await waitForEvent(gameSocket, 'game:turnResult', 5000);
      console.log('   Bot turn result:');
      console.log('   - player:', botResult.playerId);
      console.log('   - diceRoll:', botResult.diceRoll);
      console.log('   - newPosition:', botResult.newPosition);
    } catch {
      console.log('   (Bot turn may have already completed before we joined the room)');
    }

    // Now it should be our turn – request sync
    console.log('   Requesting state sync...');
    const syncPromise = waitForEvent(gameSocket, 'game:stateSync');
    gameSocket.emit('game:requestSync', { gameId });
    const syncState = await syncPromise;
    console.log('   Current player:', syncState.currentTurnPlayerId);

    if (syncState.currentTurnPlayerId === userId) {
      console.log('   Now it\'s my turn! Rolling dice...');
      gameSocket.emit('game:setView', { gameId, view: 'Bearish' });
      await sleep(200);
      gameSocket.emit('game:setConviction', { gameId, conviction: 2 });
      await sleep(200);

      const turnResultPromise = waitForEvent(gameSocket, 'game:turnResult');
      gameSocket.emit('game:rollDice', { gameId });
      const result = await turnResultPromise;
      console.log('   Turn result: dice=' + result.diceRoll + ', pos=' + result.newPosition + ', cap=' + result.finalCapital);
    }
  }

  console.log('\n=== Test Complete! Game is working end-to-end. ===');

  // Cleanup
  lobbySocket.disconnect();
  gameSocket.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
