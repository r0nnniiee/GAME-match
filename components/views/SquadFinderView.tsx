
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassSelect } from '../GlassComponents';
import { User, SquadProfile, GLOBAL_GAMES, RANKS } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Sword, Heart, RefreshCw, Calendar, ChevronRight, ChevronLeft, UserPlus, Sparkles } from 'lucide-react';

interface SquadFinderViewProps {
    currentUser: User;
    allUsers: User[];
    onSendRequest?: (code: string) => void;
}

// ---- SMART MATCHING ALGORITHM ----
class SmartMatchingAlgorithm {
    private weights = {
        skillLevel: 0.35,
        availability: 0.30,
        gameModes: 0.20, // Used for game overlap
        roles: 0.15
    };

    private rankToNumber(rank: string): number {
        return RANKS.indexOf(rank);
    }

    calculateCompatibility(userA: User, userB: User, targetGame: string): number {
        let score = 0;
        
        // 0. Game Check (Prerequisite)
        if (!userB.games.includes(targetGame)) return 0;
        score += 20 * this.weights.gameModes; // Base score for playing the same game

        // 1. Skill Level Matching (35%)
        const skillA = this.rankToNumber(userA.rank);
        const skillB = this.rankToNumber(userB.rank);
        score += this.calculateSkillCompatibility(skillA, skillB) * this.weights.skillLevel * 100;

        // 2. Availability Matching (30%)
        if (userA.squadProfile && userB.squadProfile) {
            score += this.calculateAvailabilityCompatibility(
                userA.squadProfile.availability, 
                userB.squadProfile.availability
            ) * this.weights.availability * 100;
        }

        // 3. Role Compatibility (15%)
        if (userA.squadProfile && userB.squadProfile) {
            score += this.calculateRoleCompatibility(
                userA.squadProfile.roles, 
                userB.squadProfile.roles
            ) * this.weights.roles * 100;
        }

        // 4. Bonus: Communication Style
        if (userA.squadProfile?.communication === userB.squadProfile?.communication) {
            score += 5;
        }

        return Math.min(Math.round(score), 100);
    }

    private calculateSkillCompatibility(skillA: number, skillB: number): number {
        const diff = Math.abs(skillA - skillB);
        if (diff <= 1) return 1.0; // Same or adjacent rank
        if (diff <= 2) return 0.8;
        if (diff <= 3) return 0.5;
        return 0.2;
    }

    private calculateAvailabilityCompatibility(availA: any[], availB: any[]): number {
        let matches = 0;
        let totalSlots = 0;
        
        availA.forEach(slotA => {
            const matchDay = availB.find(slotB => slotB.day === slotA.day);
            if (matchDay) {
                // Check time overlap
                const commonTimes = slotA.times.filter((t: string) => matchDay.times.includes(t));
                matches += commonTimes.length;
            }
            totalSlots += slotA.times.length;
        });

        return totalSlots > 0 ? (matches / totalSlots) : 0;
    }

    private calculateRoleCompatibility(rolesA: string[], rolesB: string[]): number {
        // Ideal: Different roles (Tank + Support) is better than Tank + Tank usually, 
        // but for this generic algo, let's assume we want synergy.
        // Simple Logic: If roles are DIFFERENT, higher score? Or if they fit a composition?
        // Let's go with: If they cover different roles, it's good.
        
        const synergyMap: Record<string, string[]> = {
            'Tank': ['DPS', 'Support', 'Sniper'],
            'DPS': ['Tank', 'Support', 'Initiator'],
            'Support': ['Tank', 'DPS', 'Duelist'],
            'Duelist': ['Controller', 'Sentinel', 'Initiator'],
            'Controller': ['Duelist', 'Sentinel'],
            'Sentinel': ['Controller', 'Duelist'],
            'Flex': ['Tank', 'DPS', 'Support']
        };

        let synergyScore = 0;
        let checks = 0;

        rolesA.forEach(rA => {
            rolesB.forEach(rB => {
                checks++;
                if (synergyMap[rA]?.includes(rB) || rA === 'Flex' || rB === 'Flex') {
                    synergyScore++;
                }
            });
        });

        return checks > 0 ? (synergyScore / checks) : 0.5;
    }
}

