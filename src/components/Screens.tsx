import { GameState } from '../types/game';

interface LobbyScreenProps {
  gameState: GameState;
  onStartGame: () => void;
}

export function LobbyScreen({ gameState, onStartGame }: LobbyScreenProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-green-900 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center max-w-lg mx-auto p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            🇳🇬 POLICE & THIEF
          </h1>
          <p className="text-green-300 text-lg">A Nigerian Social Deduction Game</p>
          <div className="mt-2 text-gray-400 text-sm">Inspired by Among Us & Mafia</div>
        </div>

        {/* Players list */}
        <div className="bg-black/50 rounded-xl p-6 mb-6 border border-green-700">
          <h3 className="text-white font-bold mb-3">Players ({gameState.players.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.map(player => (
              <div key={player.id} className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: player.color }} />
                <span className="text-white text-sm">
                  {player.name}
                  {player.isLocal && <span className="text-yellow-400 ml-1">(You)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Game info */}
        <div className="bg-black/30 rounded-lg p-4 mb-6 text-left border border-gray-700">
          <h4 className="text-yellow-400 font-bold mb-2">How to Play:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <span className="text-blue-400">Civilians</span> — Complete tasks & find the thieves</li>
            <li>• <span className="text-red-400">Thieves</span> — Eliminate civilians without getting caught</li>
            <li>• Use <span className="text-white">WASD</span> to move around the compound</li>
            <li>• Report bodies to call an emergency meeting</li>
            <li>• Vote to eliminate suspected thieves</li>
          </ul>
        </div>

        {/* Start button */}
        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-xl font-bold px-10 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          🎮 START GAME
        </button>

        <p className="text-gray-500 text-xs mt-4">Demo version • Single player with bots</p>
      </div>
    </div>
  );
}

interface GameOverScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

export function GameOverScreen({ gameState, onPlayAgain }: GameOverScreenProps) {
  const localPlayer = gameState.players.find(p => p.isLocal);
  const isWin = localPlayer?.role === gameState.winner;

  return (
    <div className={`absolute inset-0 flex items-center justify-center z-50 ${
      gameState.winner === 'civilian'
        ? 'bg-gradient-to-b from-blue-900/95 to-gray-900/95'
        : 'bg-gradient-to-b from-red-900/95 to-gray-900/95'
    }`}>
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="text-6xl mb-4">
          {gameState.winner === 'civilian' ? '👮' : '🗡️'}
        </div>

        <h1 className={`text-4xl font-bold mb-2 ${
          gameState.winner === 'civilian' ? 'text-blue-400' : 'text-red-400'
        }`}>
          {gameState.winner === 'civilian' ? 'CIVILIANS WIN!' : 'THIEVES WIN!'}
        </h1>

        <p className={`text-xl mb-6 ${isWin ? 'text-green-400' : 'text-gray-400'}`}>
          {isWin ? '🎉 You won!' : '💀 You lost!'}
        </p>

        {/* Role reveal */}
        <div className="bg-black/50 rounded-xl p-6 mb-6 border border-gray-600">
          <h3 className="text-white font-bold mb-3">Role Reveal</h3>
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.map(player => (
              <div key={player.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                !player.isAlive ? 'bg-gray-800/30 opacity-60' : 'bg-gray-800/50'
              }`}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                <span className="text-white text-sm flex-1 text-left">
                  {player.name}
                  {!player.isAlive && ' ☠️'}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  player.role === 'thief' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                }`}>
                  {player.role === 'thief' ? 'Thief' : 'Civilian'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white text-lg font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
