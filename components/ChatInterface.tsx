
import React, { useState, useEffect, useRef } from 'react';
import { GirlfriendProfile, Message } from '../types';
import { gemini } from '../services/geminiService';
import { VoiceCallModal } from './VoiceCallModal';

interface ChatInterfaceProps {
  profile: GirlfriendProfile;
  onBack: () => void;
  onMenuOpen: () => void;
  userName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, onBack, onMenuOpen, userName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: profile.intro,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const personalizedPrompt = userName 
      ? `${profile.systemPrompt}\nইউজারের নাম হচ্ছে '${userName}'। তাকে এই নামে ডাকবে মাঝে মাঝে।`
      : profile.systemPrompt;
      
    gemini.initChat(personalizedPrompt);
    scrollToBottom();
  }, [profile, userName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      let aiResponseText = '';
      const aiMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date()
      }]);

      const stream = gemini.sendMessageStream(userMsg.text);
      for await (const chunk of stream) {
        aiResponseText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: aiResponseText } : m
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'error',
        sender: 'ai',
        text: 'দুঃখিত, কানেকশনে সমস্যা হচ্ছে। একবার চেক করবে কি?',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto glass shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Premium Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative group cursor-pointer">
            <img src={profile.image} alt={profile.name} className="h-12 w-12 rounded-full object-cover border-2 border-pink-500 shadow-lg group-hover:scale-105 transition-transform" />
            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-[3px] border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="font-black text-white text-lg tracking-tight leading-none mb-1">{profile.name}</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Now</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowVoiceCall(true)}
            className="p-4 bg-gradient-to-br from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 rounded-2xl text-white shadow-xl shadow-pink-600/20 transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
          <button 
            onClick={onMenuOpen}
            className="p-4 glass hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-950/20">
        {messages.map((m, i) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] relative ${isUser ? 'order-1' : 'order-2'}`}>
                <div className={`p-4 rounded-3xl shadow-lg leading-relaxed text-sm md:text-base whitespace-pre-wrap ${
                  isUser 
                  ? 'bg-gradient-to-br from-pink-600 to-rose-500 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-sm'
                }`}>
                  {m.text || (isTyping && i === messages.length - 1 && <span className="opacity-50">টাইপ করছে...</span>)}
                </div>
                <span className={`text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1.5 block ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && messages[messages.length-1].sender === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0s]"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-5 bg-black/40 backdrop-blur-3xl border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="মন খুলে কথা বলো..."
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all text-white placeholder:text-slate-600 pr-14"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
               <button type="button" className="text-slate-500 hover:text-pink-500 transition-colors p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 disabled:opacity-50 h-14 w-14 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-2xl shadow-pink-600/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Voice Modal Overlay */}
      {showVoiceCall && (
        <VoiceCallModal 
          profile={profile} 
          onClose={() => setShowVoiceCall(false)} 
        />
      )}
    </div>
  );
};
