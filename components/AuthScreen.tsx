
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
    if (!name.trim()) return;
    setLoading(true);
    
    // Simulate a premium "connection" animation
    setTimeout(() => {
      onLoginSuccess(name.trim());
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#0f172a] overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-pink-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
      
      <div className="w-full max-w-md glass p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-pink-500/10 mb-6 border border-pink-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">আপনার নাম?</h2>
          <p className="text-gray-400 text-sm">আপনাকে কী নামে ডাকবো?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input 
              type="text" 
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full h-16 relative overflow-hidden bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl font-black text-white shadow-xl shadow-pink-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>প্রবেশ করুন</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>

        <button 
          onClick={onBack}
          className="w-full mt-6 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          ফিরে যান
        </button>
      </div>
    </div>
  );
};
