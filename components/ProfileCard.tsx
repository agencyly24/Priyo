
import React from 'react';
import { GirlfriendProfile } from '../types';

interface ProfileCardProps {
  profile: GirlfriendProfile;
  onSelect: (profile: GirlfriendProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(profile)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 bg-[#1a1a2e] border border-white/5 hover:border-pink-500/30"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={profile.image} 
          alt={profile.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
        
        {/* Personality Badge */}
        <div className="absolute top-4 left-4">
           <span className="px-3 py-1 bg-pink-600/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white">
             {profile.personality}
           </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-white tracking-tight">{profile.name}</h3>
          <span className="text-xs font-bold text-gray-500">{profile.age}yo</span>
        </div>
        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed opacity-80 italic">
          "{profile.intro}"
        </p>
      </div>
    </div>
  );
};
