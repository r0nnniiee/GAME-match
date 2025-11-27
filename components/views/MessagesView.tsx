
import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton } from '../GlassComponents';
import { User, Message, ViewState } from '../../types';
import { MOCK_MESSAGES } from '../../constants';
import { Search, MoreVertical, Send, Shield, AlertTriangle, FileText, ChevronLeft, CheckCircle, Plus, UserPlus, Headset } from 'lucide-react';

interface MessagesViewProps {
    currentUser: User;
    allUsers?: User[];
    onSendRequest?: (code: string) => void;
    onNavigate?: (view: ViewState) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUser, allUsers = [], onSendRequest, onNavigate }) => {
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [searchCode, setSearchCode] = useState('');
    const [contractModal, setContractModal] = useState(false);
    const [searchResult, setSearchResult] = useState<User | null>(null);

    // Get list of friends
    const friends = allUsers.filter(u => currentUser.friends.includes(u.id));
    const selectedFriend = allUsers.find(u => u.id === selectedFriendId);

    const handleSendMessage = (type: 'text' | 'contract' = 'text', contractData?: any) => {
        if (!selectedFriendId) return;
        if (type === 'text' && !inputText.trim()) return;

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            receiverId: selectedFriendId,
            text: type === 'contract' ? 'Contract Offer' : inputText,
            timestamp: Date.now(),
            type: type,
            contractDetails: contractData
        };

        setMessages(prev => ({
            ...prev,
            [selectedFriendId]: [...(prev[selectedFriendId] || []), newMessage]
        }));
        setInputText('');
        setContractModal(false);
    };

    const handleSearchByCode = () => {
        const found = allUsers.find(u => u.uniqueCode === searchCode.toUpperCase());
        if (found) {
            setSearchResult(found);
        } else {
            alert('User not found with that code.');
            setSearchResult(null);
        }
    };

    const handleAddSearchResult = () => {
        if (searchResult && onSendRequest) {
            onSendRequest(searchResult.uniqueCode);
            setSearchResult(null);
            setSearchCode('');
        }
    };

    // Sub-component: Chat List
    if (!selectedFriendId) {
        return (
            <div className="h-full flex flex-col p-4 max-w-2xl mx-auto w-full relative">
                {/* Voice Hub Navigation Button */}
                <div className="mb-4">
                    <button 
                        onClick={() => onNavigate?.('voice')}
                        className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
                                <Headset size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white">Voice Hubs</h3>
                                <p className="text-xs text-gray-400">Join public rooms & hang out</p>
                            </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                            <ChevronLeft size={20} className="rotate-180" />
                        </div>
                    </button>
                </div>

                <div className="mb-6 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <GlassInput 
                            placeholder="Search friends or enter unique code..." 
                            className="pl-10"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                        />
                    </div>
                    <GlassButton onClick={handleSearchByCode} variant="secondary" className="px-4">
                        <Search size={20} />
                    </GlassButton>
                </div>

                {/* Search Result Overlay */}
                {searchResult && (
                    <div className="mb-6 bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={searchResult.avatar} className="w-10 h-10 rounded-full" />
                            <div>
                                <h4 className="font-bold text-white">{searchResult.username}</h4>
                                <p className="text-xs text-blue-300">{searchResult.uniqueCode}</p>
                            </div>
                        </div>
                        <GlassButton 
                            onClick={handleAddSearchResult} 
                            className="py-1 px-3 text-sm flex items-center gap-2"
                        >
                            <UserPlus size={16} /> Add
                        </GlassButton>
                        <button onClick={() => setSearchResult(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                            <Plus className="rotate-45" size={16} />
                        </button>
                    </div>
                )}

                <div className="space-y-3 overflow-y-auto pb-20">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Chats</h3>
                    {friends.map(friend => {
                        const lastMsg = messages[friend.id]?.[messages[friend.id]?.length - 1];
                        return (
                            <GlassCard 
                                key={friend.id} 
                                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setSelectedFriendId(friend.id)}
                            >
                                <img src={friend.avatar} alt={friend.username} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-white">{friend.username}</h4>
                                        <span className="text-xs text-gray-500">
                                            {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                        {lastMsg ? (lastMsg.type === 'contract' ? '📜 Contract Offer' : lastMsg.text) : 'Start chatting...'}
                                    </p>
                                </div>
                            </GlassCard>
                        );
                    })}
                    {friends.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            No active chats. Add friends using their code!
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Sub-component: Active Chat
    return (
        <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedFriendId(null)} className="p-2 hover:bg-white/10 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={() => setShowProfileModal(true)}
                    >
                        <img src={selectedFriend?.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                        <div>
                            <h3 className="font-bold leading-tight">{selectedFriend?.username}</h3>
                            <span className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full">
                        <MoreVertical size={20} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                            <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 flex items-center gap-2">
                                <AlertTriangle size={16} /> Report
                            </button>
                            <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 flex items-center gap-2">
                                <Shield size={16} /> Block
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages[selectedFriendId!]?.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'contract' ? (
                                <div className={`max-w-[80%] p-4 rounded-2xl border ${isMe ? 'bg-blue-600/20 border-blue-500/50' : 'bg-purple-600/20 border-purple-500/50'}`}>
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                        <FileText size={18} />
                                        <span className="font-bold uppercase tracking-wider text-xs">Contract Offer</span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{msg.contractDetails?.title}</h4>
                                    <div className="text-xs opacity-70 mb-3">Status: {msg.contractDetails?.status}</div>
                                    <div className="flex gap-2">
                                        <GlassButton variant="secondary" className="py-1 px-3 text-xs w-full">View Details</GlassButton>
                                    </div>
                                </div>
                            ) : (
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 backdrop-blur-md text-gray-100 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md flex gap-2">
                <button 
                    onClick={() => setContractModal(true)}
                    className="p-3 bg-purple-500/20 border border-purple-500/50 rounded-xl text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                    <FileText size={20} />
                </button>
                <GlassInput 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <GlassButton onClick={() => handleSendMessage()} variant="primary" className="px-4">
                    <Send size={20} />
                </GlassButton>
            </div>

            {/* Friend Profile Modal */}
            {showProfileModal && selectedFriend && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <GlassCard className="w-full max-w-sm relative overflow-hidden">
                        <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full z-10">
                            <XCircleIcon />
                        </button>
                        <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-600 relative">
                             <img src={selectedFriend.avatar} className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-gray-900" />
                        </div>
                        <div className="pt-12 px-6 pb-6">
                            <h2 className="text-2xl font-bold">{selectedFriend.username}</h2>
                            <p className="text-gray-400 text-sm mb-4">{selectedFriend.bio}</p>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-xs text-gray-400 uppercase">Rank</div>
                                    <div className="font-bold text-yellow-400">{selectedFriend.rank}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-xs text-gray-400 uppercase">Level</div>
                                    <div className="font-bold text-blue-400">{selectedFriend.level}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-xs text-gray-400 uppercase">Experience</div>
                                    <div className="font-bold text-purple-400">{selectedFriend.yearsExperience} Years</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-xs text-gray-400 uppercase">Code</div>
                                    <div className="font-bold text-white font-mono">{selectedFriend.uniqueCode}</div>
                                </div>
                            </div>
                            
                            <GlassButton variant="secondary" className="w-full" onClick={() => setShowProfileModal(false)}>Close</GlassButton>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Contract Modal */}
            {contractModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
                    <GlassCard className="w-full max-w-sm p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="text-purple-400" /> Send Contract
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">Propose a formal agreement to {selectedFriend?.username}.</p>
                        
                        <div className="space-y-3 mb-6">
                            <button 
                                onClick={() => handleSendMessage('contract', { title: 'Ranked Duo Partner', status: 'pending' })}
                                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between group"
                            >
                                <span className="font-bold">Ranked Duo</span>
                                <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button 
                                onClick={() => handleSendMessage('contract', { title: 'Clan Recruitment', status: 'pending' })}
                                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between group"
                            >
                                <span className="font-bold">Clan Recruitment</span>
                                <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button 
                                onClick={() => handleSendMessage('contract', { title: 'Item Trading', status: 'pending' })}
                                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex items-center justify-between group"
                            >
                                <span className="font-bold">Item Trade</span>
                                <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                        <GlassButton variant="ghost" className="w-full text-red-300" onClick={() => setContractModal(false)}>Cancel</GlassButton>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
