
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../GlassComponents';
import { User, VoiceChannel, GLOBAL_GAMES } from '../../types';
import { Mic, MicOff, Headphones, LogOut, Plus, Users, Lock, Unlock, UserPlus } from 'lucide-react';

interface VoiceViewProps {
    currentUser: User;
    allUsers: User[];
    channels: VoiceChannel[];
    activeChannelId: string | null;
    onJoin: (channelId: string) => void;
    onLeave: () => void;
    onCreate: (channel: VoiceChannel) => void;
}

export const VoiceView: React.FC<VoiceViewProps> = ({ 
    currentUser, 
    allUsers, 
    channels, 
    activeChannelId, 
    onJoin, 
    onLeave, 
    onCreate 
}) => {
    // Local UI State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all');
    
    // Controls State
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);

    // Create Form State
    const [newHubName, setNewHubName] = useState('');
    const [newHubGame, setNewHubGame] = useState(GLOBAL_GAMES[0]);
    const [newHubPublic, setNewHubPublic] = useState(true);

    // Audio Context for FX
    const playSound = (type: 'connect' | 'disconnect' | 'error' | 'click') => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'connect') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
            } else if (type === 'disconnect') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
            } else if (type === 'error') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
            } else {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            }
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) { console.error(e); }
    };

    // Actions
    const handleJoinClick = (channel: VoiceChannel) => {
        if (channel.connectedUserIds.length >= 6) {
            playSound('error');
            alert("Voice hub is full. Maximum 6 players allowed.");
            return;
        }
        playSound('connect');
        onJoin(channel.id);
    };

    const handleLeaveClick = () => {
        playSound('disconnect');
        onLeave();
    };

    const handleCreateSubmit = () => {
        if (!newHubName.trim()) {
            alert("Please enter a hub name");
            return;
        }

        // Create new hub with current user ALREADY connected
        const newHub: VoiceChannel = {
            id: `vc_${Date.now()}`,
            name: newHubName,
            creator: currentUser.username,
            game: newHubGame,
            connectedUserIds: [currentUser.id], // Connect immediately
            maxUsers: 6,
            isPublic: newHubPublic
        };

        playSound('connect');
        onCreate(newHub);
        setShowCreateModal(false);
        
        // Reset form
        setNewHubName('');
        setNewHubPublic(true);
    };

    const filteredChannels = channels.filter(channel => {
        if (activeTab === 'public') return channel.isPublic;
        if (activeTab === 'private') return !channel.isPublic;
        return true;
    });

    // Determine view mode based on active connection
    const activeChannel = activeChannelId ? channels.find(c => c.id === activeChannelId) : null;
    const viewMode = activeChannel ? 'room' : 'lobby';

    // --- LOBBY VIEW ---
    if (viewMode === 'lobby') {
        return (
            <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
                    <div>
                        <h1 className="text-3xl font-gamer font-bold text-white flex items-center gap-3">
                            <Headphones className="text-blue-400" size={32} />
                            Voice Chat Hubs
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Join a squad or start your own.</p>
                    </div>
                    <GlassButton 
                        onClick={() => setShowCreateModal(true)} 
                        variant="primary" 
                        className="flex items-center gap-2 self-end md:self-auto"
                    >
                        <Plus size={20} /> Create Hub
                    </GlassButton>
                </div>

                {/* Tabbed Interface */}
                <div className="flex gap-6 mb-4 border-b border-white/10">
                    {(['all', 'public', 'private'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 text-sm font-bold uppercase tracking-wider transition-all relative ${
                                activeTab === tab 
                                ? 'text-blue-400' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Hub List */}
                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                    {filteredChannels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500 opacity-60">
                            <Headphones size={48} className="mb-2" />
                            <p>No active voice hubs found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredChannels.map(channel => {
                                const isFull = channel.connectedUserIds.length >= 6;
                                return (
                                    <GlassCard key={channel.id} className={`p-5 flex flex-col justify-between h-48 transition-all hover:bg-white/5 border-white/5 ${isFull ? 'opacity-70' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg leading-tight truncate pr-2 text-white">{channel.name}</h3>
                                                {channel.isPublic ? (
                                                    <div className="bg-green-500/10 p-1.5 rounded-lg border border-green-500/20">
                                                        <Unlock size={14} className="text-green-400 shrink-0" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                                                        <Lock size={14} className="text-red-400 shrink-0" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider font-bold bg-blue-500/10 inline-block px-2 py-0.5 rounded">{channel.game}</p>
                                            <p className="text-xs text-gray-400 mt-2">Host: <span className="text-gray-300">{channel.creator}</span></p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className={`flex items-center gap-2 font-mono font-bold ${isFull ? 'text-red-400' : 'text-gray-300'}`}>
                                                <Users size={16} />
                                                <span>{channel.connectedUserIds.length} / 6</span>
                                            </div>
                                            
                                            <GlassButton 
                                                onClick={() => handleJoinClick(channel)} 
                                                disabled={isFull}
                                                variant={isFull ? 'ghost' : 'secondary'}
                                                className={`text-sm px-4 py-2 ${isFull ? 'bg-transparent border-red-500/30 text-red-500' : 'hover:border-blue-400/50'}`}
                                            >
                                                {isFull ? 'FULL' : 'JOIN'}
                                            </GlassButton>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <GlassCard className="w-full max-w-md p-6 border-blue-500/20 shadow-blue-500/10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-gamer">Create Voice Hub</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-transform hover:rotate-90"><Plus className="rotate-45" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hub Name</label>
                                    <GlassInput 
                                        placeholder="e.g. Ranked Grind to Diamond"
                                        value={newHubName}
                                        onChange={(e) => setNewHubName(e.target.value)}
                                        maxLength={25}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Game</label>
                                    <GlassSelect value={newHubGame} onChange={(e) => setNewHubGame(e.target.value)}>
                                        {GLOBAL_GAMES.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
                                    </GlassSelect>
                                </div>

                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                    <span className="text-sm font-bold text-gray-300">Max Participants</span>
                                    <span className="font-mono font-bold text-blue-400">6 (Fixed)</span>
                                </div>

                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setNewHubPublic(!newHubPublic)}>
                                    <span className="text-sm font-bold text-gray-300">Visibility</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs uppercase font-bold ${newHubPublic ? 'text-green-400' : 'text-red-400'}`}>
                                            {newHubPublic ? 'Public' : 'Private'}
                                        </span>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${newHubPublic ? 'bg-green-500/20' : 'bg-red-500/20'} border border-white/10`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${newHubPublic ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <GlassButton onClick={handleCreateSubmit} className="w-full mt-4 py-3" variant="primary">
                                    Create & Join Hub
                                </GlassButton>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        );
    }

    // --- ROOM VIEW ---
    if (activeChannel) {
        // Construct the 6 slots
        const slots = Array(6).fill(null).map((_, i) => {
            const userId = activeChannel.connectedUserIds[i];
            if (!userId) return null;
            // Find full user object
            if (userId === currentUser.id) return currentUser;
            return allUsers.find(u => u.id === userId) || { 
                id: userId, 
                username: 'Unknown', 
                avatar: 'https://picsum.photos/200', 
                level: 0 
            };
        });

        return (
            <div className="h-full flex flex-col relative overflow-hidden bg-black/40">
                {/* Room Header */}
                <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 flex justify-between items-center z-10 shadow-lg">
                    <div>
                        <h2 className="font-gamer font-bold text-2xl leading-none text-white tracking-wide">{activeChannel.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-blue-300 font-mono mt-2">
                            <span className="bg-blue-500/10 px-2 py-0.5 rounded">{activeChannel.game}</span>
                            <span className="text-gray-500">•</span>
                            <span className="flex items-center gap-1 text-gray-300"><Users size={12} /> {activeChannel.connectedUserIds.length} / 6</span>
                        </div>
                    </div>
                    <GlassButton 
                        onClick={handleLeaveClick} 
                        variant="danger" 
                        className="px-4 py-2 text-sm flex items-center gap-2"
                    >
                        <LogOut size={16} /> Leave
                    </GlassButton>
                </div>

                {/* 6-Grid Layout */}
                <div className="flex-1 p-4 flex items-center justify-center overflow-y-auto">
                    <GlassCard className="w-full max-w-4xl p-6 bg-white/5 border-white/10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr h-full max-h-[500px]">
                            {slots.map((user, index) => (
                                <div 
                                    key={index} 
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[140px] ${user ? 'bg-white/10 border-blue-500/30 shadow-lg shadow-blue-500/10' : 'bg-black/20 border-white/5 border-dashed hover:border-white/10'}`}
                                >
                                    {user ? (
                                        <>
                                            {/* Avatar with Sound Wave Simulation */}
                                            <div className="relative mb-4">
                                                {/* Pulse Effect for Speaker */}
                                                <div className="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-20 animate-pulse duration-1000"></div>
                                                <img src={user.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/20 relative z-10 shadow-xl" />
                                                <div className="absolute bottom-0 right-0 z-20 bg-gray-900 rounded-full p-1.5 border border-white/10 shadow-lg">
                                                    {user.id === currentUser.id && isMuted ? 
                                                        <MicOff size={12} className="text-red-500" /> : 
                                                        <Mic size={12} className="text-green-500" />
                                                    }
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-white text-base truncate w-full text-center mb-1">{user.username}</h3>
                                            <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded">Lvl {user.level}</span>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-30 group">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <UserPlus size={20} className="text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Empty</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Bottom Controls */}
                <div className="p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 flex justify-center items-center gap-8 z-20">
                    <button 
                        onClick={() => { playSound('click'); setIsMuted(!isMuted); }}
                        className={`p-4 rounded-full border-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${isMuted ? 'bg-red-500 text-white border-red-500 shadow-red-500/20' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button 
                        onClick={handleLeaveClick}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold tracking-wider shadow-lg shadow-red-600/30 transition-transform active:scale-95 border border-red-400/20"
                    >
                        DISCONNECT
                    </button>

                    <button 
                        onClick={() => { playSound('click'); setIsDeafened(!isDeafened); }}
                        className={`p-4 rounded-full border-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${isDeafened ? 'bg-red-500 text-white border-red-500 shadow-red-500/20' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    >
                        {isDeafened ? <MicOff size={24} /> : <Headphones size={24} />}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
