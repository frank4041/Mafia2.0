export type Role = 'civilian' | 'thief';
export type GamePhase = 'lobby' | 'playing' | 'meeting' | 'gameover';
export type VoteTarget = string | 'skip';

export interface Position {
  x: number;
  z: number;
}

export interface Task {
  id: string;
  name: string;
  location: string;
  completed: boolean;
  progress: number;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  position: Position;
  isLocal: boolean;
  outfit: number; // outfit variant index
  color: string;
  tasks: Task[];
  isBot: boolean;
}

export interface DeadBody {
  playerId: string;
  position: Position;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface Vote {
  playerId: string;
  target: VoteTarget;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  deadBodies: DeadBody[];
  messages: ChatMessage[];
  votes: Vote[];
  meetingTimer: number;
  killCooldown: number;
  winner: Role | null;
  roundNumber: number;
}

export interface Room {
  id: string;
  name: string;
  position: Position;
  width: number;
  depth: number;
  color: string;
}
