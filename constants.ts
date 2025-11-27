
import { User, VoiceChannel, Tournament, TournamentMatch } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    uniqueCode: 'K9X2L1',
    username: 'JettMain99',
    email: 'jett@val.com',
    avatar: 'https://picsum.photos/200/200?random=1',
    bio: 'Entry fragger looking for a calm Sage. No toxicity.',
    rank: 'Ascendant',
    level: 245,
    yearsExperience: 4,
    games: ['Valorant', 'Apex Legends'],
    gallery: ['https://picsum.photos/400/600?random=10', 'https://picsum.photos/400/600?random=11'],
    friends: ['user_current'],
    incomingRequests: [],
    outgoingRequests: [],
    squadProfile: {
        roles: ['Duelist', 'DPS'],
        communication: 'Competitive',
        availability: [
            { day: 'Mon', times: ['18-20', '20-22'] },
            { day: 'Wed', times: ['18-20'] },
            { day: 'Fri', times: ['20-22', '22-24'] }
        ],
        languages: ['English']
    }
  },
  {
    id: 'user_2',
    uniqueCode: 'A7B8C9',
    username: 'StrategyGod',
    email: 'strat@game.com',
    avatar: 'https://picsum.photos/200/200?random=2',
    bio: 'IGL for semi-pro team. Looking for scrims.',
    rank: 'Radiant',
    level: 890,
    yearsExperience: 8,
    games: ['CS:2', 'Valorant'],
    gallery: ['https://picsum.photos/400/600?random=12'],
    friends: [],
    incomingRequests: ['user_current'], // Mock: Current user sent request to this user
    outgoingRequests: [],
    squadProfile: {
        roles: ['Controller', 'IGL', 'Support'],
        communication: 'Strategic',
        availability: [
            { day: 'Mon', times: ['20-22'] },
            { day: 'Tue', times: ['20-22'] },
            { day: 'Thu', times: ['20-22'] }
        ],
        languages: ['English', 'German']
    }
  },
  {
    id: 'user_3',
    uniqueCode: 'Q1W2E3',
    username: 'PixelHealer',
    email: 'heal@game.com',
    avatar: 'https://picsum.photos/200/200?random=3',
    bio: 'Support main. If you dive alone, you die alone.',
    rank: 'Gold',
    level: 120,
    yearsExperience: 2,
    games: ['Overwatch 2', 'League of Legends'],
    gallery: ['https://picsum.photos/400/600?random=13'],
    friends: ['user_current'],
    incomingRequests: [],
    outgoingRequests: [],
    squadProfile: {
        roles: ['Support', 'Healer'],
        communication: 'Casual',
        availability: [
            { day: 'Sat', times: ['14-16', '16-18', '18-20'] },
            { day: 'Sun', times: ['14-16', '16-18'] }
        ],
        languages: ['English']
    }
  },
  { 
      id: 'u4', 
      uniqueCode: 'EXTRA1', 
      username: 'SniperWolf', 
      email: 's@s.com', 
      avatar: 'https://picsum.photos/200/200?random=4', 
      bio: 'One shot one kill', 
      rank: 'Silver', 
      level: 10, 
      yearsExperience: 1, 
      games: ['Valorant', 'Call of Duty'], 
      gallery: [], 
      friends: [], 
      incomingRequests: [], 
      outgoingRequests: [],
      squadProfile: {
          roles: ['DPS', 'Sniper'],
          communication: 'Casual',
          availability: [{ day: 'Fri', times: ['20-22'] }],
          languages: ['English']
      }
  },
  { 
      id: 'u5', 
      uniqueCode: 'EXTRA2', 
      username: 'TankMain', 
      email: 't@t.com', 
      avatar: 'https://picsum.photos/200/200?random=5', 
      bio: 'I am the shield', 
      rank: 'Gold', 
      level: 20, 
      yearsExperience: 2, 
      games: ['Overwatch 2', 'League of Legends'], 
      gallery: [], 
      friends: [], 
      incomingRequests: [], 
      outgoingRequests: [],
      squadProfile: {
          roles: ['Tank'],
          communication: 'Strategic',
          availability: [{ day: 'Mon', times: ['18-20'] }],
          languages: ['English']
      }
  },
  { id: 'u6', uniqueCode: 'EXTRA3', username: 'HealerBoi', email: 'h@h.com', avatar: 'https://picsum.photos/200/200?random=6', bio: '', rank: 'Platinum', level: 30, yearsExperience: 3, games: [], gallery: [], friends: [], incomingRequests: [], outgoingRequests: [] },
  { id: 'u7', uniqueCode: 'EXTRA4', username: 'Lurker', email: 'l@l.com', avatar: 'https://picsum.photos/200/200?random=7', bio: '', rank: 'Diamond', level: 40, yearsExperience: 4, games: [], gallery: [], friends: [], incomingRequests: [], outgoingRequests: [] },
];

export const CURRENT_USER_MOCK: User = {
  id: 'user_current',
  uniqueCode: 'G4M3R1',
  username: 'ProPlayerOne',
  email: 'pro@game.com',
  avatar: 'https://picsum.photos/200/200?random=99',
  bio: 'Just here to vibe and climb the ladder.',
  rank: 'Platinum',
  level: 50,
  yearsExperience: 3,
  games: ['Valorant', 'Minecraft'],
  gallery: ['https://picsum.photos/400/600?random=98'],
  friends: ['user_1', 'user_3'],
  incomingRequests: [], // Mock: No incoming requests initially
  outgoingRequests: ['user_2'], // Mock: Sent request to user_2
  squadProfile: {
      roles: ['Flex', 'Initiator'],
      communication: 'Strategic',
      availability: [
          { day: 'Mon', times: ['18-20', '20-22'] },
          { day: 'Wed', times: ['18-20'] },
          { day: 'Fri', times: ['20-22'] }
      ],
      languages: ['English']
  }
};