// ---- WIZARD COMPONENT ----

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
    { id: '18-20', label: '6PM - 8PM' },
    { id: '20-22', label: '8PM - 10PM' },
    { id: '22-24', label: '10PM - 12AM' }
];

export const SquadFinderView: React.FC<SquadFinderViewProps> = ({ currentUser, allUsers, onSendRequest }) => {
    const [step, setStep] = useState(1);
    const [selectedGame, setSelectedGame] = useState(currentUser.games[0] || GLOBAL_GAMES[0]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(currentUser.squadProfile?.roles || []);
    const [availability, setAvailability] = useState(currentUser.squadProfile?.availability || []);
    const [matches, setMatches] = useState<{user: User, score: number}[]>([]);

    const algorithm = new SmartMatchingAlgorithm();

    const handleRoleToggle = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleAvailabilityToggle = (day: string, slotId: string) => {
        setAvailability(prev => {
            const dayIndex = prev.findIndex(p => p.day === day);
            if (dayIndex >= 0) {
                const dayData = prev[dayIndex];
                const newTimes = dayData.times.includes(slotId) 
                    ? dayData.times.filter(t => t !== slotId)
                    : [...dayData.times, slotId];
                
                if (newTimes.length === 0) return prev.filter(p => p.day !== day);
                
                const newPrev = [...prev];
                newPrev[dayIndex] = { ...dayData, times: newTimes };
                return newPrev;
            } else {
                return [...prev, { day, times: [slotId] }];
            }
        });
    };

    const runMatching = () => {
        // Construct temporary profile for matching
        const tempUser = {
            ...currentUser,
            squadProfile: {
                roles: selectedRoles,
                availability: availability,
                communication: 'Strategic', // Default for now
                languages: ['English']
            }
        } as User;

        const results = allUsers
            .filter(u => u.id !== currentUser.id) // Exclude self
            .map(u => ({
                user: u,
                score: algorithm.calculateCompatibility(tempUser, u, selectedGame)
            }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score);

        setMatches(results);
        setStep(4);
    };

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 })
    };

    return (
        <div className="h-full overflow-hidden flex flex-col relative">
            {/* Liquid Background Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col p-6">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-gamer font-bold flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> Squad Finder
                        </h1>
                        <p className="text-gray-400 text-sm">AI-Powered Teammate Matching</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div 
                                key={s} 
                                className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} 
                            />
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode='wait'>
                        {/* STEP 1: GAME */}
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <h2 className="text-2xl font-bold mb-8">Select Game</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
                                    {GLOBAL_GAMES.slice(0, 9).map(game => (
                                        <button
                                            key={game}
                                            onClick={() => setSelectedGame(game)}
                                            className={`p-6 rounded-2xl border transition-all text-center font-bold text-lg
                                                ${selectedGame === game 
                                                    ? 'bg-gradient-to-br from-blue-600/40 to-purple-600/40 border-blue-400 shadow-lg shadow-blue-500/20 scale-105' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {game}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-12 flex justify-end w-full max-w-3xl">
                                    <GlassButton onClick={() => setStep(2)} className="px-8 py-3 flex items-center gap-2">
                                        Next <ChevronRight size={20} />
                                    </GlassButton>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: ROLES */}
                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <h2 className="text-2xl font-bold mb-8">Your Preferred Roles</h2>
                                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                                    {[
                                        { id: 'Tank', icon: <Shield size={32} />, desc: 'Frontline protection' },
                                        { id: 'DPS', icon: <Sword size={32} />, desc: 'Damage dealer' },
                                        { id: 'Support', icon: <Heart size={32} />, desc: 'Heal and utility' },
                                        { id: 'Flex', icon: <RefreshCw size={32} />, desc: 'Fill any role' }
                                    ].map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleToggle(role.id)}
                                            className={`p-8 rounded-2xl border transition-all flex flex-col items-center gap-3
                                                ${selectedRoles.includes(role.id)
                                                    ? 'bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/20' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={selectedRoles.includes(role.id) ? 'text-blue-300' : 'text-gray-400'}>{role.icon}</div>
                                            <span className="font-bold text-xl">{role.id}</span>
                                            <span className="text-xs text-gray-400">{role.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-12 flex justify-between w-full max-w-2xl">
                                    <GlassButton onClick={() => setStep(1)} variant="secondary" className="px-8 py-3 flex items-center gap-2">
                                        <ChevronLeft size={20} /> Back
                                    </GlassButton>
                                    <GlassButton onClick={() => setStep(3)} className="px-8 py-3 flex items-center gap-2">
                                        Next <ChevronRight size={20} />
                                    </GlassButton>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: AVAILABILITY */}
                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <h2 className="text-2xl font-bold mb-8">When Do You Play?</h2>
                                <GlassCard className="p-6 w-full max-w-4xl overflow-x-auto">
                                    <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-4 min-w-[600px]">
                                        <div className="col-span-1"></div>
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center font-bold text-gray-400 uppercase text-sm">{day}</div>
                                        ))}

                                        {TIME_SLOTS.map(slot => (
                                            <React.Fragment key={slot.id}>
                                                <div className="text-right text-xs font-bold text-gray-500 py-4 pr-4">{slot.label}</div>
                                                {DAYS.map(day => {
                                                    const isActive = availability.find(a => a.day === day)?.times.includes(slot.id);
                                                    return (
                                                        <button
                                                            key={`${day}-${slot.id}`}
                                                            onClick={() => handleAvailabilityToggle(day, slot.id)}
                                                            className={`rounded-lg border transition-all h-12
                                                                ${isActive 
                                                                    ? 'bg-green-500/40 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' 
                                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                        </button>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </GlassCard>
                                <div className="mt-8 flex justify-between w-full max-w-4xl">
                                    <GlassButton onClick={() => setStep(2)} variant="secondary" className="px-8 py-3 flex items-center gap-2">
                                        <ChevronLeft size={20} /> Back
                                    </GlassButton>
                                    <GlassButton onClick={runMatching} variant="primary" className="px-8 py-3 flex items-center gap-2">
                                        Find Squad <Sparkles size={20} />
                                    </GlassButton>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: RESULTS */}
                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col max-w-4xl mx-auto w-full"
                            >
                                <h2 className="text-2xl font-bold mb-2 text-center">Your Perfect Squad</h2>
                                <p className="text-gray-400 text-center mb-8">Based on skill, schedule, and role synergy for {selectedGame}</p>

                                {matches.length === 0 ? (
                                    <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-xl text-gray-300">No perfect matches found yet.</p>
                                        <p className="text-sm text-gray-500 mt-2">Try adjusting your availability or roles.</p>
                                        <GlassButton onClick={() => setStep(1)} variant="secondary" className="mt-6">Start Over</GlassButton>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 overflow-y-auto pb-20">
                                        {matches.map(({user, score}, idx) => (
                                            <GlassCard key={user.id} className="p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border-white/10">
                                                <div className="relative shrink-0">
                                                    <img src={user.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                                                    <div className="absolute -bottom-2 -right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/20">
                                                        Lvl {user.level}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-lg truncate">{user.username}</h3>
                                                        <span className={`text-lg font-bold font-mono ${score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                            {score}% Match
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs mt-1 text-gray-400">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">{user.rank}</span>
                                                        {user.squadProfile?.roles.map(r => (
                                                            <span key={r} className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-300">{r}</span>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Plays: {user.squadProfile?.availability.map(a => a.day).join(', ')}
                                                    </div>
                                                </div>

                                                <GlassButton 
                                                    onClick={() => onSendRequest?.(user.uniqueCode)}
                                                    className="shrink-0 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                                                >
                                                    <UserPlus size={20} />
                                                </GlassButton>
                                            </GlassCard>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 text-center">
                                     <GlassButton onClick={() => setStep(1)} variant="ghost" className="text-sm text-gray-400">Modify Search</GlassButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
