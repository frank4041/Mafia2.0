import { GameState, Player, Role, Task, DeadBody, ChatMessage, Vote, Position, Room } from '../types/game';

// Nigerian names for bots
const NIGERIAN_NAMES = [
  'Chidi', 'Amaka', 'Emeka', 'Ngozi', 'Obinna',
  'Kemi', 'Tunde', 'Folake', 'Segun', 'Bisi',
  'Yemi', 'Ade', 'Nneka', 'Ifeanyi', 'Chiamaka'
];

// Outfit colors for characters
const OUTFIT_COLORS = [
  '#E67E22', '#27AE60', '#8E44AD', '#2980B9',
  '#C0392B', '#F39C12', '#16A085', '#D35400'
];

// Map rooms
export const ROOMS: Room[] = [
  { id: 'yard', name: 'Yard', position: { x: 0, z: 0 }, width: 20, depth: 20, color: '#8B7355' },
  { id: 'living_room', name: 'Living Room', position: { x: -6, z: -6 }, width: 6, depth: 5, color: '#DEB887' },
  { id: 'bedroom', name: 'Bedroom', position: { x: 5, z: -6 }, width: 5, depth: 5, color: '#D2B48C' },
  { id: 'kitchen', name: 'Kitchen', position: { x: -6, z: 4 }, width: 5, depth: 5, color: '#F5DEB3' },
  { id: 'bathroom', name: 'Bathroom', position: { x: 5, z: 4 }, width: 4, depth: 4, color: '#87CEEB' },
  { id: 'generator', name: 'Generator Area', position: { x: 0, z: 8 }, width: 4, depth: 3, color: '#696969' },
  { id: 'gate', name: 'Gate', position: { x: 0, z: -9 }, width: 5, depth: 3, color: '#A0522D' },
];

