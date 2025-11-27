import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthView } from './components/views/AuthView';
import { HomeView } from './components/views/HomeView';
import { MessagesView } from './components/views/MessagesView';
import { ProfileView } from './components/views/ProfileView';
import { VoiceView } from './components/views/VoiceView';
import { SquadFinderView } from './components/views/SquadFinderView';
import { SocialHub } from './components/SocialHub';
import { User, ViewState, VoiceChannel } from './types';
import { MOCK_USERS, CURRENT_USER_MOCK, MOCK_VOICE_CHANNELS } from './constants';
import { Home, MessageCircle, User as UserIcon, LogOut, Code, Headset } from 'lucide-react';

// Custom Squad Icon as requested
const SquadIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="7" cy="9" r="2" fill="currentColor" opacity="0.8"/>
        <circle cx="17" cy="9" r="2" fill="currentColor" opacity="0.8"/>
        <circle cx="12" cy="15" r="2" fill="currentColor" opacity="0.9"/>
        <path d="M7 9C7 6.2 9.2 4 12 4C14.8 4 17 6.2 17 9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 15C12 12.2 14.2 10 17 10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 15C12 12.2 9.8 10 7 10" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [showSocialHub, setShowSocialHub] = useState(false);
  
  // Voice Chat State (Lifted for persistence and real-time simulation)
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannel[]>(MOCK_VOICE_CHANNELS);
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null);

  // Initialize with Mock data when login happens
  const handleLogin = (user: User) => {
    // For demo purposes, we'll use the CURRENT_USER_MOCK if it matches, to get pre-filled data
    // In a real app, this comes from backend
    if (user.email === CURRENT_USER_MOCK.email) {
        setCurrentUser({...CURRENT_USER_MOCK});
    } else {
        setCurrentUser({...user, incomingRequests: [], outgoingRequests: []});
    }
    // Also ensure the user is in the allUsers list
    if (!allUsers.find(u => u.id === user.id)) {
        setAllUsers([...allUsers, user]);
    }
    setCurrentView('home');
  };

  const handleLogout = () => {
    // Disconnect from voice if connected
    if (activeVoiceChannelId && currentUser) {
        handleLeaveVoice();
    }
    setCurrentUser(null);
    setCurrentView('auth');
  };

  // --- Voice Chat Logic ---

  const handleJoinVoice = (channelId: string) => {
    if (!currentUser) return;
    
    setVoiceChannels(prev => prev.map(c => {
        if (c.id === channelId) {
            // Prevent duplicate add
            if (c.connectedUserIds.includes(currentUser.id)) return c;
            return { ...c, connectedUserIds: [...c.connectedUserIds, currentUser.id] };
        }
        // Remove from others if necessary (enforce single room)
        if (c.connectedUserIds.includes(currentUser.id)) {
            return { ...c, connectedUserIds: c.connectedUserIds.filter(id => id !== currentUser.id) };
        }
        return c;
    }));
    setActiveVoiceChannelId(channelId);
  };

  const handleLeaveVoice = () => {
    if (!currentUser || !activeVoiceChannelId) return;

    setVoiceChannels(prev => prev.map(c => {
        if (c.id === activeVoiceChannelId) {
            return { ...c, connectedUserIds: c.connectedUserIds.filter(id => id !== currentUser.id) };
        }
        return c;
    }));
    setActiveVoiceChannelId(null);
  };

  const handleCreateVoice = (newChannel: VoiceChannel) => {
      setVoiceChannels(prev => {
          // Remove user from any existing channel first
          const cleaned = prev.map(c => {
              if (c.connectedUserIds.includes(newChannel.connectedUserIds[0])) {
                  return { ...c, connectedUserIds: c.connectedUserIds.filter(id => id !== newChannel.connectedUserIds[0]) };
              }
              return c;
          });
          return [newChannel, ...cleaned];
      });
      setActiveVoiceChannelId(newChannel.id);
  };

  // --- Real-time Simulation Effect ---
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
        setVoiceChannels(prevChannels => {
            const newChannels = [...prevChannels];
            const randomChannelIndex = Math.floor(Math.random() * newChannels.length);
            const channel = newChannels[randomChannelIndex];
            
            // Pick a random mock user (excluding current user)
            const availableUsers = allUsers.filter(u => u.id !== currentUser.id);
            const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            
            if (!randomUser) return prevChannels;

            // Decision: Join or Leave?
            const isUserInChannel = channel.connectedUserIds.includes(randomUser.id);
            
            if (isUserInChannel) {
                // LEAVE logic (30% chance)
                if (Math.random() > 0.7) {
                    newChannels[randomChannelIndex] = {
                        ...channel,
                        connectedUserIds: channel.connectedUserIds.filter(id => id !== randomUser.id)
                    };
                }
            } else {
                // JOIN logic (if not full)
                if (channel.connectedUserIds.length < channel.maxUsers && Math.random() > 0.6) {
                    // Remove random user from any other channel first to avoid duplicates
                    newChannels.forEach((c, idx) => {
                        if (c.connectedUserIds.includes(randomUser.id)) {
                            newChannels[idx] = {
                                ...c,
                                connectedUserIds: c.connectedUserIds.filter(id => id !== randomUser.id)
                            };
                        }
                    });

                    // Add to this channel
                    newChannels[randomChannelIndex] = {
                        ...channel,
                        connectedUserIds: [...channel.connectedUserIds, randomUser.id]
                    };
                }
            }
            return newChannels;
        });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser, allUsers]);


  // --- Friend Request Logic ---

  const handleSendRequest = (code: string) => {
    if (!currentUser) return;
    const targetUser = allUsers.find(u => u.uniqueCode === code);

    if (!targetUser) {
        alert("User not found.");
        return;
    }
    if (targetUser.id === currentUser.id) {
        alert("You cannot add yourself.");
        return;
    }
    if (currentUser.friends.includes(targetUser.id)) {
        alert("You are already friends.");
        return;
    }
    if (currentUser.outgoingRequests.includes(targetUser.id)) {
        alert("Request already sent.");
        return;
    }
    if (currentUser.incomingRequests.includes(targetUser.id)) {
        alert("This user has already sent you a request! Check your inbox.");
        return;
    }

    // Update State
    const updatedCurrentUser = {
        ...currentUser,
        outgoingRequests: [...currentUser.outgoingRequests, targetUser.id]
    };
    
    const updatedTargetUser = {
        ...targetUser,
        incomingRequests: [...targetUser.incomingRequests, currentUser.id]
    };

    updateUserStates(updatedCurrentUser, updatedTargetUser);
    alert(`Request sent to ${targetUser.username}!`);
  };

  const handleAcceptRequest = (requesterId: string) => {
    if (!currentUser) return;
    const requester = allUsers.find(u => u.id === requesterId);
    if (!requester) return;

    const updatedCurrentUser = {
        ...currentUser,
        friends: [...currentUser.friends, requesterId],
        incomingRequests: currentUser.incomingRequests.filter(id => id !== requesterId)
    };

    const updatedRequester = {
        ...requester,
        friends: [...requester.friends, currentUser.id],
        outgoingRequests: requester.outgoingRequests.filter(id => id !== currentUser.id)
    };

    updateUserStates(updatedCurrentUser, updatedRequester);
  };

  const handleDeclineRequest = (requesterId: string) => {
    if (!currentUser) return;
    const requester = allUsers.find(u => u.id === requesterId);
    if (!requester) return;

    const updatedCurrentUser = {
        ...currentUser,
        incomingRequests: currentUser.incomingRequests.filter(id => id !== requesterId)
    };
    
    // In real app, we might not remove outgoing from requester immediately or handle it differently
    const updatedRequester = {
        ...requester,
        outgoingRequests: requester.outgoingRequests.filter(id => id !== currentUser.id)
    };

    updateUserStates(updatedCurrentUser, updatedRequester);
  };

  const handleCancelRequest = (targetId: string) => {
    if (!currentUser) return;
    const target = allUsers.find(u => u.id === targetId);
    if (!target) return;

    const updatedCurrentUser = {
        ...currentUser,
        outgoingRequests: currentUser.outgoingRequests.filter(id => id !== targetId)
    };

    const updatedTarget = {
        ...target,
        incomingRequests: target.incomingRequests.filter(id => id !== currentUser.id)
    };

    updateUserStates(updatedCurrentUser, updatedTarget);
  };

  const updateUserStates = (u1: User, u2: User) => {
    setCurrentUser(u1);
    setAllUsers(prev => prev.map(u => {
        if (u.id === u1.id) return u1;
        if (u.id === u2.id) return u2;
        return u;
    }));
  };

  // ---------------------------

  if (currentView === 'auth') {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <div className="relative z-10 flex flex-col-reverse md:flex-row w-full h-full max-w-7xl mx-auto md:p-8">
            
            {/* Navigation Bar */}
            <nav className="md:w-24 w-full md:h-full h-20 bg-black/40 backdrop-blur-xl border-t md:border border-white/10 md:rounded-2xl flex md:flex-col justify-evenly items-center py-4 md:py-8 shrink-0 z-50">
                {/* 1. Home */}
                <button 
                    onClick={() => setCurrentView('home')}
                    className={`p-3 rounded-xl transition-all ${currentView === 'home' ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Home size={28} />
                </button>

                {/* 2. Squad Finder */}
                <button 
                    onClick={() => setCurrentView('squad')}
                    className={`p-3 rounded-xl transition-all relative ${currentView === 'squad' ? 'bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <SquadIcon size={28} />
                </button>

                {/* 3. Messages (Includes Voice Access) */}
                <button 
                    onClick={() => setCurrentView('messages')}
                    className={`p-3 rounded-xl transition-all relative ${currentView === 'messages' || currentView === 'voice' ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <MessageCircle size={28} />
                    {/* Active Voice Indicator */}
                    {activeVoiceChannelId && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                    )}
                </button>

                {/* 4. Profile (Includes Social Hub Access) */}
                <button 
                    onClick={() => setCurrentView('profile')}
                    className={`p-3 rounded-xl transition-all relative ${currentView === 'profile' ? 'bg-pink-500/20 text-pink-400 shadow-lg shadow-pink-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <UserIcon size={28} />
                    {/* Friend Request Indicator */}
                    {currentUser && currentUser.incomingRequests.length > 0 && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-black animate-pulse"></div>
                    )}
                </button>

                {/* Desktop Logout */}
                <button 
                    onClick={handleLogout}
                    className="hidden md:block p-3 rounded-xl text-red-400 hover:bg-red-500/10 mt-auto"
                >
                    <LogOut size={28} />
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-6 h-full overflow-hidden bg-black/30 backdrop-blur-md md:rounded-2xl border border-white/10 shadow-2xl relative">
                {currentView === 'home' && currentUser && (
                    <HomeView 
                        currentUser={currentUser} 
                        allUsers={allUsers}
                        onSendRequest={(code) => handleSendRequest(code)}
                    />
                )}
                {currentView === 'messages' && currentUser && (
                    <MessagesView 
                        currentUser={currentUser} 
                        allUsers={allUsers}
                        onSendRequest={(code) => handleSendRequest(code)}
                        onNavigate={setCurrentView}
                    />
                )}
                {currentView === 'voice' && currentUser && (
                    <VoiceView 
                        currentUser={currentUser} 
                        allUsers={allUsers}
                        channels={voiceChannels}
                        activeChannelId={activeVoiceChannelId}
                        onJoin={handleJoinVoice}
                        onLeave={handleLeaveVoice}
                        onCreate={handleCreateVoice}
                    />
                )}
                {currentView === 'squad' && currentUser && (
                    <SquadFinderView 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onSendRequest={(code) => handleSendRequest(code)}
                    />
                )}
                {currentView === 'profile' && currentUser && (
                    <ProfileView 
                        user={currentUser} 
                        onUpdate={(u) => {
                            setCurrentUser(u);
                            setAllUsers(prev => prev.map(user => user.id === u.id ? u : user));
                        }} 
                        onShowSocial={() => setShowSocialHub(true)}
                    />
                )}
            </main>

        </div>

        {/* Social Hub Modal */}
        {showSocialHub && currentUser && (
            <SocialHub 
                currentUser={currentUser}
                allUsers={allUsers}
                onSendRequest={handleSendRequest}
                onAcceptRequest={handleAcceptRequest}
                onDeclineRequest={handleDeclineRequest}
                onCancelRequest={handleCancelRequest}
                onClose={() => setShowSocialHub(false)}
            />
        )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);