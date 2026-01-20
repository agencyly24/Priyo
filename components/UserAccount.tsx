
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserAccountProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sawyer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Boots',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pumpkin',
];

export const UserAccount: React.FC<UserAccountProps> = ({ userProfile, setUserProfile, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userProfile.name);
  const [editedBio, setEditedBio] = useState(userProfile.bio);

  const handleSave = () => {
    setUserProfile({
      ...userProfile,
      name: editedName,
      bio: editedBio
    });
    setIsEditing(false);
  };

  const handleAvatarSelect = (url: string) => {
    setUserProfile({ ...userProfile, avatar: url });
  };

  const StatItem = ({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-all cursor-default shadow-lg">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-black ${colorClass} tracking-tighter`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 animate-in fade-in duration-700 relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/5 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-gradient">My Account</h1>
          <div className="w-12"></div> {/* Spacer for symmetry */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Header Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass p-8 rounded-[3rem] border-white/10 flex flex-col items-center text-center relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-600 to-rose-500"></div>
              
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 p-1.5 shadow-[0_0_30px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform duration-500">
                  <img src={userProfile.avatar} className="w-full h-full rounded-full bg-slate-900" alt="Avatar" />
                </div>
                <div className="absolute bottom-2 right-2 h-10 w-10 bg-pink-600 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-lg">
                   <span className="text-xs font-black">Lv {userProfile.level}</span>
                </div>
              </div>

              <h2 className="text-3xl font-black mb-2">{userProfile.name}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 italic opacity-75">"{userProfile.bio}"</p>
              
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                 <div className="bg-gradient-to-r from-pink-600 to-rose-500 h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
              </div>
              <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">
                 <span>XP: {userProfile.xp} / 1000</span>
                 <span>Level Progress</span>
              </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 px-2">Account Details</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500 text-sm font-bold">Joined</span>
                    <span className="text-white text-sm font-black">{userProfile.joinedDate}</span>
                 </div>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500 text-sm font-bold">Status</span>
                    <span className="text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-md">Premium Member</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Stats & Settings */}
          <div className="lg:col-span-2 space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <StatItem label="Total Messages" value={userProfile.stats.messagesSent} colorClass="text-pink-500" />
              <StatItem label="Hours Active" value={userProfile.stats.hoursChatted} colorClass="text-blue-500" />
              <StatItem label="Companions" value={userProfile.stats.companionsMet} colorClass="text-purple-500" />
            </div>

            {/* Profile Editing Section */}
            <div className="glass p-10 rounded-[3rem] border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Profile Settings</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-pink-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-600/30 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nickname</label>
                    <input 
                      type="text" 
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bio</label>
                    <textarea 
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Change Avatar</label>
                    <div className="flex flex-wrap gap-4">
                      {AVATARS.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleAvatarSelect(url)}
                          className={`w-14 h-14 rounded-full p-1 transition-all ${userProfile.avatar === url ? 'bg-pink-600 scale-110 shadow-lg' : 'bg-white/5 hover:bg-white/10 grayscale hover:grayscale-0'}`}
                        >
                          <img src={url} className="w-full h-full rounded-full bg-slate-900" alt="Avatar option" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Loyalty Badge</span>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                       <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.945 1.183a1 1 0 01.63 1.216l-1.147 4.588a1 1 0 01-.86.756l-3.568.446V14a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.488l-3.568-.446a1 1 0 01-.86-.756L1.425 6.722a1 1 0 01.63-1.216L6 4.323V3a1 1 0 011-1h3z" clipRule="evenodd" />
                          </svg>
                       </div>
                       <span className="font-black text-sm text-yellow-500">Early Supporter</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Account Level</span>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                       <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                       </div>
                       <span className="font-black text-sm text-blue-400">Verified User</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Achievements placeholder */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white px-2">Achievements</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="flex-shrink-0 w-24 h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Locked achievement">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
