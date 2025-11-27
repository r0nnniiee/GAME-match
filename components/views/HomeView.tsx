
import React, { useState } from 'react';
import { GlassCard, GlassButton } from '../GlassComponents';
import { MOCK_USERS, RANK_ICONS } from '../../constants';
import { User } from '../../types';
import { X, Heart, Gamepad, UserPlus, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeViewProps {
    currentUser?: User; // Optional to support fallback if not passed immediately, though App logic handles it
    allUsers?: User[];
    onSendRequest?: (code: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ currentUser, allUsers = MOCK_USERS, onSendRequest }) => {
  // Filter potential matches: not self, not already friends
  const initialMatches = allUsers.filter(u => 
    u.id !== currentUser?.id && 
    !currentUser?.friends.includes(u.id)
  );

  const [potentialMatches, setPotentialMatches] = useState<User[]>(initialMatches);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const playSound = (type: 'like' | 'dislike') => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'like') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        }
      } catch (e) {
          console.error("Audio playback failed", e);
      }
  };

  const swiped = (direction: string, userToDelete: string) => {
    playSound(direction === 'right' ? 'like' : 'dislike');
    setLastDirection(direction);
    setPotentialMatches(prev => prev.filter(user => user.id !== userToDelete));
  };

  const getFriendStatus = (targetId: string) => {
      if (!currentUser) return 'none';
      if (currentUser.friends.includes(targetId)) return 'friend';
      if (currentUser.outgoingRequests.includes(targetId)) return 'sent';
      if (currentUser.incomingRequests.includes(targetId)) return 'incoming';
      return 'none';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-sm h-[600px]">
        <AnimatePresence>
          {potentialMatches.map((user, index) => {
             const status = getFriendStatus(user.id);
             const isTopCard = index === 0;
             return (
                <motion.div
                key={user.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ 
                    x: lastDirection === 'right' ? 500 : -500, 
                    opacity: 0, 
                    rotate: lastDirection === 'right' ? 20 : -20 
                }}
                transition={{ duration: 0.3 }}
                className={`absolute top-0 left-0 w-full h-full ${isTopCard ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ zIndex: potentialMatches.length - index }}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragSnapToOrigin
                onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 100;
                    if (offset.x > swipeThreshold) {
                        swiped('right', user.id);
                    } else if (offset.x < -swipeThreshold) {
                        swiped('left', user.id);
                    }
                }}
                >
                <GlassCard className="w-full h-full flex flex-col overflow-hidden relative border-opacity-30 border-white">
                    {/* Image Section */}
                    <div className="h-3/5 w-full relative group">
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    {/* Floating Rank Badge with Icon */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md pl-2 pr-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        {RANK_ICONS[user.rank] && (
                            <img src={RANK_ICONS[user.rank]} alt={user.rank} className="w-6 h-6 object-contain" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-white">{user.rank}</span>
                    </div>

                    {/* Add Friend Button on Card */}
                    <div className="absolute bottom-4 right-4 z-20">
                        {status === 'none' && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSendRequest?.(user.uniqueCode);
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
                                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg shadow-blue-500/40 transition-transform active:scale-90 flex items-center gap-2"
                            >
                                <UserPlus size={20} /> <span className="text-xs font-bold">ADD</span>
                            </button>
                        )}
                        {status === 'sent' && (
                            <div className="bg-white/20 backdrop-blur-md text-white/80 p-3 rounded-full flex items-center gap-2 border border-white/10">
                                <Clock size={20} /> <span className="text-xs font-bold">SENT</span>
                            </div>
                        )}
                        {status === 'friend' && (
                            <div className="bg-green-500/80 backdrop-blur-md text-white p-3 rounded-full flex items-center gap-2">
                                <Check size={20} />
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-3xl font-gamer font-bold text-white">{user.username}</h2>
                            <span className="text-sm text-blue-300 font-mono">Lvl {user.level}</span>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap mb-4">
                            {user.games.map(game => (
                                <span key={game} className="text-[10px] uppercase tracking-wide bg-white/10 px-2 py-1 rounded text-gray-300">{game}</span>
                            ))}
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                        {user.bio}
                        </p>
                    </div>
                    </div>
                </GlassCard>
                </motion.div>
            );
          })}
        </AnimatePresence>

        {potentialMatches.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Gamepad size={48} className="text-gray-500 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400">No more gamers nearby</h3>
            <p className="text-sm text-gray-500 mt-2">Check back later or expand your search.</p>
            <GlassButton className="mt-6" onClick={() => setPotentialMatches(initialMatches)} variant="secondary">
                Reset Deck
            </GlassButton>
          </div>
        )}
      </div>

      {potentialMatches.length > 0 && (
        <div className="flex gap-6 mt-8 z-10">
            <button 
                onClick={() => swiped('left', potentialMatches[0].id)}
                className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-lg border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:scale-110 transition-all shadow-lg shadow-red-500/10"
            >
                <X size={32} />
            </button>
            <button 
                onClick={() => swiped('right', potentialMatches[0].id)}
                className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-lg border border-green-500/30 text-green-400 flex items-center justify-center hover:bg-green-500/20 hover:scale-110 transition-all shadow-lg shadow-green-500/10"
            >
                <Heart size={32} fill="currentColor" />
            </button>
        </div>
      )}
    </div>
  );
};
