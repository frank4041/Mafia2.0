--- src/components/GameHUD.tsx (原始)


+++ src/components/GameHUD.tsx (修改后)
import { GameState } from '../types/game';
import { getRoomAtPosition } from '../game/gameLogic';

interface HUDProps {
  gameState: GameState;
  onReport: () => void;
  onKill: () => void;
  canKill: boolean;
  nearbyBody: boolean;
  nearbyVictim: boolean;
}

export function GameHUD({ gameState, onReport, onKill, canKill, nearbyBody, nearbyVictim }: HUDProps) {
  const localPlayer = gameState.players.find(p => p.isLocal);
  if (!localPlayer) return null;

  const currentRoom = getRoomAtPosition(localPlayer.position);
  const aliveCount = gameState.players.filter(p => p.isAlive).length;
  const completedTasks = localPlayer.tasks.filter(t => t.completed).length;
  const totalTasks = localPlayer.tasks.length;

  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none">
      {/* Top bar */}
      <div className="flex justify-between items-start p-4">
        {/* Room indicator */}
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-xs text-gray-400">Location</div>
          <div className="font-bold text-yellow-400">{currentRoom.name}</div>
        </div>

        {/* Game info */}
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-center">
          <div className="text-xs text-gray-400">Alive</div>
          <div className="font-bold text-green-400">{aliveCount} players</div>
        </div>

        {/* Tasks */}
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-xs text-gray-400">Tasks</div>
          <div className="font-bold text-blue-400">{completedTasks}/{totalTasks}</div>
        </div>
      </div>

      {/* Kill cooldown */}
      {localPlayer.role === 'thief' && (
        <div className="absolute top-20 right-4">
          <div className="bg-red-900/80 text-white px-3 py-1 rounded text-sm">
            {canKill ? '⚔️ Kill Ready' : `⏱️ Cooldown: ${Math.ceil(gameState.killCooldown)}s`}
          </div>
        </div>
      )}

      {/* Role indicator (only for local player) */}
      <div className="absolute bottom-4 left-4">
        <div className={`px-4 py-2 rounded-lg backdrop-blur-sm ${
          localPlayer.role === 'thief' ? 'bg-red-900/80' : 'bg-blue-900/80'
        }`}>
          <div className="text-xs text-gray-300">Your Role</div>
          <div className={`font-bold ${localPlayer.role === 'thief' ? 'text-red-400' : 'text-blue-400'}`}>
            {localPlayer.role === 'thief' ? '🗡️ THIEF' : '👮 CIVILIAN'}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        {nearbyBody && (
          <button
            onClick={onReport}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
          >
            📢 Report Body
          </button>
        )}
        {localPlayer.role === 'thief' && canKill && nearbyVictim && (
          <button
            onClick={onKill}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 animate-pulse"
          >
            ⚔️ Kill
          </button>
        )}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-black/50 text-white/70 px-3 py-1 rounded text-xs">
          WASD / Arrow Keys to move
        </div>
      </div>
    </div>
  );
}
