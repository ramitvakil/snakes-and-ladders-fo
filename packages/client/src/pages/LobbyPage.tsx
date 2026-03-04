import { useState } from 'react';
import { useLobby } from '../hooks/useLobby';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const { createRoom, joinRoom, leaveRoom, addBot, startGame, rooms, currentRoom } = useLobby();
  const user = useAuthStore((s) => s.user);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast.error('Room name required');
      return;
    }
    createRoom(roomName.trim(), maxPlayers, 'Multiplayer');
    setRoomName('');
  };

  const handleStartSingle = () => {
    createRoom(`${user?.displayName ?? 'Player'}'s Game`, 2, 'SinglePlayer');
    // The lobby handler will create the room; we'll add bot after joining
    toast.success('Creating single-player game…');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Game Lobby</h1>
        <button
          onClick={handleStartSingle}
          className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-500"
        >
          Quick Single-Player
        </button>
      </div>

      {/* Current Room */}
      {currentRoom && (
        <div className="glass-card rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-400">{currentRoom.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => addBot(currentRoom.id, 'adaptive')}
                className="rounded-lg border border-gray-600 px-3 py-1 text-sm text-gray-300 transition hover:bg-gray-800"
              >
                + Add Bot
              </button>
              <button
                onClick={() => startGame(currentRoom.id)}
                disabled={currentRoom.players.length < 2}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                Start Game
              </button>
              <button
                onClick={() => leaveRoom(currentRoom.id)}
                className="rounded-lg border border-red-800 px-3 py-1 text-sm text-red-400 transition hover:bg-red-900/30"
              >
                Leave
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
            </p>
            {currentRoom.players.map((p) => (
              <div key={p.userId} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <span className={`h-2 w-2 rounded-full ${p.userId === currentRoom.hostId ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                <span>{p.displayName}</span>
                {p.userId === currentRoom.hostId && <span className="text-xs text-yellow-400">(Host)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Room */}
      {!currentRoom && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-bold">Create Room</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
            <button
              onClick={handleCreateRoom}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-500"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Room List */}
      <div>
        <h2 className="mb-4 text-lg font-bold">Open Rooms</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-500">No rooms available. Create one to get started!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="glass-card flex flex-col justify-between rounded-xl p-4">
                <div>
                  <h3 className="font-semibold text-white">{room.name}</h3>
                  <p className="text-sm text-gray-400">
                    {room.playerCount}/{room.maxPlayers} players
                  </p>
                </div>
                <button
                  onClick={() => joinRoom(room.id)}
                  disabled={room.playerCount >= room.maxPlayers}
                  className="mt-3 w-full rounded-lg border border-emerald-600 py-1 text-sm text-emerald-400 transition hover:bg-emerald-600/20 disabled:opacity-40"
                >
                  {room.playerCount >= room.maxPlayers ? 'Full' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
