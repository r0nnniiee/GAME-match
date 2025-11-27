
import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton, GlassSelect } from '../GlassComponents';
import { User, RANKS, GLOBAL_GAMES } from '../../types';
import { RANK_ICONS } from '../../constants';
import { Edit2, Save, Upload, Plus, Camera, Users } from 'lucide-react';

interface ProfileViewProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
    onShowSocial?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onShowSocial }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRankSelector, setShowRankSelector] = useState(false);

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    avatar: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate upload
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    gallery: [reader.result as string, ...prev.gallery]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleGame = (game: string) => {
        if (formData.games.includes(game)) {
            setFormData(prev => ({ ...prev, games: prev.games.filter(g => g !== game) }));
        } else {
            setFormData(prev => ({ ...prev, games: [...prev.games, game] }));
        }
    };

    // Filter games for search
    const filteredGames = GLOBAL_GAMES.filter(g => g.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 relative">
            {/* Rank Selector Modal */}
            {showRankSelector && isEditing && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setShowRankSelector(false)}>
                    <GlassCard className="w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-gamer font-bold mb-4 text-center">Select Competitive Rank</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {RANKS.map(rank => (
                                <button 
                                    key={rank}
                                    onClick={() => {
                                        setFormData({...formData, rank: rank});
                                        setShowRankSelector(false);
                                    }}
                                    className={`flex flex-col items-center p-4 rounded-xl border transition-all ${formData.rank === rank ? 'bg-white/10 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/20'}`}
                                >
                                    <img src={RANK_ICONS[rank]} alt={rank} className="w-16 h-16 object-contain mb-2 drop-shadow-md" />
                                    <span className={`text-sm font-bold uppercase ${formData.rank === rank ? 'text-blue-400' : 'text-gray-400'}`}>{rank}</span>
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-gamer font-bold">My Profile</h1>
                <div className="flex gap-2">
                    {onShowSocial && !isEditing && (
                        <GlassButton onClick={onShowSocial} variant="ghost" className="flex items-center gap-2 py-2 px-4 bg-white/5 border border-white/10">
                            <Users size={16} /> 
                            <span className="hidden sm:inline">Friends</span>
                            {user.incomingRequests.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{user.incomingRequests.length}</span>
                            )}
                        </GlassButton>
                    )}
                    {!isEditing ? (
                        <GlassButton onClick={() => setIsEditing(true)} variant="secondary" className="flex items-center gap-2 py-2 px-4">
                            <Edit2 size={16} /> Edit
                        </GlassButton>
                    ) : (
                        <GlassButton onClick={handleSave} variant="primary" className="flex items-center gap-2 py-2 px-4">
                            <Save size={16} /> Save
                        </GlassButton>
                    )}
                </div>
            </div>

            {/* Header Card with Consolidated Stats */}
            <GlassCard className="p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group shrink-0">
                        <img src={formData.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-xl" />
                        {isEditing && (
                            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border-4 border-white/20">
                                <Camera size={24} className="mb-1 text-white" />
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white">Change</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-1 w-full space-y-4">
                        <div className="text-center md:text-left">
                            {isEditing ? (
                                <GlassInput 
                                    value={formData.username} 
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className="text-center md:text-left text-xl font-bold mb-2"
                                    placeholder="Username"
                                />
                            ) : (
                                <h2 className="text-3xl font-bold">{formData.username}</h2>
                            )}
                            <div className="text-sm font-mono text-blue-400 bg-blue-400/10 inline-block px-3 py-1 rounded-lg mt-2">
                                CODE: {formData.uniqueCode}
                            </div>
                        </div>

                        {/* Consolidated Stats Row */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                             {/* Rank */}
                             <div className={`bg-white/5 border border-white/10 rounded-xl p-3 min-w-[120px] text-center md:text-left backdrop-blur-sm ${isEditing ? 'cursor-pointer hover:bg-white/10' : ''}`} onClick={() => isEditing && setShowRankSelector(true)}>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Rank</label>
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    {RANK_ICONS[formData.rank] && (
                                        <img src={RANK_ICONS[formData.rank]} alt={formData.rank} className="w-8 h-8 object-contain" />
                                    )}
                                    <div className="font-bold text-yellow-400">{formData.rank}</div>
                                </div>
                             </div>

                             {/* Level */}
                             <div className="bg-white/5 border border-white/10 rounded-xl p-3 min-w-[100px] text-center md:text-left backdrop-blur-sm">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Level</label>
                                {isEditing ? (
                                    <input 
                                        type="number" min="1" max="1000"
                                        value={formData.level}
                                        onChange={e => setFormData({...formData, level: parseInt(e.target.value)})}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none text-center"
                                    />
                                ) : (
                                    <div className="font-bold text-blue-400">{formData.level}</div>
                                )}
                             </div>

                             {/* XP */}
                             <div className="bg-white/5 border border-white/10 rounded-xl p-3 min-w-[100px] text-center md:text-left backdrop-blur-sm">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">XP (Yrs)</label>
                                {isEditing ? (
                                    <input 
                                        type="number" min="0" max="50"
                                        value={formData.yearsExperience}
                                        onChange={e => setFormData({...formData, yearsExperience: parseInt(e.target.value)})}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none text-center"
                                    />
                                ) : (
                                    <div className="font-bold text-purple-400">{formData.yearsExperience}</div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Bio Section */}
            <GlassCard className="p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</h3>
                {isEditing ? (
                    <textarea 
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/50 min-h-[100px]"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                ) : (
                    <p className="text-gray-300 leading-relaxed">{formData.bio}</p>
                )}
            </GlassCard>

            {/* Games Section */}
            <GlassCard className="p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Games Played</h3>
                
                {isEditing && (
                    <div className="mb-4">
                        <GlassInput 
                            placeholder="Search games..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-sm py-2"
                        />
                        {searchTerm && (
                            <div className="mt-2 max-h-32 overflow-y-auto bg-black/40 rounded-lg border border-white/10 p-2">
                                {filteredGames.map(game => (
                                    <div 
                                        key={game} 
                                        onClick={() => toggleGame(game)}
                                        className={`p-2 text-sm rounded cursor-pointer hover:bg-white/10 flex justify-between ${formData.games.includes(game) ? 'text-green-400' : 'text-gray-400'}`}
                                    >
                                        {game}
                                        {formData.games.includes(game) && <CheckIcon />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {formData.games.map(game => (
                        <div key={game} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {game}
                            {isEditing && (
                                <button onClick={() => toggleGame(game)} className="hover:text-red-400">
                                    <XIcon size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.games.length === 0 && <span className="text-gray-500 italic">No games selected</span>}
                </div>
            </GlassCard>

            {/* Gallery Section */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Gallery</h3>
                    {isEditing && (
                         <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                            <Plus size={20} />
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} />
                         </label>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.gallery.map((photo, idx) => (
                        <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden relative group">
                            <img src={photo} className="w-full h-full object-cover" />
                            {isEditing && (
                                <button 
                                    onClick={() => setFormData(p => ({...p, gallery: p.gallery.filter((_, i) => i !== idx)}))}
                                    className="absolute top-2 right-2 bg-red-500/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XIcon size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const XIcon = ({size = 24}: {size?: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