// Tasks per room
const TASK_TEMPLATES: { name: string; roomId: string }[] = [
  { name: 'Fix Generator', roomId: 'generator' },
  { name: 'Clean Kitchen', roomId: 'kitchen' },
  { name: 'Arrange Living Room', roomId: 'living_room' },
  { name: 'Fix Bedroom Fan', roomId: 'bedroom' },
  { name: 'Clean Bathroom', roomId: 'bathroom' },
  { name: 'Open Gate', roomId: 'gate' },
  { name: 'Sweep Yard', roomId: 'yard' },
  { name: 'Check Water Tank', roomId: 'kitchen' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function assignRoles(playerCount: number): Role[] {
  const thiefCount = playerCount <= 6 ? 1 : 2;
  const roles: Role[] = [];
  for (let i = 0; i < thiefCount; i++) roles.push('thief');
  for (let i = 0; i < playerCount - thiefCount; i++) roles.push('civilian');
  return shuffleArray(roles);
}

function generateTasks(playerId: string): Task[] {
  const availableTasks = shuffleArray(TASK_TEMPLATES).slice(0, 3);
  return availableTasks.map((t, i) => ({
    id: `${playerId}-task-${i}`,
    name: t.name,
    location: t.roomId,
    completed: false,
    progress: 0,
  }));
}

export function createInitialState(playerCount: number = 7): GameState {
  const names = shuffleArray(NIGERIAN_NAMES).slice(0, playerCount);
  const roles = assignRoles(playerCount);

  const players: Player[] = names.map((name, i) => ({
    id: `player-${i}`,
    name,
    role: roles[i],
    isAlive: true,
    position: { x: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 10 },
    isLocal: i === 0,
    outfit: i % OUTFIT_COLORS.length,
    color: OUTFIT_COLORS[i % OUTFIT_COLORS.length],
    tasks: generateTasks(`player-${i}`),
    isBot: i !== 0,
  }));

  return {
    phase: 'lobby',
    players,
    deadBodies: [],
    messages: [],
    votes: [],
    meetingTimer: 30,
    killCooldown: 0,
    winner: null,
    roundNumber: 1,
  };
}

export function startGame(state: GameState): GameState {
  return { ...state, phase: 'playing', killCooldown: 15 };
}

export function movePlayer(state: GameState, playerId: string, position: Position): GameState {
  const players = state.players.map(p =>
    p.id === playerId ? { ...p, position } : p
  );
  return { ...state, players };
}

export function killPlayer(state: GameState, killerId: string, victimId: string): GameState {
  const victim = state.players.find(p => p.id === victimId);
  if (!victim || !victim.isAlive) return state;

  const players = state.players.map(p =>
    p.id === victimId ? { ...p, isAlive: false } : p
  );

  const deadBodies = [...state.deadBodies, {
    playerId: victimId,
    position: { ...victim.position },
  }];

  return { ...state, players, deadBodies, killCooldown: 20 };
}

export function reportBody(state: GameState, bodyIndex: number): GameState {
  const deadBodies = state.deadBodies.filter((_, i) => i !== bodyIndex);
  return {
    ...state,
    phase: 'meeting',
    deadBodies,
    messages: [],
    votes: [],
    meetingTimer: 30,
  };
}

export function addMessage(state: GameState, message: ChatMessage): GameState {
  return { ...state, messages: [...state.messages, message] };
}

export function castVote(state: GameState, vote: Vote): GameState {
  const existingVotes = state.votes.filter(v => v.playerId !== vote.playerId);
  return { ...state, votes: [...existingVotes, vote] };
}

export function resolveVotes(state: GameState): GameState {
  const voteCounts: Record<string, number> = {};
  state.votes.forEach(v => {
    voteCounts[v.target] = (voteCounts[v.target] || 0) + 1;
  });

  let maxVotes = 0;
  let eliminated: string | null = null;
  let isTie = false;

  Object.entries(voteCounts).forEach(([target, count]) => {
    if (target === 'skip') return;
    if (count > maxVotes) {
      maxVotes = count;
      eliminated = target;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  });

  const skipVotes = voteCounts['skip'] || 0;
  if (skipVotes >= maxVotes) {
    eliminated = null;
  }

  if (isTie) eliminated = null;

  let players = state.players;
  if (eliminated) {
    players = players.map(p =>
      p.id === eliminated ? { ...p, isAlive: false } : p
    );
  }

  return { ...state, players, phase: 'playing', votes: [] };
}

export function checkWinCondition(state: GameState): GameState {
  const alivePlayers = state.players.filter(p => p.isAlive);
  const aliveThieves = alivePlayers.filter(p => p.role === 'thief');
  const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian');

  if (aliveThieves.length === 0) {
    return { ...state, phase: 'gameover', winner: 'civilian' };
  }
  if (aliveThieves.length >= aliveCivilians.length) {
    return { ...state, phase: 'gameover', winner: 'thief' };
  }
  return state;
}

export function getNearbyBody(state: GameState, playerId: string): DeadBody | null {
  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.isAlive) return null;

  return state.deadBodies.find(body => {
    const dx = body.position.x - player.position.x;
    const dz = body.position.z - player.position.z;
    return Math.sqrt(dx * dx + dz * dz) < 2;
  }) || null;
}

export function getNearbyPlayer(state: GameState, playerId: string, range: number = 2): Player | null {
  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.isAlive) return null;

  return state.players.find(p => {
    if (p.id === playerId || !p.isAlive) return false;
    const dx = p.position.x - player.position.x;
    const dz = p.position.z - player.position.z;
    return Math.sqrt(dx * dx + dz * dz) < range;
  }) || null;
}

export function getRoomAtPosition(pos: Position): Room {
  for (const room of ROOMS) {
    const halfW = room.width / 2;
    const halfD = room.depth / 2;
    if (
      pos.x >= room.position.x - halfW &&
      pos.x <= room.position.x + halfW &&
      pos.z >= room.position.z - halfD &&
      pos.z <= room.position.z + halfD
    ) {
      return room;
    }
  }
  return ROOMS[0]; // yard
}

// Bot AI
const BOT_MESSAGES_ACCUSE = [
  "I saw {target} near where the body was found!",
  "{target} was acting suspicious, I swear!",
  "Why was {target} running away from the kitchen?",
  "I think {target} is the thief, no cap!",
  "{target} was alone near the generator. Fishy.",
  "Chai! {target} has been too quiet. That's suspicious.",
];

const BOT_MESSAGES_DEFEND = [
  "I was doing my tasks, I swear on my life!",
  "I was in the {room} the whole time!",
  "I can confirm {ally} was with me.",
  "Na lie! I was busy with my work.",
  "Abeg, I no be thief. Check my tasks.",
];

const BOT_MESSAGES_GENERAL = [
  "Where everybody dey?",
  "Make we focus, the thief is among us!",
  "I just completed my task for the generator.",
  "Who saw anything?",
  "This compound too big o!",
  "Make we vote carefully.",
];

export function generateBotMessage(player: Player, state: GameState): ChatMessage {
  const alivePlayers = state.players.filter(p => p.isAlive && p.id !== player.id);
  const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  const randomRoom = ROOMS[Math.floor(Math.random() * ROOMS.length)];

  let text: string;
  const rand = Math.random();

  if (rand < 0.4 && randomTarget) {
    text = BOT_MESSAGES_ACCUSE[Math.floor(Math.random() * BOT_MESSAGES_ACCUSE.length)]
      .replace('{target}', randomTarget.name);
  } else if (rand < 0.7) {
    text = BOT_MESSAGES_DEFEND[Math.floor(Math.random() * BOT_MESSAGES_DEFEND.length)]
      .replace('{room}', randomRoom.name);
  } else {
    text = BOT_MESSAGES_GENERAL[Math.floor(Math.random() * BOT_MESSAGES_GENERAL.length)];
  }

  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    playerId: player.id,
    playerName: player.name,
    text,
    timestamp: Date.now(),
  };
}

export function generateBotVote(player: Player, state: GameState): Vote {
  const alivePlayers = state.players.filter(p => p.isAlive && p.id !== player.id);

  if (Math.random() < 0.2) {
    return { playerId: player.id, target: 'skip' };
  }

  // If thief, try to vote for civilians
  if (player.role === 'thief') {
    const civilians = alivePlayers.filter(p => p.role === 'civilian');
    const target = civilians[Math.floor(Math.random() * civilians.length)] || alivePlayers[0];
    return { playerId: player.id, target: target?.id || 'skip' };
  }

  // Civilians vote randomly (they don't know who the thief is)
  const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  return { playerId: player.id, target: target?.id || 'skip' };
}