export const MOCK_MESSAGES: Record<string, any[]> = {
  'user_1': [
    { id: 'm1', senderId: 'user_1', receiverId: 'user_current', text: 'Yo, up for ranked?', timestamp: Date.now() - 100000, type: 'text' },
    { id: 'm2', senderId: 'user_current', receiverId: 'user_1', text: 'Sure, give me 5 mins.', timestamp: Date.now() - 50000, type: 'text' },
  ],
  'user_3': [
    { id: 'm3', senderId: 'user_3', receiverId: 'user_current', text: 'Thanks for the carry last night!', timestamp: Date.now() - 200000, type: 'text' }
  ]
};

export const MOCK_VOICE_CHANNELS: VoiceChannel[] = [
  { 
    id: 'vc_1', 
    name: 'Valorant Ranked Grind', 
    creator: 'JettMain99', 
    game: 'Valorant', 
    connectedUserIds: ['user_1', 'user_2', 'user_3'],
    maxUsers: 6,
    isPublic: true
  },
  { 
    id: 'vc_2', 
    name: 'Apex Legends Chill', 
    creator: 'StrategyGod', 
    game: 'Apex Legends', 
    connectedUserIds: ['user_1'],
    maxUsers: 6,
    isPublic: true
  },
  { 
    id: 'vc_3', 
    name: 'FULL SQUAD', 
    creator: 'Admin', 
    game: 'Counter-Strike 2', 
    connectedUserIds: ['u4', 'u5', 'u6', 'u7', 'user_2', 'user_3'],
    maxUsers: 6,
    isPublic: true
  },
];

export const MOCK_TOURNAMENTS: Tournament[] = [
    {
        id: 'tourney_1',
        name: 'Valorant Weekly Cup',
        game: 'Valorant',
        description: 'Weekly community tournament. Winner takes all.',
        format: 'Single Elimination',
        entryFee: 10,
        prizePool: 500,
        status: 'Active',
        startDate: new Date().toISOString(),
        maxParticipants: 8,
        participants: ['user_1', 'user_2', 'user_3', 'u4', 'u5', 'u6', 'u7', 'user_current'],
        rules: ['Best of 1', 'Map Ban/Pick via chat', 'No toxicity'],
        hostId: 'admin'
    },
    {
        id: 'tourney_2',
        name: 'CS2 Pro Scrim',
        game: 'Counter-Strike 2',
        description: 'High level scrims for serious teams.',
        format: 'Double Elimination',
        entryFee: 50,
        prizePool: 2000,
        status: 'Registration',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        maxParticipants: 16,
        participants: ['user_2', 'u7'],
        rules: ['Standard Comp Rules', 'Anti-cheat required'],
        hostId: 'admin'
    }
];

export const MOCK_TOURNAMENT_MATCHES: TournamentMatch[] = [
    // Round 1 (Quarter Finals for 8 players)
    { id: 'm_1_1', tournamentId: 'tourney_1', round: 1, matchNumber: 1, player1Id: 'user_1', player2Id: 'user_2', score1: 13, score2: 11, winnerId: 'user_1', status: 'Completed' },
    { id: 'm_1_2', tournamentId: 'tourney_1', round: 1, matchNumber: 2, player1Id: 'user_3', player2Id: 'u4', score1: 5, score2: 13, winnerId: 'u4', status: 'Completed' },
    { id: 'm_1_3', tournamentId: 'tourney_1', round: 1, matchNumber: 3, player1Id: 'u5', player2Id: 'u6', score1: 0, score2: 0, winnerId: null, status: 'Live', streamUrl: 'mock_stream' },
    { id: 'm_1_4', tournamentId: 'tourney_1', round: 1, matchNumber: 4, player1Id: 'u7', player2Id: 'user_current', score1: 0, score2: 0, winnerId: null, status: 'Scheduled' },
    
    // Round 2 (Semi Finals)
    { id: 'm_2_1', tournamentId: 'tourney_1', round: 2, matchNumber: 1, player1Id: 'user_1', player2Id: 'u4', score1: 0, score2: 0, winnerId: null, status: 'Scheduled' },
    { id: 'm_2_2', tournamentId: 'tourney_1', round: 2, matchNumber: 2, player1Id: null, player2Id: null, score1: 0, score2: 0, winnerId: null, status: 'Scheduled' },

    // Round 3 (Finals)
    { id: 'm_3_1', tournamentId: 'tourney_1', round: 3, matchNumber: 1, player1Id: null, player2Id: null, score1: 0, score2: 0, winnerId: null, status: 'Scheduled' },
];

export const RANK_ICONS: Record<string, string> = {
  'Iron': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/3/largeicon.png',
  'Bronze': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/6/largeicon.png',
  'Silver': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/9/largeicon.png',
  'Gold': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/12/largeicon.png',
  'Platinum': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/15/largeicon.png',
  'Diamond': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/18/largeicon.png',
  'Ascendant': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/largeicon.png',
  'Immortal': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/largeicon.png',
  'Radiant': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/25/largeicon.png',
};