import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Player as PlayerType } from '../types/game';
import * as THREE from 'three';

interface PlayerProps {
  player: PlayerType;
  showName?: boolean;
  isDead?: boolean;
}

export function PlayerModel({ player, showName = false, isDead = false }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = player.position.x;
      groupRef.current.position.z = player.position.z;
    }
  });

  if (isDead || !player.isAlive) {
    return (
      <group ref={groupRef} position={[player.position.x, 0, player.position.z]}>
        {/* Dead body - lying down */}
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.25, 0.6, 4, 8]} />
          <meshStandardMaterial color={player.color} />
        </mesh>
        {/* Blood pool */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#8B0000" transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[player.position.x, 0, player.position.z]}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      
      {/* Hair/hat - varies by outfit */}
      {player.outfit % 3 === 0 && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      )}
      {player.outfit % 3 === 1 && (
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      )}
      
      {/* Legs */}
      <mesh position={[-0.1, 0.25, 0]}>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      <mesh position={[0.1, 0.25, 0]}>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.35, 0.7, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
      <mesh position={[0.35, 0.7, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
        <meshStandardMaterial color={player.color} />
      </mesh>

      {/* Local player indicator */}
      {player.isLocal && (
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Name tag */}
      {showName && (
        <group position={[0, 1.9, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.25]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function DeadBodyMarker({ position }: { position: { x: number; z: number } }) {
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Exclamation marker */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}
