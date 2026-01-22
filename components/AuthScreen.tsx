
import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email?: string; avatar?: string; uid?: string }) => void;
  onBack: () => void;
  onAdminClick: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onBack, onAdminClick }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      localStorage.setItem('priyo_is_logged_in', 'true');
      if (user.displayName) localStorage.setItem('priyo_user_name', user.displayName);

      onLoginSuccess({
        name: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || '',
        uid: user.uid
      });
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError('Google দিয়ে লগিন করা সম্ভব হয়নি।');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!name) throw new Error("দয়া করে আপনার নাম লিখুন।");
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        
        localStorage.setItem('priyo_is_logged_in', 'true');
        localStorage.setItem('priyo_user_name', name);
        
        onLoginSuccess({
            name: name,
            email: result.user.email || '',
            avatar: result.user.photoURL || '',
            uid: result.user.uid
        });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        localStorage.setItem('priyo_is_logged_in', 'true');
        if (result.user.displayName) localStorage.setItem('priyo_user_name', result.user.displayName);
        
        onLoginSuccess({
            name: result.user.displayName || '',
            email: result.user.email || '',
            avatar: result.user.photoURL || '',
            uid: result.user.uid
        });
      }
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      let msg = "লগিন ব্যর্থ হয়েছে।";
      if (err.code === 'auth/invalid-credential') msg = "ইমেইল বা পাসওয়ার্ড ভুল।";
      else if (err.code === 'auth/email-already-in-use') msg = "এই ইমেইলটি ইতিমধ্যেই ব্যবহার করা হয়েছে।";
      else if (err.code === 'auth/weak-password') msg = "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-tr from-rose-950 via-slate-950 to-purple-950 overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/20 blur-[150px] rounded-full animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full animate-blob animation-delay-2000"></div>
      
      <div className="w-full max-w-md glass p-10 rounded-[3.5rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-500 backdrop-blur-3xl bg-black/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">স্বাগতম!</h2>
          <p className="text-gray-300 text-sm font-medium">
             {isRegistering ? 'নতুন একাউন্ট তৈরি করুন' : 'আড্ডা শুরু করতে লগিন করুন'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-gray-100 text-black rounded-2xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95"
          >
             <svg className="h-5 w-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             <span>Google</span>
          </button>

          <div className="flex items-center gap-4">
             <div className="h-px bg-white/10 flex-1"></div>
             <span className="text-gray-500 text-xs font-bold uppercase">অথবা</span>
             <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <input 
                  type="text" 
                  placeholder="আপনার নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50"
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <input 
                type="email" 
                placeholder="ইমেইল এড্রেস"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50"
                required
              />
            </div>
            <div className="space-y-1">
              <input 
                type="password" 
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-2xl font-black text-white text-base shadow-xl transition-all active:scale-95"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : (isRegistering ? 'সাইন আপ করুন' : 'লগিন করুন')}
            </button>
          </form>
          
          {error && <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
          
          <div className="text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-gray-400 hover:text-white text-xs font-bold transition-colors"
            >
              {isRegistering ? 'একাউন্ট আছে? লগিন করুন' : 'নতুন একাউন্ট খুলুন'}
            </button>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full mt-8 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em]"
        >
          ফিরে যান
        </button>

        {/* Admin Login Trigger */}
        <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <button 
              onClick={onAdminClick} 
              className="text-[10px] text-gray-700 font-bold uppercase tracking-widest hover:text-pink-500 transition-colors"
            >
              Admin Panel Login
            </button>
        </div>
      </div>
    </div>
  );
};
