
import React, { useState, useEffect } from 'react';
import { View, GirlfriendProfile, UserProfile, PaymentRequest, Message } from './types';
import { PROFILES as INITIAL_PROFILES, APP_CONFIG } from './constants';
import { ProfileCard } from './components/ProfileCard';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { ProfileDetail } from './components/ProfileDetail';
import { AgeVerificationScreen } from './components/AgeVerificationScreen';
import { UserAccount } from './components/UserAccount';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AdminPanel } from './components/AdminPanel';

const DEFAULT_USER: UserProfile = {
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  name: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  bio: 'প্রিয়র সাথে আড্ডা দিতে ভালোবাসি।',
  level: 1,
  xp: 0,
  joinedDate: new Date().toLocaleDateString(),
  tier: 'Free',
  isPremium: false,
  isAdmin: true, // For development access
  stats: {
    messagesSent: 0,
    hoursChatted: 0,
    companionsMet: 0
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
    const savedView = localStorage.getItem('priyo_current_view');
    return (savedView as View) || 'landing';
  });
  
  const [profiles, setProfiles] = useState<GirlfriendProfile[]>(() => {
    const savedProfiles = localStorage.getItem('priyo_dynamic_profiles');
    return savedProfiles ? JSON.parse(savedProfiles) : INITIAL_PROFILES;
  });

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('priyo_chat_histories');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedProfile, setSelectedProfile] = useState<GirlfriendProfile | null>(() => {
    const savedId = localStorage.getItem('priyo_selected_profile_id');
    return profiles.find(p => p.id === savedId) || null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('priyo_is_logged_in') === 'true');
  const [hasConfirmedAge, setHasConfirmedAge] = useState(() => localStorage.getItem('priyo_age_confirmed') === 'true');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('priyo_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('priyo_payment_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('priyo_voice_enabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('priyo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('priyo_chat_histories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem('priyo_payment_requests', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  useEffect(() => {
    localStorage.setItem('priyo_dynamic_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('priyo_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('priyo_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('priyo_age_confirmed', String(hasConfirmedAge));
  }, [hasConfirmedAge]);

  useEffect(() => {
    localStorage.setItem('priyo_current_view', view);
  }, [view]);

  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('priyo_selected_profile_id', selectedProfile.id);
    } else {
      localStorage.removeItem('priyo_selected_profile_id');
    }
  }, [selectedProfile]);

  const handleStartClick = () => {
    if (!isLoggedIn) {
      setView('auth');
    } else if (!hasConfirmedAge) {
      setView('age-verification');
    } else {
      setView('profile-selection');
    }
  };

  const handleLoginSuccess = (name: string) => {
    setUserProfile(prev => ({ ...prev, name }));
    setIsLoggedIn(true);
    if (!hasConfirmedAge) {
      setView('age-verification');
    } else {
      setView('profile-selection');
    }
  };

  const handleAgeConfirm = () => {
    setHasConfirmedAge(true);
    setView('profile-selection');
  };

  const handleProfileSelect = (profile: GirlfriendProfile) => {
    setSelectedProfile(profile);
    setView('profile-detail');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setHasConfirmedAge(false);
    setUserProfile(DEFAULT_USER);
    setSelectedProfile(null);
    setProfiles(INITIAL_PROFILES);
    setChatHistories({});
    setView('landing');
  };

  const handlePaymentSubmit = (request: Omit<PaymentRequest, 'id' | 'status' | 'timestamp' | 'userId' | 'userName'>) => {
    const newRequest: PaymentRequest = {
      ...request,
      id: 'REQ_' + Math.random().toString(36).substr(2, 9),
      userId: userProfile.id,
      userName: userProfile.name,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };
    setPaymentRequests([newRequest, ...paymentRequests]);
  };

  const updateChatHistory = (profileId: string, messages: Message[]) => {
    setChatHistories(prev => ({
      ...prev,
      [profileId]: messages
    }));
    // Update user stats
    setUserProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        messagesSent: prev.stats.messagesSent + 1
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-pink-500/30 font-['Hind_Siliguri'] overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentView={view}
        setView={setView}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onLogout={handleLogout}
      />

      {view === 'landing' && (
        <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-block px-6 py-2 mb-8 glass rounded-full border border-white/10 shadow-2xl">
              <span className="text-pink-500 text-xs font-black uppercase tracking-[0.4em]">Premium AI Companion</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter">
              <span className="text-gradient">প্রিয় (Priyo)</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium mb-12 leading-relaxed max-w-2xl mx-auto opacity-80">
              {APP_CONFIG.tagline}
            </p>
            <button 
              onClick={handleStartClick}
              className="group relative bg-gradient-to-r from-[#ff4d6d] to-[#ff758c] text-white px-16 py-7 rounded-[2.5rem] text-2xl font-black shadow-[0_20px_50px_rgba(255,77,109,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              প্রবেশ করুন
              <div className="absolute inset-0 rounded-[2.5rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
            </button>
          </div>
        </main>
      )}

      {view === 'auth' && (
        <AuthScreen onLoginSuccess={handleLoginSuccess} onBack={() => setView('landing')} />
      )}

      {view === 'age-verification' && (
        <AgeVerificationScreen onConfirm={handleAgeConfirm} onBack={() => setView('auth')} />
      )}

      {view === 'profile-selection' && (
        <main className="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-700 min-h-screen">
          <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="p-4 glass rounded-[1.5rem] text-white hover:bg-white/10 transition-all active:scale-90 border border-white/5 shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">আপনার সঙ্গী</h2>
                <p className="text-gray-400 font-medium">কাকে আপনার মন ভালো করার দায়িত্ব দিবেন?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('subscription')}
                className={`glass px-6 py-3 rounded-2xl border-yellow-500/20 hidden md:flex items-center gap-2 group hover:bg-yellow-500/10 transition-all ${userProfile.isPremium ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span className="font-black text-sm uppercase tracking-widest">{userProfile.tier === 'Free' ? 'Upgrade' : userProfile.tier}</span>
              </button>
              {userProfile.name && (
                <div onClick={() => setView('account')} className="glass px-6 py-3 rounded-2xl border-pink-500/20 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all">
                    <img src={userProfile.avatar} className="w-8 h-8 rounded-full border border-pink-500/30" alt="Avatar" />
                    <span className="text-pink-400 font-black text-sm uppercase tracking-widest">{userProfile.name}</span>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} />
            ))}
          </div>
        </main>
      )}

      {view === 'subscription' && (
        <SubscriptionPlans 
          userTier={userProfile.tier} 
          onBack={() => setView('profile-selection')} 
          onSubmitPayment={handlePaymentSubmit}
          pendingRequest={paymentRequests.find(r => r.userId === userProfile.id && r.status === 'pending')}
        />
      )}

      {view === 'admin-panel' && userProfile.isAdmin && (
        <AdminPanel 
          paymentRequests={paymentRequests}
          setPaymentRequests={setPaymentRequests}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          profiles={profiles}
          setProfiles={setProfiles}
          onBack={() => setView('profile-selection')}
        />
      )}

      {view === 'profile-detail' && selectedProfile && (
        <ProfileDetail 
          profile={selectedProfile}
          onBack={() => setView('profile-selection')}
          onStartChat={() => setView('chat')}
        />
      )}

      {view === 'account' && (
        <UserAccount userProfile={userProfile} setUserProfile={setUserProfile} onBack={() => setView('profile-selection')} />
      )}

      {view === 'chat' && selectedProfile && (
        <div className="animate-in slide-in-from-right duration-500">
          <ChatInterface 
            profile={selectedProfile} 
            onBack={() => setView('profile-detail')}
            onMenuOpen={() => setIsSidebarOpen(true)}
            userName={userProfile.name}
            isPremium={userProfile.tier === 'Diamond'}
            onUpgrade={() => setView('subscription')}
            history={chatHistories[selectedProfile.id] || []}
            onSaveHistory={(msgs) => updateChatHistory(selectedProfile.id, msgs)}
          />
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
};

export default App;
