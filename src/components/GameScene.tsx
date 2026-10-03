import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameMap } from './Map';
import { PlayerModel, DeadBodyMarker } from './Player';
import { GameState, Position } from '../types/game';

interface GameSceneProps {
  gameState: GameState;
  onPlayerMove: (position: Position) => void;
}

function CameraController({ target }: { target: Position }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.x, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, target.z + 10, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 12, 0.05);
    camera.lookAt(target.x, 0, target.z);
  });

  return null;
}

function PlayerController({
  gameState,
  onPlayerMove
}: {
  gameState: GameState;
  onPlayerMove: (position: Position) => void;
}) {
  const keysRef = useRef<Set<string>>(new Set());
  const localPlayer = gameState.players.find(p => p.isLocal);
  const speed = 0.08;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!localPlayer || !localPlayer.isAlive || gameState.phase !== 'playing') return;

    const keys = keysRef.current;
    let newX = localPlayer.position.x;
    let newZ = localPlayer.position.z;

    if (keys.has('w') || keys.has('arrowup')) newZ -= speed;
    if (keys.has('s') || keys.has('arrowdown')) newZ += speed;
    if (keys.has('a') || keys.has('arrowleft')) newX -= speed;
    if (keys.has('d') || keys.has('arrowright')) newX += speed;

    // Boundary constraints
    newX = Math.max(-12, Math.min(12, newX));
    newZ = Math.max(-11, Math.min(11, newZ));

    if (newX !== localPlayer.position.x || newZ !== localPlayer.position.z) {
      onPlayerMove({ x: newX, z: newZ });
    }
  });

  return null;
}

function BotMovement({ gameState, onBotMove }: { gameState: GameState; onBotMove: (id: string, pos: Position) => void }) {
  const timerRef = useRef(0);

  useFrame((_, delta) => {
    if (gameState.phase !== 'playing') return;

    timerRef.current += delta;
    if (timerRef.current < 0.5) return;
    timerRef.current = 0;

    gameState.players.forEach(player => {
      if (!player.isBot || !player.isAlive) return;

      const dx = (Math.random() - 0.5) * 2;
      const dz = (Math.random() - 0.5) * 2;
      const newX = Math.max(-11, Math.min(11, player.position.x + dx));
      const newZ = Math.max(-10, Math.min(10, player.position.z + dz));

      onBotMove(player.id, { x: newX, z: newZ });
    });
  });

  return null;
}

export function GameScene({ gameState, onPlayerMove, onBotMove }: GameSceneProps & { onBotMove: (id: string, pos: Position) => void }) {
  const localPlayer = gameState.players.find(p => p.isLocal);
  const cameraTarget = localPlayer ? { x: localPlayer.position.x, z: localPlayer.position.z } : { x: 0, z: 0 };

  return (
    <Canvas
      camera={{ position: [0, 12, 10], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} />

      {/* Sky color */}
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 20, 40]} />

      {/* Map */}
      <GameMap />

      {/* Players */}
      {gameState.players.map(player => (
        <PlayerModel
          key={player.id}
          player={player}
          showName={!player.isLocal}
          isDead={!player.isAlive}
        />
      ))}

      {/* Dead body markers */}
      {gameState.deadBodies.map((body, i) => (
        <DeadBodyMarker key={`body-${i}`} position={body.position} />
      ))}

      {/* Camera follow */}
      <CameraController target={cameraTarget} />

      {/* Player controls */}
      <PlayerController gameState={gameState} onPlayerMove={onPlayerMove} />
      <BotMovement gameState={gameState} onBotMove={onBotMove} />
    </Canvas>
  );
}
