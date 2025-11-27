
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../GlassComponents';
import { User, Tournament, TournamentMatch, GLOBAL_GAMES } from '../../types';
import { MOCK_TOURNAMENTS, MOCK_TOURNAMENT_MATCHES } from '../../constants';
import { Trophy, Plus, Calendar, DollarSign, Users, Tv, MessageCircle, Share2, Heart, Award, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TournamentsViewProps {
    currentUser: User;
    allUsers: User[];
}

type SubView = 'list' | 'create' | 'detail' | 'spectate';

export const TournamentsView: React.FC<TournamentsViewProps> = ({ currentUser, allUsers }) => {
    const [subView, setSubView] = useState<SubView>('list');
    const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
    const [matches, setMatches] = useState<TournamentMatch[]>(MOCK_TOURNAMENT_MATCHES);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

    // --- Sub-View Switchers ---
    const goToDetail = (t: Tournament) => {
        setSelectedTournament(t);
        setSubView('detail');
    };

    const goToSpectate = (m: TournamentMatch) => {
        setSelectedMatch(m);
        setSubView('spectate');
    };

    const handleCreateTournament = (newTournament: Tournament) => {
        setTournaments([newTournament, ...tournaments]);
        // Also generate matches for bracket
        const newMatches = generateBracketMatches(newTournament);
        setMatches([...matches, ...newMatches]);
        
        setSelectedTournament(newTournament);
        setSubView('detail');
    };

    const generateBracketMatches = (t: Tournament): TournamentMatch[] => {
        // Simplified Logic for Single Elimination 8 players max
        // In a real app, this would be complex recursive logic
        const generated: TournamentMatch[] = [];
        const numParticipants = t.maxParticipants;
        let matchCount = 1;

        // Round 1
        for (let i = 0; i < numParticipants / 2; i++) {
            generated.push({
                id: `${t.id}_m_1_${i+1}`,
                tournamentId: t.id,
                round: 1,
                matchNumber: i + 1,
                player1Id: null, // Would seed here
                player2Id: null,
                score1: 0,
                score2: 0,
                winnerId: null,
                status: 'Scheduled'
            });
        }
        // Round 2
        for (let i = 0; i < numParticipants / 4; i++) {
            generated.push({
                 id: `${t.id}_m_2_${i+1}`,
                 tournamentId: t.id,
                 round: 2,
                 matchNumber: i + 1,
                 player1Id: null,
                 player2Id: null,
                 score1: 0,
                 score2: 0,
                 winnerId: null,
                 status: 'Scheduled'
            });
        }
        // Finals
        generated.push({
            id: `${t.id}_m_3_1`,
            tournamentId: t.id,
            round: 3,
            matchNumber: 1,
            player1Id: null,
            player2Id: null,
            score1: 0,
            score2: 0,
            winnerId: null,
            status: 'Scheduled'
        });

        return generated;
    };

    // --- Views RENDER ---

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#1a1440] to-[#24243e]">
            {/* Ambient Gold Glows for Tournament Theme */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            {subView === 'list' && (
                <TournamentList 
                    tournaments={tournaments} 
                    onCreate={() => setSubView('create')} 
                    onSelect={goToDetail} 
                />
            )}

            {subView === 'create' && (
                <TournamentWizard 
                    currentUser={currentUser}
                    onCancel={() => setSubView('list')}
                    onComplete={handleCreateTournament}
                />
            )}

            {subView === 'detail' && selectedTournament && (
                <TournamentHub 
                    tournament={selectedTournament}
                    allMatches={matches.filter(m => m.tournamentId === selectedTournament.id)}
                    allUsers={allUsers}
                    currentUser={currentUser}
                    onBack={() => setSubView('list')}
                    onSpectate={goToSpectate}
                />
            )}

            {subView === 'spectate' && selectedMatch && (
                <SpectatorMode 
                    match={selectedMatch}
                    allUsers={allUsers}
                    onClose={() => setSubView('detail')}
                />
            )}
        </div>
    );
};

// ================= SUB-COMPONENTS =================

// 1. TOURNAMENT LIST
const TournamentList = ({ tournaments, onCreate, onSelect }: any) => {
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-gamer font-bold text-white flex items-center gap-3">
                        <Trophy className="text-amber-400" size={32} />
                        Tournaments
                    </h1>
                    <p className="text-amber-200/60 text-sm mt-1">Compete for glory and prizes</p>
                </div>
                <GlassButton 
                    onClick={onCreate}
                    className="bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 flex items-center gap-2"
                >
                    <Plus size={20} /> Host Tournament
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 custom-scrollbar">
                {tournaments.map((t: Tournament) => (
                    <GlassCard 
                        key={t.id} 
                        onClick={() => onSelect(t)}
                        className="group relative overflow-hidden border-amber-500/20 hover:border-amber-400/50 transition-all cursor-pointer h-64 flex flex-col"
                    >
                        {/* Background Image Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                        
                        <div className="relative z-20 p-6 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${t.status === 'Active' ? 'bg-green-500 text-black' : 'bg-amber-500 text-black'}`}>
                                        {t.status}
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                                        <DollarSign size={14} /> {t.prizePool}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{t.name}</h3>
                                <p className="text-xs text-gray-300 uppercase tracking-wide mb-4">{t.game}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Users size={16} className="text-amber-500/70" />
                                    <span>{t.participants.length} / {t.maxParticipants} Players</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar size={16} className="text-amber-500/70" />
                                    <span>{new Date(t.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-mono text-gray-500">{t.format}</span>
                                    <span className="text-amber-300 text-sm font-bold flex items-center gap-1">
                                        View Bracket <ChevronRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// 2. WIZARD
const TournamentWizard = ({ currentUser, onCancel, onComplete }: any) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Tournament>>({
        name: '',
        game: GLOBAL_GAMES[0],
        description: '',
        format: 'Single Elimination',
        entryFee: 0,
        prizePool: 100,
        maxParticipants: 8,
        participants: [],
        rules: []
    });

    const steps = [
        { title: 'Basic Info', icon: <Trophy size={18} /> },
        { title: 'Format', icon: <Award size={18} /> },
        { title: 'Prizes', icon: <DollarSign size={18} /> },
        { title: 'Rules', icon: <Lock size={18} /> }
    ];

    const handleSubmit = () => {
        const newTournament: Tournament = {
            ...formData as Tournament,
            id: `tourney_${Date.now()}`,
            hostId: currentUser.id,
            status: 'Registration',
            startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            participants: [currentUser.id] // Host joins automatically?
        };
        onComplete(newTournament);
    };

    return (
        <div className="h-full p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
                    {steps.map((s, idx) => (
                        <div key={idx} className={`flex flex-col items-center gap-2 ${idx + 1 <= step ? 'text-amber-400' : 'text-gray-500'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-black ${idx + 1 <= step ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-gray-600'}`}>
                                {s.icon}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">{s.title}</span>
                        </div>
                    ))}
                </div>

                <GlassCard className="p-8 border-amber-500/20">
                    <h2 className="text-2xl font-bold mb-6 text-center">{steps[step-1].title}</h2>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Tournament Name</label>
                                <GlassInput value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sunday Showdown" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Game</label>
                                <GlassSelect value={formData.game} onChange={e => setFormData({...formData, game: e.target.value})}>
                                    {GLOBAL_GAMES.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
                                </GlassSelect>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Description</label>
                                <GlassInput value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description..." />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                {['Single Elimination', 'Double Elimination', 'Round Robin'].map(fmt => (
                                    <div 
                                        key={fmt} 
                                        onClick={() => setFormData({...formData, format: fmt as any})}
                                        className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${formData.format === fmt ? 'bg-amber-500/20 border-amber-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <span className="text-sm font-bold">{fmt}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Max Participants</label>
                                <div className="flex gap-4">
                                    {[8, 16, 32].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setFormData({...formData, maxParticipants: num})}
                                            className={`flex-1 py-3 rounded-xl border font-mono font-bold ${formData.maxParticipants === num ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-white/5 border-white/10'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Entry Fee ($)</label>
                                    <GlassInput type="number" value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: parseInt(e.target.value)})} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Prize Pool ($)</label>
                                    <GlassInput type="number" value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                                <h4 className="font-bold text-amber-400 mb-2 text-sm uppercase">Projected Payout</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>1st Place</span> <span>${(formData.prizePool || 0) * 0.6}</span></div>
                                    <div className="flex justify-between"><span>2nd Place</span> <span>${(formData.prizePool || 0) * 0.3}</span></div>
                                    <div className="flex justify-between"><span>3rd Place</span> <span>${(formData.prizePool || 0) * 0.1}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                         <div className="space-y-4 text-center">
                            <p className="text-gray-300 mb-6">Review your settings. By creating this tournament, you agree to organize matches and validate results fairly.</p>
                            <div className="bg-white/5 p-4 rounded-xl text-left text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-bold">{formData.name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Game:</span> <span className="font-bold">{formData.game}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Format:</span> <span className="font-bold">{formData.format}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Prize:</span> <span className="font-bold text-amber-400">${formData.prizePool}</span></div>
                            </div>
                         </div>
                    )}

                    <div className="flex justify-between mt-8">
                        {step > 1 ? (
                            <GlassButton onClick={() => setStep(step - 1)} variant="secondary">Back</GlassButton>
                        ) : (
                            <GlassButton onClick={onCancel} variant="ghost" className="text-red-400">Cancel</GlassButton>
                        )}
                        
                        {step < 4 ? (
                            <GlassButton onClick={() => setStep(step + 1)} className="bg-amber-500/20 text-amber-300 border-amber-500/50">Next</GlassButton>
                        ) : (
                            <GlassButton onClick={handleSubmit} className="bg-amber-500 text-black border-none font-bold shadow-lg shadow-amber-500/50">Create Tournament</GlassButton>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// 3. TOURNAMENT HUB (DETAIL)
const TournamentHub = ({ tournament, allMatches, allUsers, currentUser, onBack, onSpectate }: any) => {
    const [tab, setTab] = useState<'bracket' | 'players' | 'overview'>('overview');

    // Helper to get username
    const getName = (id: string | null) => {
        if (!id) return 'TBD';
        const u = allUsers.find((user: User) => user.id === id);
        return u ? u.username : 'Unknown';
    };

    // Organize Matches by Round
    const rounds = [1, 2, 3];
    const roundNames = ['Quarter Finals', 'Semi Finals', 'Grand Final'];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-30">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold font-gamer">{tournament.name}</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="text-amber-400 uppercase font-bold tracking-wider">{tournament.game}</span>
                        <span>{tournament.format}</span>
                        <span>Prize: ${tournament.prizePool}</span>
                    </div>
                </div>
                {tournament.status === 'Registration' && !tournament.participants.includes(currentUser.id) && (
                    <GlassButton className="bg-green-600 text-white border-none shadow-lg shadow-green-500/30">
                        Register (${tournament.entryFee})
                    </GlassButton>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/10">
                {['overview', 'bracket', 'players'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${tab === t ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                {tab === 'overview' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-gray-400 text-xs uppercase mb-1">Status</div>
                                <div className="text-xl font-bold text-green-400">{tournament.status}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-gray-400 text-xs uppercase mb-1">Entry Fee</div>
                                <div className="text-xl font-bold text-white">${tournament.entryFee}</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-gray-400 text-xs uppercase mb-1">Participants</div>
                                <div className="text-xl font-bold text-blue-400">{tournament.participants.length} / {tournament.maxParticipants}</div>
                            </div>
                        </div>
                        <GlassCard className="p-6">
                            <h3 className="font-bold text-lg mb-4 text-amber-300">Description</h3>
                            <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <h3 className="font-bold text-lg mb-4 text-amber-300">Rules</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                {tournament.rules.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                        </GlassCard>
                    </div>
                )}

                {tab === 'players' && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {tournament.participants.map((pid: string) => {
                            const p = allUsers.find((u: User) => u.id === pid);
                            if (!p) return null;
                            return (
                                <div key={pid} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <img src={p.avatar} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="font-bold text-sm">{p.username}</div>
                                        <div className="text-xs text-gray-500">{p.rank}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === 'bracket' && (
                    <div className="flex gap-8 overflow-x-auto min-w-full pb-8">
                        {rounds.map((round) => {
                            const roundMatches = allMatches.filter((m: TournamentMatch) => m.round === round).sort((a: any, b: any) => a.matchNumber - b.matchNumber);
                            if (roundMatches.length === 0) return null;

                            return (
                                <div key={round} className="flex flex-col min-w-[250px] gap-8">
                                    <h3 className="text-center font-bold text-gray-500 uppercase text-xs mb-4">{roundNames[round-1]}</h3>
                                    <div className="flex flex-col justify-around flex-1 gap-8"> 
                                        {/* CSS Grid/Flex trick for bracket spacing would usually go here, simplified with gap-8 for now */}
                                        {roundMatches.map((m: TournamentMatch) => (
                                            <div key={m.id} className="relative group">
                                                <div className={`rounded-xl border overflow-hidden ${m.status === 'Live' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-white/10 bg-black/40'}`}>
                                                    {m.status === 'Live' && (
                                                        <div className="bg-red-600 text-white text-[10px] font-bold text-center py-0.5 uppercase tracking-widest animate-pulse">
                                                            Live Now
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col divide-y divide-white/10">
                                                        <div className={`p-3 flex justify-between items-center ${m.winnerId === m.player1Id ? 'bg-amber-500/10' : ''}`}>
                                                            <span className={`text-sm font-bold ${!m.player1Id ? 'text-gray-600' : 'text-gray-200'}`}>{getName(m.player1Id)}</span>
                                                            <span className="font-mono font-bold text-gray-400">{m.score1}</span>
                                                        </div>
                                                        <div className={`p-3 flex justify-between items-center ${m.winnerId === m.player2Id ? 'bg-amber-500/10' : ''}`}>
                                                            <span className={`text-sm font-bold ${!m.player2Id ? 'text-gray-600' : 'text-gray-200'}`}>{getName(m.player2Id)}</span>
                                                            <span className="font-mono font-bold text-gray-400">{m.score2}</span>
                                                        </div>
                                                    </div>
                                                    {/* Hover Overlay for Action */}
                                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {m.status === 'Live' ? (
                                                            <button onClick={() => onSpectate(m)} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:scale-105 transition-transform">
                                                                <Tv size={12} /> Watch
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 font-bold uppercase">{m.status}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// 4. SPECTATOR MODE
const SpectatorMode = ({ match, allUsers, onClose }: any) => {
    const [messages, setMessages] = useState<{user: string, text: string}[]>([
        {user: 'System', text: 'Welcome to the spectator channel.'},
        {user: 'Fan123', text: 'Lets goooo!'},
    ]);
    const [chatInput, setChatInput] = useState('');

    const p1 = allUsers.find((u: User) => u.id === match.player1Id);
    const p2 = allUsers.find((u: User) => u.id === match.player2Id);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!chatInput.trim()) return;
        setMessages([...messages, {user: 'Me', text: chatInput}]);
        setChatInput('');
    }

    return (
        <div className="h-full flex flex-col md:flex-row bg-black">
            {/* Main Stream Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="bg-gray-900 flex-1 flex items-center justify-center relative overflow-hidden group">
                    {/* Fake Stream Placeholder */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670')] bg-cover bg-center opacity-50"></div>
                    <div className="relative z-10 text-center">
                        <div className="animate-pulse mb-4 text-red-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Live Signal
                        </div>
                        <h2 className="text-3xl font-gamer font-bold text-white mb-2">{p1?.username || 'TBD'} <span className="text-gray-500 text-xl mx-2">VS</span> {p2?.username || 'TBD'}</h2>
                        <div className="font-mono text-4xl font-bold text-amber-400 bg-black/50 px-6 py-2 rounded-xl inline-block border border-amber-500/30">
                            {match.score1} - {match.score2}
                        </div>
                    </div>
                    
                    {/* Overlay Controls */}
                    <button onClick={onClose} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full hover:bg-white/10 text-white z-20">
                        <ChevronLeft />
                    </button>
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                         <div className="bg-red-600 px-3 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                             <Users size={12} /> 1.2k
                         </div>
                    </div>
                </div>

                {/* Stream Info Bar */}
                <div className="h-20 bg-gray-900 border-t border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black">
                            {match.round === 3 ? 'FIN' : `R${match.round}`}
                        </div>
                        <div>
                            <div className="font-bold text-white">Tournament Match #{match.matchNumber}</div>
                            <div className="text-xs text-gray-400">Map 1: Ascent</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="text-gray-400 hover:text-white"><Share2 /></button>
                        <button className="text-red-400 hover:text-red-300"><Heart /></button>
                    </div>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-full md:w-80 bg-gray-950 border-l border-white/10 flex flex-col h-1/3 md:h-full">
                <div className="p-3 border-b border-white/10 font-bold text-sm uppercase tracking-wider text-gray-400">
                    Spectator Chat
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className="text-sm">
                            <span className="font-bold text-amber-500 mr-2">{m.user}:</span>
                            <span className="text-gray-300">{m.text}</span>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-gray-900">
                    <div className="relative">
                        <input 
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                            placeholder="Cheer for a team..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-white">
                            <MessageCircle size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
