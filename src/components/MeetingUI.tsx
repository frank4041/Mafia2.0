import { useState, useEffect, useRef } from 'react';
import { GameState, ChatMessage, VoteTarget } from '../types/game';

interface MeetingUIProps {
  gameState: GameState;
  onSendMessage: (text: string) => void;
  onVote: (target: VoteTarget) => void;
  onTimerEnd: () => void;
}

export function MeetingUI({ gameState, onSendMessage, onVote, onTimerEnd }: MeetingUIProps) {
  const [message, setMessage] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gameState.meetingTimer);
  const chatRef = useRef<HTMLDivElement>(null);
  const localPlayer = gameState.players.find(p => p.isLocal);
  const alivePlayers = gameState.players.filter(p => p.isAlive);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimerEnd]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [gameState.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleVote = (target: VoteTarget) => {
    if (!hasVoted) {
      onVote(target);
      setHasVoted(true);
    }
  };

  const localVote = gameState.votes.find(v => v.playerId === localPlayer?.id);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-yellow-600 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-yellow-900 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">🚨 EMERGENCY MEETING</h2>
            <p className="text-yellow-300 text-sm">A body has been discovered!</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-gray-300">Time Left</div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Players & Voting */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto p-3">
            <h3 className="text-white font-bold mb-3 text-center">Players</h3>
            <div className="space-y-2">
              {gameState.players.map(player => {
                const playerVote = gameState.votes.find(v => v.playerId === player.id);
                const voteTarget = playerVote ? gameState.players.find(p => p.id === playerVote.target) : null;

                return (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg border ${
                      !player.isAlive
                        ? 'bg-gray-800/50 border-gray-700 opacity-50'
                        : player.isLocal
                        ? 'bg-blue-900/50 border-blue-600'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className={`text-sm font-medium ${!player.isAlive ? 'line-through text-gray-500' : 'text-white'}`}>
                        {player.name}
                        {player.isLocal && ' (You)'}
                      </span>
                      {!player.isAlive && <span className="text-red-400 text-xs">☠️</span>}
                    </div>
                    {playerVote && (
                      <div className="text-xs text-yellow-400 mt-1">
                        Voted: {playerVote.target === 'skip' ? '⏭️ Skip' : voteTarget?.name || '?'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vote buttons */}
            <div className="mt-4">
              <h4 className="text-white font-bold mb-2 text-center text-sm">Cast Your Vote</h4>
              {hasVoted ? (
                <div className="text-center text-green-400 text-sm py-2">
                  ✓ Vote cast: {localVote?.target === 'skip' ? 'Skip' : gameState.players.find(p => p.id === localVote?.target)?.name}
                </div>
              ) : (
                <div className="space-y-1">
                  {alivePlayers.filter(p => p.id !== localPlayer?.id).map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleVote(player.id)}
                      className="w-full text-left px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-white text-sm rounded transition-colors border border-red-700/50"
                    >
                      Vote {player.name}
                    </button>
                  ))}
                  <button
                    onClick={() => handleVote('skip')}
                    className="w-full text-left px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors border border-gray-500/50"
                  >
                    ⏭️ Skip Vote
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Chat */}
          <div className="flex-1 flex flex-col">
            {/* Chat messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {gameState.messages.length === 0 && (
                <div className="text-gray-500 text-center text-sm mt-4">
                  Discussion started... speak up!
                </div>
              )}
              {gameState.messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.playerId === localPlayer?.id ? 'items-end' : 'items-start'}`}>
                  <div className="text-xs text-gray-400 mb-0.5">{msg.playerName}</div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.playerId === localPlayer?.id
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
