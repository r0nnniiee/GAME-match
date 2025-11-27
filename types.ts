

export interface User {
  id: string;
  uniqueCode: string; // The friend code
  username: string;
  email: string;
  avatar: string;
  bio: string;
  rank: string; // Iron to Radiant
  level: number; // 1 - 1000
  yearsExperience: number;
  games: string[]; // List of game names
  gallery: string[]; // URLs
  friends: string[]; // User IDs
  incomingRequests: string[]; // IDs of users who sent a request
  outgoingRequests: string[]; // IDs of users request was sent to
  squadProfile?: SquadProfile; // New field for squad finder
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  type: 'text' | 'contract';
  contractDetails?: {
    title: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export interface ChatSession {
  userId: string; // The other user
  lastMessage: string;
  unread: number;
  timestamp: number;
}

export interface VoiceChannel {
  id: string;
  name: string;
  creator: string; // Username of creator
  game: string; // Associated game
  connectedUserIds: string[];
  maxUsers: number; // Strictly 6
  isPublic: boolean;
}

export interface Availability {
  day: string; // 'Mon', 'Tue', etc.
  times: string[]; // '18-20', etc.
}

export interface SquadProfile {
  roles: string[]; // 'Tank', 'DPS', 'Support', 'Flex', etc.
  communication: 'Casual' | 'Strategic' | 'Competitive';
  availability: Availability[];
  languages: string[];
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  description: string;
  format: 'Single Elimination' | 'Double Elimination' | 'Round Robin';
  entryFee: number;
  prizePool: number;
  status: 'Registration' | 'Active' | 'Completed';
  startDate: string;
  maxParticipants: number;
  participants: string[]; // User IDs
  rules: string[];
  hostId: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number; // 1, 2, 3...
  matchNumber: number; // 1 to N within the round
  player1Id: string | null; // null if TBD
  player2Id: string | null;
  score1: number;
  score2: number;
  winnerId: string | null;
  status: 'Scheduled' | 'Live' | 'Completed';
  nextMatchId?: string | null; // ID of the match the winner goes to
  streamUrl?: string;
}

export type ViewState = 'auth' | 'home' | 'messages' | 'profile' | 'voice' | 'squad' | 'tournaments';

export const RANKS = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'
];

export const GLOBAL_GAMES = [
  'League of Legends', 'Valorant', 'Counter-Strike 2', 'Dota 2', 'Overwatch 2', 
  'Apex Legends', 'Fortnite', 'Call of Duty', 'Minecraft', 'Rocket League', 
  'Rainbow Six Siege', 'Genshin Impact', 'Elden Ring', 'FIFA 24', 'NBA 2K24'
];