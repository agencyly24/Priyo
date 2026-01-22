
import React, { useState, useEffect } from 'react';
import { View, GirlfriendProfile, UserProfile, PaymentRequest, Message, ReferralProfile, ReferralTransaction } from './types';
import { PROFILES as INITIAL_PROFILES, APP_CONFIG } from './constants';
import { ProfileCard } from './components/ProfileCard';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { ProfileDetail } from './components/ProfileDetail';
import { AgeVerificationScreen } from './components/AgeVerificationScreen';
import { UserAccount } from './components/UserAccount';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { CreditPurchaseModal } from './components/CreditPurchaseModal';
import { AdminPanel } from './components/AdminPanel';
import { cloudStore } from './services/cloudStore';

const DEFAULT_USER: UserProfile = {
  id: 'guest',
  name: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  bio: 'প্রিয়র সাথে আড্ডা দিতে ভালোবাসি।',
  level: 1, xp: 0, joinedDate: new Date().toLocaleDateString(),
  tier: 'Free', isPremium: false, isVIP: false, isAdmin: false,
  credits: 5, unlockedContentIds: [],
  stats: { messagesSent: 0, hoursChatted: 0, companionsMet: 0 }
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [profiles, setProfiles] = useState<GirlfriendProfile[]>(INITIAL_PROFILES);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [referrals, setReferrals] = useState<ReferralProfile[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<ReferralTransaction[]>([]);
  
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [selectedProfile, setSelectedProfile] = useState<GirlfriendProfile | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasConfirmedAge, setHasConfirmedAge] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
        // 1. Load Profiles (Simulating Cloud Fetch)
        const cloudProfiles = await cloudStore.getProfiles();
        if (cloudProfiles && cloudProfiles.length > 0) setProfiles(cloudProfiles);

        // 2. Load Requests
        const reqs = await cloudStore.getPaymentRequests();
        setPaymentRequests(reqs);

        // 3. Check Session
        const sessionId = cloudStore.getSession();
        if (sessionId) {
            const user = await cloudStore.getUser(sessionId);
            if (user) {
                setUserProfile(user);
                setIsLoggedIn(true);
                // setView('profile-selection'); // Optional: auto-redirect
            }
        }
    };
    initApp();
  }, []);

  // Poll for User Updates (Since Admin panel might update user in CloudStore)
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(async () => {
        const freshUser = await cloudStore.getUser(userProfile.id);
        if (freshUser && (freshUser.credits !== userProfile.credits || freshUser.tier !== userProfile.tier)) {
            setUserProfile(freshUser);
        }
        
        // Also Refresh Requests if Admin
        if (userProfile.isAdmin) {
            const reqs = await cloudStore.getPaymentRequests();
            setPaymentRequests(reqs);
        }
    }, 2000); // Check every 2s
    return () => clearInterval(interval);
  }, [isLoggedIn, userProfile.id, userProfile.credits, userProfile.tier, userProfile.isAdmin]);

  const handleLoginSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setIsLoggedIn(true);
    setView(user.isAdmin ? (hasConfirmedAge ? 'profile-selection' : 'age-verification') : 'age-verification');
  };

  const handleLogout = () => {
    cloudStore.clearSession();
    setIsLoggedIn(false);
    setUserProfile(DEFAULT_USER);
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
    
    const updated = [newRequest, ...paymentRequests];
    setPaymentRequests(updated);
    cloudStore.savePaymentRequests(updated);
  };

  const handleProfileSelect = (profile: GirlfriendProfile) => {
    setSelectedProfile(profile);
    setView('profile-detail');
  };

  const handleUnlockContent = (contentId: string, cost: number): boolean => {
    if (userProfile.credits >= cost) {
      const newCredits = userProfile.credits - cost;
      const newUnlocked = [...userProfile.unlockedContentIds, contentId];
      
      const updatedUser = { ...userProfile, credits: newCredits, unlockedContentIds: newUnlocked };
      setUserProfile(updatedUser);
      cloudStore.updateUser(userProfile.id, { credits: newCredits, unlockedContentIds: newUnlocked });
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 font-['Hind_Siliguri'] overflow-x-hidden relative text-white">
      <Sidebar 
          isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
          currentView={view} setView={setView} userProfile={userProfile}
          setUserProfile={setUserProfile} voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled} onLogout={handleLogout}
      />

      {view === 'landing' && (
          <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h1 className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">প্রিয় (Priyo)</h1>
            <p className="text-xl mb-12">{APP_CONFIG.tagline}</p>
            <button onClick={() => setView(isLoggedIn ? 'profile-selection' : 'auth')} className="bg-pink-600 px-16 py-6 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:scale-105 transition-all">প্রবেশ করুন</button>
          </main>
      )}

      {view === 'auth' && <AuthScreen onLoginSuccess={handleLoginSuccess} onBack={() => setView('landing')} onAdminClick={() => setView('admin-panel')} />}
      {view === 'age-verification' && <AgeVerificationScreen onConfirm={() => { setHasConfirmedAge(true); setView('profile-selection'); }} onBack={() => setView('auth')} />}
      
      {view === 'profile-selection' && (
          <main className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <header className="mb-10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="p-4 glass rounded-2xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
                  <h2 className="text-4xl font-black">সঙ্গী নির্বাচন</h2>
               </div>
               <div className="flex items-center gap-4">
                  <div onClick={() => setShowCreditModal(true)} className="bg-slate-900 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-500/30 cursor-pointer">
                     <span className="text-yellow-500 font-black">{userProfile.credits} C</span>
                  </div>
                  {userProfile.isVIP && <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg font-black text-xs">VIP</span>}
               </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {profiles.map(p => <ProfileCard key={p.id} profile={p} onSelect={handleProfileSelect} />)}
            </div>
          </main>
      )}

      {view === 'profile-detail' && selectedProfile && (
          <ProfileDetail 
            profile={selectedProfile} userProfile={userProfile} onBack={() => setView('profile-selection')}
            onStartChat={() => setView('chat')} onUnlockContent={handleUnlockContent}
            onPurchaseCredits={setShowCreditModal} onShowSubscription={() => setView('subscription')}
          />
      )}

      {view === 'chat' && selectedProfile && (
          <ChatInterface 
            profile={selectedProfile} onBack={() => setView('profile-detail')} onMenuOpen={() => setIsSidebarOpen(true)}
            userName={userProfile.name} isPremium={userProfile.isPremium} userTier={userProfile.tier} onUpgrade={() => setView('subscription')}
            history={chatHistories[selectedProfile.id] || []} onSaveHistory={(msgs) => setChatHistories({...chatHistories, [selectedProfile.id]: msgs})}
          />
      )}

      {view === 'subscription' && <SubscriptionPlans userTier={userProfile.tier} referrals={referrals} onBack={() => setView('profile-selection')} onSubmitPayment={handlePaymentSubmit} pendingRequest={paymentRequests.find(r => r.userId === userProfile.id && r.status === 'pending')} />}
      
      {view === 'admin-panel' && (
          <AdminPanel 
            paymentRequests={paymentRequests} setPaymentRequests={setPaymentRequests} 
            userProfile={userProfile} setUserProfile={setUserProfile} 
            profiles={profiles} setProfiles={setProfiles} 
            referrals={referrals} setReferrals={setReferrals}
            referralTransactions={referralTransactions} setReferralTransactions={setReferralTransactions}
            onBack={() => setView('profile-selection')} 
          />
      )}

      {view === 'account' && (
          <UserAccount 
            userProfile={userProfile} setUserProfile={(u) => { setUserProfile(u); cloudStore.updateUser(u.id, u); }}
            onBack={() => setView('profile-selection')} chatHistories={chatHistories} profiles={profiles}
            onSelectProfile={handleProfileSelect} onPurchaseCredits={() => setShowCreditModal(true)} onLogout={handleLogout}
          />
      )}

      {showCreditModal && <CreditPurchaseModal onClose={() => setShowCreditModal(false)} onSubmit={handlePaymentSubmit} />}
    </div>
  );
};

export default App;
