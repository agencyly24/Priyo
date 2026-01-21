
import React, { useState, useMemo, useRef } from 'react';
import { PaymentRequest, UserProfile, SubscriptionTier, GirlfriendProfile, PersonalityType, ProfileGalleryItem } from '../types';

interface AdminPanelProps {
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  profiles: GirlfriendProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<GirlfriendProfile[]>>;
  onBack: () => void;
}

const EMPTY_PROFILE: GirlfriendProfile = {
  id: '',
  name: '',
  age: 20,
  personality: PersonalityType.Sweet,
  image: '',
  voiceName: 'Kore',
  intro: '',
  systemPrompt: '',
  appearance: {
    ethnicity: 'বাঙালি (Bengali)',
    eyeColor: 'কালো (Black)',
    bodyType: 'ছিপছিপে (Slim)',
    breastSize: 'মাঝারি (Medium)',
    hairStyle: 'লম্বা চুল (Long)',
    hairColor: 'কালো (Black)',
    outfit: 'শাড়ি (Saree)'
  },
  character: {
    relationship: 'গার্লফ্রেন্ড',
    occupation: 'ছাত্রী',
    kinks: []
  },
  gallery: []
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  paymentRequests, setPaymentRequests, 
  userProfile, setUserProfile, 
  profiles, setProfiles,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'companions' | 'stats'>('payments');
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  // Companion Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GirlfriendProfile>(EMPTY_PROFILE);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [galleryTypeInput, setGalleryTypeInput] = useState<'image' | 'video'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const totalRevenue = paymentRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    const pending = paymentRequests.filter(r => r.status === 'pending').length;
    const approvedCount = paymentRequests.filter(r => r.status === 'approved').length;
    return { totalRevenue, pending, totalRequests: paymentRequests.length, approvedCount, totalProfiles: profiles.length };
  }, [paymentRequests, profiles]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'primary' | 'gallery') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'primary') {
          setEditingProfile(prev => ({ ...prev, image: base64String }));
        } else {
          setGalleryUrlInput(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentAction = (id: string, action: 'approved' | 'rejected') => {
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

  const handleAddProfile = () => {
    setEditingProfile({ ...EMPTY_PROFILE, id: 'profile_' + Date.now() });
    setIsEditing(true);
  };

  const handleEditProfile = (profile: GirlfriendProfile) => {
    setEditingProfile(profile);
    setIsEditing(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই প্রোফাইলটি ডিলিট করতে চান?')) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = profiles.some(p => p.id === editingProfile.id);
    if (exists) {
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? editingProfile : p));
    } else {
      setProfiles(prev => [...prev, editingProfile]);
    }
    setIsEditing(false);
    setEditingProfile(EMPTY_PROFILE);
  };

  const addGalleryItem = () => {
    if (!galleryUrlInput) return;
    const newItem: ProfileGalleryItem = { type: galleryTypeInput, url: galleryUrlInput };
    setEditingProfile(prev => ({
      ...prev,
      gallery: [...prev.gallery, newItem]
    }));
    setGalleryUrlInput('');
  };

  const removeGalleryItem = (index: number) => {
    setEditingProfile(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
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
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Mishela Terminal</h2>
          <p className="text-gray-500 text-sm mb-10 font-medium">Restricted Access • Admin Credentials Required</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Admin Passcode"
                className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-center text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${loginError ? 'border-red-500 animate-shake' : 'border-white/10'}`}
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase mt-2">Access Denied • Security Alert</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            >
              Authorize Access
            </button>
          </form>
          <button onClick={onBack} className="mt-8 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Return to Safe Mode</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Priyo HQ Terminal</h1>
                <p className="text-blue-500 text-xs font-black uppercase tracking-[0.4em]">Control Everything • {userProfile.name}</p>
              </div>
           </div>

           <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md overflow-x-auto scrollbar-hide">
             {(['payments', 'companions', 'stats'] as const).map(tab => (
               <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setIsEditing(false); }}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
               >
                 {tab === 'payments' ? 'Revenue & verification' : tab === 'companions' ? 'Companion Matrix' : 'Analytics Hub'}
               </button>
             ))}
           </div>
        </header>

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Total Revenue</p>
                 <h3 className="text-5xl font-black text-gradient">৳{stats.totalRevenue}</h3>
                 <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-black">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" /></svg>
                    <span>+12.5% Growth</span>
                 </div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Active Profiles</p>
                 <h3 className="text-5xl font-black text-blue-500">{stats.totalProfiles}</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Dynamic AI Engines</p>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Premium Subs</p>
                 <h3 className="text-5xl font-black text-green-500">{stats.approvedCount}</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Verified Players</p>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10">
                 <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Pending Tasks</p>
                 <h3 className="text-5xl font-black text-yellow-500">{stats.pending}</h3>
                 <p className="mt-4 text-[10px] font-black text-gray-600">Requires Attention</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companions' && !isEditing && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                 <div>
                    <h3 className="text-2xl font-black">Companion Management</h3>
                    <p className="text-gray-500 text-xs">Create or Modify AI Personalities</p>
                 </div>
                 <button 
                  onClick={handleAddProfile}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Add New Companion
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {profiles.map(p => (
                    <div key={p.id} className="glass p-8 rounded-[3rem] border-white/10 group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 flex gap-2">
                          <button onClick={() => handleEditProfile(p)} className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteProfile(p.id)} className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                       <div className="flex gap-6 items-center mb-6">
                          <img src={p.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" alt={p.name} />
                          <div>
                             <h4 className="text-xl font-black">{p.name}</h4>
                             <p className="text-xs text-blue-500 font-black uppercase tracking-widest">{p.personality}</p>
                          </div>
                       </div>
                       <p className="text-xs text-gray-400 line-clamp-2 italic mb-6">"{p.intro}"</p>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span>গ্যালারি: {p.gallery.length} টি</span>
                          <span className="bg-white/5 px-3 py-1 rounded-md">{p.voiceName} Voice</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {isEditing && (
           <div className="animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
              <form onSubmit={handleSaveProfile} className="space-y-10 pb-20">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-3xl font-black tracking-tighter">Companion Data Edit</h3>
                    <div className="flex gap-4">
                       <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 glass rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white">Cancel</button>
                       <button type="submit" className="px-12 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-600/20">Sync Profile</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="glass p-10 rounded-[3rem] border-white/10 space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Identity Matrix</h4>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">সঙ্গীর নাম ও মুড (Ex: Riya - Girlfriend)</label>
                          <input required type="text" value={editingProfile.name} onChange={e => setEditingProfile({...editingProfile, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black" placeholder="Ex: আয়েশা (Ayesha)" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">বয়স</label>
                             <input required type="number" value={editingProfile.age} onChange={e => setEditingProfile({...editingProfile, age: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">পার্সোনালিটি / মুড</label>
                             <select value={editingProfile.personality} onChange={e => setEditingProfile({...editingProfile, personality: e.target.value as PersonalityType})} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 font-black text-xs">
                                {Object.values(PersonalityType).map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                             </select>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">প্রাইমারি ডিসপ্লে ইমেজ (Primary Image)</label>
                          <div className="flex gap-4">
                             <div className="h-24 w-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                {editingProfile.image ? (
                                   <img src={editingProfile.image} className="h-full w-full object-cover" alt="Preview" />
                                ) : (
                                   <div className="h-full w-full flex items-center justify-center text-gray-700">
                                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   </div>
                                )}
                             </div>
                             <div className="flex-1 space-y-3">
                                <input 
                                   type="file" 
                                   accept="image/*"
                                   ref={fileInputRef}
                                   onChange={(e) => handleImageUpload(e, 'primary')}
                                   className="hidden" 
                                />
                                <button 
                                   type="button"
                                   onClick={() => fileInputRef.current?.click()}
                                   className="w-full py-3 bg-blue-600/20 border border-blue-500/30 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                >
                                   Upload Image
                                </button>
                                <input 
                                   type="text" 
                                   value={editingProfile.image.startsWith('data:') ? 'Local Image Uploaded' : editingProfile.image} 
                                   onChange={e => setEditingProfile({...editingProfile, image: e.target.value})} 
                                   placeholder="Or enter Image URL..."
                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-medium" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Personality & AI Logic */}
                    <div className="glass p-10 rounded-[3rem] border-white/10 space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-4">AI Personality Kernel</h4>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">ইন্ট্রো মেসেজ (Bangla)</label>
                          <textarea required value={editingProfile.intro} onChange={e => setEditingProfile({...editingProfile, intro: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs h-24 resize-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">সিস্টেম ইন্সট্রাকশন (Master Prompt)</label>
                          <textarea required value={editingProfile.systemPrompt} onChange={e => setEditingProfile({...editingProfile, systemPrompt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs h-32 resize-none font-mono" />
                       </div>
                       <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">ভয়েস ইঞ্জিন</label>
                             <select value={editingProfile.voiceName} onChange={e => setEditingProfile({...editingProfile, voiceName: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 font-black">
                                <option value="Kore">Kore (Soft)</option>
                                <option value="Puck">Puck (Bold)</option>
                                <option value="Zephyr">Zephyr (Playful)</option>
                                <option value="Charon">Charon (Deep)</option>
                             </select>
                          </div>
                    </div>

                    {/* Appearance Details (BD Focused) */}
                    <div className="glass p-10 rounded-[3rem] border-white/10 col-span-1 md:col-span-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-8 text-center">Physical Attributes Protocol (শারীরিক গঠন ও প্রোফাইল)</h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">জাতীয়তা/মূল</label>
                             <input type="text" placeholder="বাঙালি/বিদেশি" value={editingProfile.appearance.ethnicity} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, ethnicity: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">চোখের রঙ</label>
                             <input type="text" placeholder="কালো/বাদামী" value={editingProfile.appearance.eyeColor} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, eyeColor: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">শারীরিক গঠন</label>
                             <input type="text" placeholder="ছিপছিপে/আকর্ষণীয়" value={editingProfile.appearance.bodyType} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, bodyType: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">ফিগার ডিটেইলস</label>
                             <input type="text" placeholder="Medium/Curvy" value={editingProfile.appearance.breastSize} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, breastSize: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">চুলের স্টাইল</label>
                             <input type="text" placeholder="লম্বা/বেণী" value={editingProfile.appearance.hairStyle} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, hairStyle: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">চুলের রঙ</label>
                             <input type="text" placeholder="কালো/রঙিন" value={editingProfile.appearance.hairColor} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, hairColor: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">পোশাক</label>
                             <input type="text" placeholder="শাড়ি/কামিয/ওয়েস্টার্ন" value={editingProfile.appearance.outfit} onChange={e => setEditingProfile({...editingProfile, appearance: {...editingProfile.appearance, outfit: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">সম্পর্ক</label>
                             <input type="text" value={editingProfile.character.relationship} onChange={e => setEditingProfile({...editingProfile, character: {...editingProfile.character, relationship: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black" />
                          </div>
                       </div>
                    </div>

                    {/* Gallery Hub */}
                    <div className="glass p-10 rounded-[3rem] border-white/10 col-span-1 md:col-span-2 space-y-8">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-4">Multimedia Archive (গ্যালারি ম্যানেজমেন্ট)</h4>
                       
                       <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="w-full md:w-32 space-y-2">
                             <label className="text-[10px] font-black text-gray-500 uppercase">Type</label>
                             <select value={galleryTypeInput} onChange={e => setGalleryTypeInput(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-black outline-none">
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                             </select>
                          </div>
                          <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black text-gray-500 uppercase">Media Source (Upload or URL)</label>
                             <div className="flex gap-2">
                                <input type="text" value={galleryUrlInput.startsWith('data:') ? 'Image selected for upload' : galleryUrlInput} onChange={e => setGalleryUrlInput(e.target.value)} placeholder="Media URL বা আপলোড করুন..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium" />
                                <input type="file" ref={galleryFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} />
                                <button type="button" onClick={() => galleryFileInputRef.current?.click()} className="px-6 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/20 transition-all">Upload</button>
                             </div>
                          </div>
                          <button type="button" onClick={addGalleryItem} className="h-[58px] px-8 bg-purple-600 hover:bg-purple-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Add Media</button>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {editingProfile.gallery.map((item, idx) => (
                             <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
                                {item.type === 'image' ? (
                                   <img src={item.url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                   <div className="w-full h-full bg-black flex items-center justify-center">
                                      <svg className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                   </div>
                                )}
                                <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                   <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                             </div>
                          ))}
                          {editingProfile.gallery.length === 0 && (
                             <div className="col-span-full py-10 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-gray-700 font-black uppercase tracking-widest text-[10px]">No gallery media added</div>
                          )}
                       </div>
                    </div>
                 </div>
              </form>
           </div>
        )}

        {activeTab === 'payments' && !isEditing && (
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
                                     <button onClick={() => handlePaymentAction(req.id, 'approved')} className="h-12 w-12 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-90">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                     </button>
                                     <button onClick={() => handlePaymentAction(req.id, 'rejected')} className="h-12 w-12 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-90">
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
      </div>
    </div>
  );
};
