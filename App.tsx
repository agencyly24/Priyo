
import React, { useState, useEffect } from 'react';
import { View, GirlfriendProfile } from './types';
import { PROFILES, APP_CONFIG } from './constants';
import { ProfileCard } from './components/ProfileCard';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [selectedProfile, setSelectedProfile] = useState<GirlfriendProfile | null>(null);
  const [hasConfirmedAge, setHasConfirmedAge] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('priyo_is_logged_in') === 'true');
  
  // Global Settings
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem('priyo_user_name') || '');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('priyo_voice_enabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('priyo_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('priyo_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('priyo_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  const handleStartClick = () => {
    if (!isLoggedIn) {
      setView('auth');
    } else {
      checkAgeAndProceed();
    }
  };

  const checkAgeAndProceed = () => {
    if (!hasConfirmedAge) {
      const confirmed = window.confirm("এই অ্যাপটি ১৮+ ইউজারদের জন্য। আপনি কি ১৮ বছরের বেশি বয়সী?");
      if (confirmed) {
        setHasConfirmedAge(true);
        setView('profile-selection');
      }
    } else {
      setView('profile-selection');
    }
  };

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    checkAgeAndProceed();
  };

  const handleProfileSelect = (profile: GirlfriendProfile) => {
    setSelectedProfile(profile);
    setView('chat');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasConfirmedAge(false);
    setView('landing');
    localStorage.removeItem('priyo_is_logged_in');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-pink-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentView={view}
        setView={setView}
        userName={userName}
        setUserName={setUserName}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onLogout={handleLogout}
      />

      {view === 'landing' && (
        <main className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>

          <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter">
              <span className="text-gradient">প্রিয় (Priyo)</span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 font-medium mb-12 leading-relaxed max-w-2xl mx-auto opacity-80">
              {APP_CONFIG.tagline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={handleStartClick}
                className="group relative bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white px-12 py-6 rounded-full text-2xl font-black shadow-2xl shadow-pink-500/40 transition-all hover:scale-105 active:scale-95"
              >
                কথা বলা শুরু করো
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'auth' && (
        <AuthScreen 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setView('landing')} 
        />
      )}

      {view === 'profile-selection' && (
        <main className="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
          <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="p-4 glass rounded-2xl text-white hover:bg-white/10 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2">আপনার সঙ্গী</h2>
                <p className="text-gray-400 font-medium">কাকে আপনার মন ভালো করার দায়িত্ব দিবেন?</p>
              </div>
            </div>
            {userName && (
              <div className="glass px-6 py-3 rounded-2xl border-pink-500/20">
                <span className="text-pink-400 text-sm font-bold tracking-widest uppercase">স্বাগতম, {userName}</span>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {PROFILES.map(profile => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                onSelect={handleProfileSelect} 
              />
            ))}
          </div>
        </main>
      )}

      {view === 'chat' && selectedProfile && (
        <div className="animate-in slide-in-from-right duration-500">
          <ChatInterface 
            profile={selectedProfile} 
            onBack={() => setView('profile-selection')}
            onMenuOpen={() => setIsSidebarOpen(true)}
            userName={userName}
          />
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-1] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
};

export default App;
