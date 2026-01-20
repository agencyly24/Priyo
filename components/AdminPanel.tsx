
import React, { useState, useMemo } from 'react';
import { PaymentRequest, UserProfile, SubscriptionTier } from '../types';

interface AdminPanelProps {
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ paymentRequests, setPaymentRequests, userProfile, setUserProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'stats' | 'users'>('payments');
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const stats = useMemo(() => {
    const totalRevenue = paymentRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    const pending = paymentRequests.filter(r => r.status === 'pending').length;
    const approvedCount = paymentRequests.filter(r => r.status === 'approved').length;
    return { totalRevenue, pending, totalRequests: paymentRequests.length, approvedCount };
  }, [paymentRequests]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Mishela') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasscode('');
    }
  };

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    const updated = paymentRequests.map(r => {
      if (r.id === id) {
        if (action === 'approved' && r.userId === userProfile.id) {
           setUserProfile(prev => ({ ...prev, tier: r.tier, isPremium: true }));
        }
        return { ...r, status: action };
      }
      return r;
    });
    setPaymentRequests(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent)] opacity-50 pointer-events-none"></div>
        <div className="max-w-md w-full glass p-12 rounded-[3.5rem] border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500 text-center">
          <div className="inline-flex p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">Admin Access</h2>
          <p className="text-gray-500 text-sm mb-10 font-medium">Enter the secure passcode to continue</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode"
                className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-center text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${loginError ? 'border-red-500 animate-shake' : 'border-white/10'}`}
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase mt-2">Invalid Passcode</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all"
            >
              Unlock Terminal
            </button>
          </form>
          <button onClick={onBack} className="mt-8 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Return to App</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Priyo HQ</h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Intelligence & Revenue Terminal</p>
              </div>
           </div>

           <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
             {(['payments', 'stats', 'users'] as const).map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
               >
                 {tab === 'payments' ? 'Verification' : tab === 'stats' ? 'Analytics' : 'Users'}
               </button>
             ))}
           </div>
        </header>

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Gross Revenue</p>
                 <h3 className="text-5xl font-black text-gradient">৳{stats.totalRevenue}</h3>
                 <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-black">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" /></svg>
                    <span>+18.4%</span>
                 </div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Waitlist</p>
                 <h3 className="text-5xl font-black text-yellow-500">{stats.pending}</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Action Required</p>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Approved</p>
                 <h3 className="text-5xl font-black text-green-500">{stats.approvedCount}</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Active Subscriptions</p>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Conversion</p>
                 <h3 className="text-5xl font-black text-blue-500">{stats.totalRequests > 0 ? ((stats.approvedCount / stats.totalRequests) * 100).toFixed(1) : 0}%</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Approval Rate</p>
              </div>
            </div>

            <div className="glass p-10 rounded-[3rem] border-white/10 h-64 flex flex-col items-center justify-center">
               <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Revenue Chart (Simulated)</p>
               <div className="flex items-end gap-2 h-32 mt-6">
                 {[40, 60, 45, 80, 55, 90, 100].map((h, i) => (
                   <div key={i} className="w-8 bg-blue-600/20 hover:bg-blue-600 rounded-t-lg transition-all cursor-help" style={{ height: `${h}%` }}></div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="glass rounded-[3rem] border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">User / Identity</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Package</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">bKash Intel</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {paymentRequests.length === 0 ? (
                        <tr><td colSpan={5} className="p-20 text-center text-gray-600 font-black uppercase tracking-widest">No transaction records found</td></tr>
                      ) : (
                        paymentRequests.map(req => (
                          <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                             <td className="p-8">
                                <span className="font-black text-white block text-lg">{req.userName}</span>
                                <span className="text-[10px] text-gray-600 font-mono tracking-tighter">UID: {req.userId}</span>
                             </td>
                             <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.tier === 'Diamond' ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-yellow-500/10 border-yellow-500 text-yellow-500'}`}>{req.tier}</span>
                             </td>
                             <td className="p-8">
                                <div className="space-y-1.5">
                                   <div className="flex items-center gap-2">
                                      <span className="p-1 bg-[#e2136e] rounded text-[8px] font-black text-white">bK</span>
                                      <span className="text-sm font-black text-white">{req.bkashNumber}</span>
                                   </div>
                                   <p className="text-[10px] text-gray-500 font-black">TrxID: <span className="text-blue-400 font-mono uppercase">{req.trxId}</span></p>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${req.status === 'approved' ? 'text-green-500' : req.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                   {req.status === 'pending' && <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>}
                                   {req.status}
                                </span>
                             </td>
                             <td className="p-8 text-right">
                                {req.status === 'pending' ? (
                                  <div className="flex gap-3 justify-end">
                                     <button onClick={() => handleAction(req.id, 'approved')} className="h-12 w-12 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-90">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                     </button>
                                     <button onClick={() => handleAction(req.id, 'rejected')} className="h-12 w-12 flex items-center justify-center bg-red-600 hover:bg-red-500 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-90">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                  </div>
                                ) : (
                                  <div className="text-gray-700 text-[10px] font-black uppercase tracking-widest flex flex-col items-end">
                                     <span>Verified</span>
                                     <span className="opacity-50 text-[8px]">{req.timestamp}</span>
                                  </div>
                                )}
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
           <div className="p-32 text-center glass rounded-[4rem] border-white/10 animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4">User Matrix</h3>
              <p className="text-gray-500 max-w-md mx-auto font-medium">User monitoring and behavioral analysis tools are coming in the next terminal update.</p>
              <button className="mt-10 px-8 py-3 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-500">Check for Updates</button>
           </div>
        )}
      </div>
    </div>
  );
};
