
import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton } from './GlassComponents';
import { User } from '../types';
import { UserPlus, Search, Check, X, Clock, AlertTriangle } from 'lucide-react';

interface SocialHubProps {
  currentUser: User;
  allUsers: User[];
  onSendRequest: (code: string) => void;
  onAcceptRequest: (userId: string) => void;
  onDeclineRequest: (userId: string) => void;
  onCancelRequest: (userId: string) => void;
  onClose: () => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({
  currentUser,
  allUsers,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'requests'>('requests');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Derived lists
  const incomingRequests = allUsers.filter(u => currentUser.incomingRequests.includes(u.id));
  const outgoingRequests = allUsers.filter(u => currentUser.outgoingRequests.includes(u.id));

  const handleSend = () => {
    onSendRequest(friendCodeInput);
    setFriendCodeInput('');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Confirmation Modal */}
      {confirmCancelId && (
        <div className="absolute inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm p-6 text-center shadow-2xl bg-black/80 border-red-500/30">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                        <AlertTriangle size={32} />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Cancel Request?</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to cancel the friend request sent to this user?</p>
                <div className="flex gap-4">
                    <GlassButton 
                        variant="secondary" 
                        onClick={() => setConfirmCancelId(null)} 
                        className="flex-1"
                    >
                        No, Keep
                    </GlassButton>
                    <GlassButton 
                        variant="danger" 
                        onClick={() => {
                            onCancelRequest(confirmCancelId);
                            setConfirmCancelId(null);
                        }} 
                        className="flex-1"
                    >
                        Yes, Cancel
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
      )}

      <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            className={`flex-1 py-4 font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'requests' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({incomingRequests.length})
          </button>
          <button 
            className={`flex-1 py-4 font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'add' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('add')}
          >
            Add Friend
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'add' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                <UserPlus size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Add via Unique Code</h3>
              <p className="text-sm text-gray-400 mb-6">Enter your friend's 6-character unique code to connect.</p>
              
              <div className="max-w-xs mx-auto space-y-4">
                <GlassInput 
                  placeholder="e.g. K9X2L1"
                  className="text-center text-lg uppercase tracking-widest"
                  maxLength={6}
                  value={friendCodeInput}
                  onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                />
                <GlassButton 
                  onClick={handleSend} 
                  variant="primary" 
                  className="w-full"
                  disabled={friendCodeInput.length < 6}
                >
                  Send Request
                </GlassButton>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-500 mb-2">Your Unique Code</p>
                <div className="font-mono text-2xl font-bold text-white tracking-widest select-all">
                  {currentUser.uniqueCode}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Incoming */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Incoming <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{incomingRequests.length}</span>
                </h4>
                {incomingRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm italic py-2">No pending requests.</p>
                ) : (
                    <div className="space-y-3">
                    {incomingRequests.map(user => (
                        <div key={user.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                            <h5 className="font-bold text-sm">{user.username}</h5>
                            <p className="text-xs text-blue-300">{user.rank}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onDeclineRequest(user.id)}
                                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <button 
                                onClick={() => onAcceptRequest(user.id)}
                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
              </div>

              {/* Outgoing */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Sent <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px]">{outgoingRequests.length}</span>
                </h4>
                {outgoingRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm italic py-2">No sent requests.</p>
                ) : (
                    <div className="space-y-3">
                    {outgoingRequests.map(user => (
                        <div key={user.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 opacity-80">
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover grayscale" />
                        <div className="flex-1">
                            <h5 className="font-bold text-sm">{user.username}</h5>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> Pending
                            </p>
                        </div>
                        <button 
                            onClick={() => setConfirmCancelId(user.id)}
                            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <GlassButton onClick={onClose} variant="secondary" className="w-full py-3">
            Close
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
