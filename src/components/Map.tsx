import { ROOMS } from '../game/gameLogic';
import { Room } from '../types/game';

function RoomFloor({ room }: { room: Room }) {
  return (
    <mesh position={[room.position.x, 0.01, room.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[room.width, room.depth]} />
      <meshStandardMaterial color={room.color} />
    </mesh>
  );
}

function Wall({ position, size, color = '#F5F5DC' }: { position: [number, number, number]; size: [number, number, number]; color?: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function RoomWalls({ room }: { room: Room }) {
  if (room.id === 'yard' || room.id === 'gate') return null;

  const wallHeight = 2.5;
  const wallThickness = 0.2;
  const halfW = room.width / 2;
  const halfD = room.depth / 2;
  const x = room.position.x;
  const z = room.position.z;
  const wallColor = room.id === 'bathroom' ? '#E0F7FA' : '#FFF8DC';

  return (
    <group>
      {/* Back wall */}
      <Wall position={[x, wallHeight / 2, z - halfD]} size={[room.width, wallHeight, wallThickness]} color={wallColor} />
      {/* Front wall with gap (door) */}
      <Wall position={[x - halfW / 2 - 0.5, wallHeight / 2, z + halfD]} size={[halfW - 1, wallHeight, wallThickness]} color={wallColor} />
      <Wall position={[x + halfW / 2 + 0.5, wallHeight / 2, z + halfD]} size={[halfW - 1, wallHeight, wallThickness]} color={wallColor} />
      {/* Left wall */}
      <Wall position={[x - halfW, wallHeight / 2, z]} size={[wallThickness, wallHeight, room.depth]} color={wallColor} />
      {/* Right wall */}
      <Wall position={[x + halfW, wallHeight / 2, z]} size={[wallThickness, wallHeight, room.depth]} color={wallColor} />
    </group>
  );
}

function Generator() {
  return (
    <group position={[0, 0, 8]}>
      {/* Generator box */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Exhaust pipe */}
      <mesh position={[0.5, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Fuel tank */}
      <mesh position={[-1, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
    </group>
  );
}

function KitchenItems() {
  return (
    <group position={[-6, 0, 4]}>
      {/* Stove */}
      <mesh position={[-1.5, 0.4, -1]}>
        <boxGeometry args={[1, 0.8, 0.8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Table */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Table legs */}
      {[[-0.6, 0, -0.4], [0.6, 0, -0.4], [-0.6, 0, 0.4], [0.6, 0, 0.4]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.17, pos[2]]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
}

function LivingRoomFurniture() {
  return (
    <group position={[-6, 0, -6]}>
      {/* Sofa */}
      <mesh position={[-1.5, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 0.8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* TV stand */}
      <mesh position={[1.5, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      {/* TV */}
      <mesh position={[1.5, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

function BedroomFurniture() {
  return (
    <group position={[5, 0, -6]}>
      {/* Bed */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 2]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.55, -0.7]}>
        <boxGeometry args={[0.8, 0.15, 0.4]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Wardrobe */}
      <mesh position={[1.8, 0.75, 0]}>
        <boxGeometry args={[0.6, 1.5, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

function BathroomFixtures() {
  return (
    <group position={[5, 0, 4]}>
      {/* Toilet */}
      <mesh position={[-0.8, 0.25, -0.8]}>
        <boxGeometry args={[0.4, 0.5, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Sink */}
      <mesh position={[0.8, 0.5, -0.8]}>
        <boxGeometry args={[0.5, 0.1, 0.4]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      {/* Bucket */}
      <mesh position={[0, 0.2, 0.5]}>
        <cylinderGeometry args={[0.2, 0.15, 0.4]} />
        <meshStandardMaterial color="#1E90FF" />
      </mesh>
    </group>
  );
}

function GateStructure() {
  return (
    <group position={[0, 0, -9]}>
      {/* Gate posts */}
      <mesh position={[-1.5, 1, 0]}>
        <boxGeometry args={[0.3, 2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[1.5, 1, 0]}>
        <boxGeometry args={[0.3, 2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Gate bars */}
      {[-0.8, -0.3, 0.3, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

function Trees() {
  const treePositions: [number, number, number][] = [
    [-8, 0, -8], [8, 0, -8], [-8, 0, 8], [8, 0, 8],
    [-9, 0, 0], [9, 0, 0],
  ];

  return (
    <group>
      {treePositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 2]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterTank() {
  return (
    <group position={[-4, 0, 8]}>
      {/* Tank stand */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

export function GameMap() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#C4A882" />
      </mesh>

      {/* Compound boundary walls */}
      <Wall position={[0, 0.75, -12]} size={[26, 1.5, 0.3]} color="#A0522D" />
      <Wall position={[0, 0.75, 12]} size={[26, 1.5, 0.3]} color="#A0522D" />
      <Wall position={[-13, 0.75, 0]} size={[0.3, 1.5, 24]} color="#A0522D" />
      <Wall position={[13, 0.75, 0]} size={[0.3, 1.5, 24]} color="#A0522D" />

      {/* Room floors */}
      {ROOMS.map(room => (
        <RoomFloor key={room.id} room={room} />
      ))}

      {/* Room walls */}
      {ROOMS.map(room => (
        <RoomWalls key={`walls-${room.id}`} room={room} />
      ))}

      {/* Furniture and objects */}
      <Generator />
      <KitchenItems />
      <LivingRoomFurniture />
      <BedroomFurniture />
      <BathroomFixtures />
      <GateStructure />
      <Trees />
      <WaterTank />

      {/* Room labels (floating text would need Text from drei - using simple markers) */}
      {ROOMS.filter(r => r.id !== 'yard').map(room => (
        <mesh key={`marker-${room.id}`} position={[room.position.x, 2.8, room.position.z]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
