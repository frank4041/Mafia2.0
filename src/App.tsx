import { useState, useCallback, useEffect, useRef } from 'react';
import { GameScene } from './components/GameScene';
import { GameHUD } from './components/GameHUD';
import { MeetingUI } from './components/MeetingUI';
import { LobbyScreen, GameOverScreen } from './components/Screens';
import {
  GameState,
  Position,
  ChatMessage,
  VoteTarget,
} from './types/game';
import {
  createInitialState,
  startGame,
  movePlayer,
  killPlayer,
  reportBody,
  addMessage,
  castVote,
  resolveVotes,
  checkWinCondition,
  getNearbyBody,
  getNearbyPlayer,
  generateBotMessage,
  generateBotVote,
} from './game/gameLogic';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(7));
  const botMessageTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const meetingBotTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start game
  const handleStartGame = useCallback(() => {
    setGameState(prev => startGame(prev));
  }, []);

  // Play again
  const handlePlayAgain = useCallback(() => {
    setGameState(createInitialState(7));
  }, []);

  // Player movement
  const handlePlayerMove = useCallback((position: Position) => {
    setGameState(prev => {
      const localPlayer = prev.players.find(p => p.isLocal);
      if (!localPlayer) return prev;
      return movePlayer(prev, localPlayer.id, position);
    });
  }, []);

  // Bot movement
  const handleBotMove = useCallback((id: string, position: Position) => {
    setGameState(prev => movePlayer(prev, id, position));
  }, []);

  // Kill action
  const handleKill = useCallback(() => {
    setGameState(prev => {
      const localPlayer = prev.players.find(p => p.isLocal);
      if (!localPlayer || localPlayer.role !== 'thief' || prev.killCooldown > 0) return prev;

      const victim = getNearbyPlayer(prev, localPlayer.id, 2.5);
      if (!victim) return prev;

      const newState = killPlayer(prev, localPlayer.id, victim.id);
      return checkWinCondition(newState);
    });
  }, []);

  // Report body
  const handleReport = useCallback(() => {
    setGameState(prev => {
      const localPlayer = prev.players.find(p => p.isLocal);
      if (!localPlayer) return prev;

      const body = getNearbyBody(prev, localPlayer.id);
      if (!body) return prev;

      const bodyIndex = prev.deadBodies.indexOf(body);
      return reportBody(prev, bodyIndex);
    });
  }, []);

  // Bot AI - thief kills during gameplay
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.phase !== 'playing') return prev;

        // Decrease kill cooldown
        if (prev.killCooldown > 0) {
          return { ...prev, killCooldown: prev.killCooldown - 1 };
        }

        // Bot thief AI - try to kill
        const botThieves = prev.players.filter(p => p.isBot && p.role === 'thief' && p.isAlive);
        for (const thief of botThieves) {
          const victim = getNearbyPlayer(prev, thief.id, 2);
          if (victim && victim.role === 'civilian' && Math.random() < 0.3) {
            const newState = killPlayer(prev, thief.id, victim.id);
            return checkWinCondition(newState);
          }
        }

        // Bot civilians might find bodies and report
        const botCivilians = prev.players.filter(p => p.isBot && p.isAlive);
        for (const civilian of botCivilians) {
          const body = getNearbyBody(prev, civilian.id);
          if (body && Math.random() < 0.4) {
            const bodyIndex = prev.deadBodies.indexOf(body);
            return reportBody(prev, bodyIndex);
          }
        }

        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [gameState.phase]);

  // Bot chat during meetings
  useEffect(() => {
    if (gameState.phase !== 'meeting') {
      if (meetingBotTimer.current) {
        clearInterval(meetingBotTimer.current);
        meetingBotTimer.current = null;
      }
      return;
    }

    // Initial messages after a short delay
    const initialDelay = setTimeout(() => {
      setGameState(prev => {
        if (prev.phase !== 'meeting') return prev;
        const botPlayers = prev.players.filter(p => p.isBot && p.isAlive);
        let state = prev;

        // 2-3 bots speak initially
        const speakingBots = botPlayers.slice(0, Math.min(3, botPlayers.length));
        speakingBots.forEach(bot => {
          const msg = generateBotMessage(bot, state);
          state = addMessage(state, msg);
        });

        return state;
      });
    }, 1500);

    // Periodic bot messages
    meetingBotTimer.current = setInterval(() => {
      setGameState(prev => {
        if (prev.phase !== 'meeting') return prev;
        const botPlayers = prev.players.filter(p => p.isBot && p.isAlive);
        if (botPlayers.length === 0) return prev;

        if (Math.random() < 0.5) {
          const bot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
          const msg = generateBotMessage(bot, prev);
          return addMessage(prev, msg);
        }
        return prev;
      });
    }, 3000);

    // Bot votes after some time
    const voteDelay = setTimeout(() => {
      setGameState(prev => {
        if (prev.phase !== 'meeting') return prev;
        let state = prev;

        const botPlayers = state.players.filter(p => p.isBot && p.isAlive);
        const botsThatHaventVoted = botPlayers.filter(
          bot => !state.votes.some(v => v.playerId === bot.id)
        );

        botsThatHaventVoted.forEach(bot => {
          if (Math.random() < 0.7) {
            const vote = generateBotVote(bot, state);
            state = castVote(state, vote);
          }
        });

        return state;
      });
    }, 15000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(voteDelay);
      if (meetingBotTimer.current) {
        clearInterval(meetingBotTimer.current);
      }
    };
  }, [gameState.phase]);

  // Send message during meeting
  const handleSendMessage = useCallback((text: string) => {
    setGameState(prev => {
      const localPlayer = prev.players.find(p => p.isLocal);
      if (!localPlayer) return prev;

      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        playerId: localPlayer.id,
        playerName: localPlayer.name,
        text,
        timestamp: Date.now(),
      };
      return addMessage(prev, msg);
    });
  }, []);

  // Cast vote
  const handleVote = useCallback((target: VoteTarget) => {
    setGameState(prev => {
      const localPlayer = prev.players.find(p => p.isLocal);
      if (!localPlayer) return prev;
      return castVote(prev, { playerId: localPlayer.id, target });
    });
  }, []);

  // Meeting timer end - resolve votes
  const handleTimerEnd = useCallback(() => {
    setGameState(prev => {
      // Make remaining bots vote if they haven't
      let state = prev;
      const botPlayers = state.players.filter(p => p.isBot && p.isAlive);
      const botsThatHaventVoted = botPlayers.filter(
        bot => !state.votes.some(v => v.playerId === bot.id)
      );
      botsThatHaventVoted.forEach(bot => {
        const vote = generateBotVote(bot, state);
        state = castVote(state, vote);
      });

      state = resolveVotes(state);
      state = checkWinCondition(state);
      return state;
    });
  }, []);

  // Derived state
  const localPlayer = gameState.players.find(p => p.isLocal);
  const nearbyBody = localPlayer ? !!getNearbyBody(gameState, localPlayer.id) : false;
  const nearbyVictim = localPlayer?.role === 'thief'
    ? !!getNearbyPlayer(gameState, localPlayer.id, 2.5)
    : false;
  const canKill = gameState.killCooldown <= 0 && localPlayer?.role === 'thief';

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* 3D Game Scene - always rendered */}
      <GameScene
        gameState={gameState}
        onPlayerMove={handlePlayerMove}
        onBotMove={handleBotMove}
      />

      {/* UI Overlays */}
      {gameState.phase === 'lobby' && (
        <LobbyScreen gameState={gameState} onStartGame={handleStartGame} />
      )}

      {gameState.phase === 'playing' && (
        <GameHUD
          gameState={gameState}
          onReport={handleReport}
          onKill={handleKill}
          canKill={canKill}
          nearbyBody={nearbyBody}
          nearbyVictim={nearbyVictim}
        />
      )}

      {gameState.phase === 'meeting' && (
        <MeetingUI
          gameState={gameState}
          onSendMessage={handleSendMessage}
          onVote={handleVote}
          onTimerEnd={handleTimerEnd}
        />
      )}

      {gameState.phase === 'gameover' && (
        <GameOverScreen gameState={gameState} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}

export default App;
