
import React, { useState, useMemo } from 'react';
import { GirlfriendProfile, ProfileGalleryItem } from '../types';

interface ProfileDetailProps {
  profile: GirlfriendProfile;
  onBack: () => void;
  onStartChat: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onBack, onStartChat }) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'character' | 'gallery'>('appearance');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<ProfileGalleryItem | null>(null);

  const allMedia: ProfileGalleryItem[] = useMemo(() => {
    const mainImg: ProfileGalleryItem = { type: 'image', url: profile.image };
    return [mainImg, ...profile.gallery];
  }, [profile]);

  const currentMedia = allMedia[currentMediaIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const AttributeCard = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-1 hover:bg-white/10 transition-colors group">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-pink-500 transition-colors">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <span className="text-pink-500">{icon}</span>}
        <span className="text-base font-black text-white">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 animate-in fade-in duration-500 relative">
      {/* Lightbox Modal */}
      {selectedLightboxMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300"
          onClick={() => setSelectedLightboxMedia(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {selectedLightboxMedia.type === 'image' ? (
              <img src={selectedLightboxMedia.url} className="max-h-full max-w-full rounded-3xl shadow-2xl border border-white/10 object-contain" alt="Gallery" />
            ) : (
              <video src={selectedLightboxMedia.url} controls autoPlay className="max-h-full max-w-full rounded-3xl shadow-2xl border border-white/10" />
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left: Portrait Carousel */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          <button 
            onClick={onBack}
            className="self-start p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/5 mb-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 aspect-[3.5/5] bg-black">
              <div className="w-full h-full animate-in fade-in duration-700" key={currentMediaIndex}>
                {currentMedia.type === 'image' ? (
                  <img src={currentMedia.url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <video src={currentMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button onClick={handlePrev} className="p-4 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 pointer-events-auto hover:bg-pink-600/60 transition-all active:scale-90 shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNext} className="p-4 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 pointer-events-auto hover:bg-pink-600/60 transition-all active:scale-90 shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {allMedia.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentMediaIndex ? 'w-8 bg-pink-500' : 'w-2 bg-white/30'}`} />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full lg:w-7/12 flex flex-col py-4">
          <div className="mb-10">
            <div className="flex items-end justify-between mb-4">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">{profile.name}</h1>
              <span className="text-4xl font-black text-pink-500 opacity-50">{profile.age}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                <span className="text-xs font-black text-pink-500 uppercase tracking-widest">{profile.character.relationship}</span>
              </div>
              <p className="text-gray-400 font-medium italic">"{profile.intro}"</p>
            </div>
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-3xl p-1.5 mb-10 overflow-x-auto scrollbar-hide">
            {['appearance', 'character', 'gallery'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xl shadow-pink-600/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab === 'appearance' ? 'শারীরিক গঠন' : tab === 'character' ? 'ব্যক্তিত্ব' : 'গ্যালারি'}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-[400px]">
            {activeTab === 'appearance' && (
              <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <AttributeCard label="জাতীয়তা" value={profile.appearance.ethnicity} />
                <AttributeCard label="চোখের রঙ" value={profile.appearance.eyeColor} />
                <AttributeCard label="শারীরিক গঠন" value={profile.appearance.bodyType} />
                <AttributeCard label="ফিগার ডিটেইলস" value={profile.appearance.breastSize} />
                <AttributeCard label="চুলের স্টাইল" value={profile.appearance.hairStyle} />
                <AttributeCard label="চুলের রঙ" value={profile.appearance.hairColor} />
                <AttributeCard label="পোশাক" value={profile.appearance.outfit} />
                <AttributeCard label="ভাইব" value="সবসময় ফ্রেশ" />
              </div>
            )}

            {activeTab === 'character' && (
              <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <AttributeCard label="পার্সোনালিটি" value={profile.personality} />
                <AttributeCard label="পেশা" value={profile.character.occupation} />
                <div className="col-span-2">
                   <AttributeCard label="শখ ও পছন্দ" value={profile.character.kinks.length > 0 ? profile.character.kinks.join(', ') : 'গল্প করা, ঘুরে বেড়ানো'} />
                </div>
                <div className="col-span-2 bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ভয়েস ইঞ্জিন</span>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-lg font-black text-white">{profile.voiceName}</span>
                       <div className="flex gap-1 items-center h-4">
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="w-1 bg-pink-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                {allMedia.map((item, idx) => (
                  <div key={idx} onClick={() => { setCurrentMediaIndex(idx); setSelectedLightboxMedia(item); }} className={`group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer border shadow-lg active:scale-95 transition-all ${idx === currentMediaIndex ? 'border-pink-500 ring-4 ring-pink-500/20' : 'border-white/5'}`}>
                    {item.type === 'image' ? (
                      <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full relative">
                        <video src={item.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <svg className="h-10 w-10 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={onStartChat} className="group w-full h-24 mt-12 relative overflow-hidden bg-gradient-to-r from-[#ff4d6d] to-[#ff758c] rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-[0_25px_60px_-15px_rgba(255,77,109,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
            <span>আড্ডা শুরু করি</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
