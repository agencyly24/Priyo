
import React, { useState } from 'react';

interface AuthScreenProps {
  onLoginSuccess: (name: string) => void;
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || loading) return;
    
    setLoading(true);
    
    // Immediate save and transition to ensure no browser hangs
    localStorage.setItem('priyo_user_name', trimmedName);
    localStorage.setItem('priyo_is_logged_in', 'true');
    
    // Artificial small delay for premium animation feel
    setTimeout(() => {
      onLoginSuccess(trimmedName);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#0f172a] overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full animate-blob"></div>
      
      <div className="w-full max-w-md glass p-12 rounded-[3.5rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-pink-500/10 mb-8 border border-pink-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">আপনার নাম?</h2>
          <p className="text-gray-400 text-sm font-medium">আড্ডা শুরু করার আগে আপনার নাম বলুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="নাম লিখুন..."
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white text-center text-2xl font-black focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-gray-800"
          />

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="group w-full h-18 py-6 relative overflow-hidden bg-gradient-to-r from-[#ff4d6d] to-[#ff758c] rounded-[1.5rem] font-black text-white text-xl shadow-2xl shadow-pink-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>প্রবেশ করুন</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <button 
          onClick={onBack}
          className="w-full mt-10 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em]"
        >
          ফিরে যান
        </button>
      </div>
    </div>
  );
};
