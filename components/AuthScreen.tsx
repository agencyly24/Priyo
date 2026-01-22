
import React, { useState } from 'react';
import { cloudStore } from '../services/cloudStore';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBack: () => void;
  onAdminClick: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onBack, onAdminClick }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Network Delay
    setTimeout(async () => {
        try {
            // "Google Cloud" Simulation
            const userId = btoa(email); // Generate a consistent ID based on email
            
            let user = await cloudStore.getUser(userId);

            if (isRegistering) {
                if (user) {
                    setError("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে।");
                    setLoading(false);
                    return;
                }
                
                // Create New User
                const newUser: UserProfile = {
                    id: userId,
                    name: name,
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name,
                    bio: 'প্রিয়র সাথে আড্ডা দিতে ভালোবাসি।',
                    level: 1,
                    xp: 0,
                    joinedDate: new Date().toLocaleDateString(),
                    tier: 'Free',
                    isPremium: false,
                    isVIP: false,
                    isAdmin: email === 'admin@priyo.com', // Auto Admin for specific email
                    credits: 5,
                    unlockedContentIds: [],
                    stats: { messagesSent: 0, hoursChatted: 0, companionsMet: 0 }
                };

                await cloudStore.createUser(newUser);
                cloudStore.setSession(newUser.id);
                onLoginSuccess(newUser);
            } else {
                // Login
                if (!user) {
                    // For demo purpose, if user not found but valid email, create a temp one or show error
                    // To follow instructions "purchase korle connected hobe", we need valid users.
                    // If Admin Login
                    if (email === 'admin@priyo.com' && password === '123456') {
                         const adminUser: UserProfile = {
                            id: 'admin_master',
                            name: 'Super Admin',
                            avatar: '', bio: '', level: 99, xp: 9999, joinedDate: '',
                            tier: 'VIP', isPremium: true, isVIP: true, isAdmin: true,
                            credits: 99999, unlockedContentIds: [], stats: { messagesSent: 0, hoursChatted: 0, companionsMet: 0 }
                         };
                         cloudStore.setSession(adminUser.id);
                         onLoginSuccess(adminUser);
                         return;
                    }

                    setError("অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে সাইন আপ করুন।");
                    setLoading(false);
                    return;
                }
                
                cloudStore.setSession(user.id);
                onLoginSuccess(user);
            }
        } catch (err) {
            setError("Authentication Failed");
        } finally {
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-tr from-rose-950 via-slate-950 to-purple-950 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/20 blur-[150px] rounded-full animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full animate-blob animation-delay-2000"></div>
      
      <div className="w-full max-w-md glass p-10 rounded-[3.5rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-500 backdrop-blur-3xl bg-black/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">স্বাগতম!</h2>
          <p className="text-gray-300 text-sm font-medium">
             {isRegistering ? 'নতুন একাউন্ট তৈরি করুন' : 'আড্ডা শুরু করতে লগিন করুন'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <input type="text" placeholder="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-pink-500/50" required />
            )}
            <input type="email" placeholder="ইমেইল এড্রেস" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-pink-500/50" required />
            <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-pink-500/50" required />

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-2xl font-black text-white text-base shadow-xl transition-all active:scale-95">
              {loading ? 'অপেক্ষা করুন...' : (isRegistering ? 'সাইন আপ করুন' : 'লগিন করুন')}
            </button>
        </form>
          
        {error && <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg mt-4">{error}</p>}
          
        <div className="text-center mt-4">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-gray-400 hover:text-white text-xs font-bold transition-colors">
              {isRegistering ? 'একাউন্ট আছে? লগিন করুন' : 'নতুন একাউন্ট খুলুন'}
            </button>
        </div>

        <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <button onClick={onAdminClick} className="text-[10px] text-gray-700 font-bold uppercase tracking-widest hover:text-pink-500 transition-colors">
              Admin Panel Login
            </button>
        </div>
      </div>
    </div>
  );
};
