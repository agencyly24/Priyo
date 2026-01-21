
import React, { useState, useEffect, useRef } from 'react';
import { GirlfriendProfile, Message } from '../types';
import { gemini } from '../services/geminiService';
import { VoiceCallModal } from './VoiceCallModal';

interface ChatInterfaceProps {
  profile: GirlfriendProfile;
  onBack: () => void;
  onMenuOpen: () => void;
  userName: string;
  isPremium: boolean;
  onUpgrade: () => void;
  history: Message[];
  onSaveHistory: (messages: Message[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  profile, onBack, onMenuOpen, userName, isPremium, onUpgrade, history, onSaveHistory 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial load
  useEffect(() => {
    const personalizedPrompt = userName 
      ? `${profile.systemPrompt}\nইউজারের নাম হচ্ছে '${userName}'। তাকে এই নামে ডাকবে মাঝে মাঝে।`
      : profile.systemPrompt;
      
    // Load history or intro
    const initialMsgs = history.length > 0 ? history : [
      {
        id: 'welcome',
        sender: 'ai',
        text: profile.intro,
        timestamp: new Date()
      }
    ];

    setMessages(initialMsgs);
    gemini.initChat(personalizedPrompt, initialMsgs);
    
    // Smooth scroll to bottom after state set
    setTimeout(scrollToBottom, 200);
  }, [profile, userName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceCallClick = () => {
    if (isPremium) {
      setShowVoiceCall(true);
    } else {
      onUpgrade();
    }
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

    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInputText('');
    setIsTyping(true);

    // Keep focus
    inputRef.current?.focus();

    try {
      let aiResponseText = '';
      const aiMsgId = (Date.now() + 1).toString();
      
      const newAiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date()
      };
      
      setMessages([...updatedMessagesWithUser, newAiMsg]);

      const stream = gemini.sendMessageStream(userMsg.text);
      for await (const chunk of stream) {
        aiResponseText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: aiResponseText } : m
        ));
      }

      const finalMessages = [...updatedMessagesWithUser, { ...newAiMsg, text: aiResponseText }];
      onSaveHistory(finalMessages);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: 'error',
        sender: 'ai',
        text: 'উফফ বাবু, কানেকশনে একটু সমস্যা হচ্ছে মনে হয়। আরেকবার বলো না?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      onSaveHistory([...updatedMessagesWithUser, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto glass shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 bg-slate-900">
      {/* Premium Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative group cursor-pointer">
            <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-500 shadow-lg group-hover:scale-105 transition-transform" />
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="font-black text-white text-base tracking-tight leading-none mb-1">{profile.name}</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleVoiceCallClick}
            className={`p-3 rounded-xl text-white shadow-xl transition-all active:scale-90 ${isPremium ? 'bg-gradient-to-r from-pink-600 to-rose-500 shadow-pink-600/20' : 'bg-gradient-to-r from-yellow-600 to-orange-500 shadow-yellow-600/20'}`}
          >
            {isPremium ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </button>
          <button onClick={onMenuOpen} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth bg-gradient-to-b from-slate-900 to-black/80">
        {messages.map((m, i) => {
          const isUser = m.sender === 'user';
          const displayTime = m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp);

          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start items-end'} gap-2 group animate-in slide-in-from-bottom-2 duration-300`}>
              {!isUser && (
                <img src={profile.image} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" alt="" />
              )}
              <div className={`max-w-[80%] relative`}>
                <div className={`px-5 py-3 rounded-[1.5rem] leading-relaxed text-sm md:text-base whitespace-pre-wrap shadow-lg transition-transform hover:scale-[1.01] ${
                  isUser 
                  ? 'bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-br-sm' 
                  : 'bg-white/10 border border-white/5 text-slate-100 rounded-bl-sm backdrop-blur-md'
                }`}>
                  {m.text || (isTyping && i === messages.length - 1 && <span className="opacity-50 animate-pulse">লিখছে...</span>)}
                </div>
                <span className={`text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right' : 'text-left'}`}>
                  {displayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && messages[messages.length-1]?.sender === 'user' && (
          <div className="flex justify-start items-end gap-2">
            <img src={profile.image} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" alt="" />
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-[1.5rem] rounded-bl-sm flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0s]"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* Smart Input Panel */}
      <div className="p-4 bg-black/60 backdrop-blur-3xl border-t border-white/10 pb-6 md:pb-6">
        <form onSubmit={handleSend} className="flex gap-3 items-end max-w-2xl mx-auto">
          <div className="flex-1 relative bg-white/5 border border-white/10 rounded-[1.5rem] focus-within:ring-2 focus-within:ring-pink-500/30 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent px-5 py-4 text-sm md:text-base focus:outline-none text-white placeholder:text-slate-500/50"
            />
          </div>
          <button 
            type="submit" 
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 disabled:opacity-50 disabled:grayscale h-12 w-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-lg shadow-pink-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

      {showVoiceCall && (
        <VoiceCallModal profile={profile} onClose={() => setShowVoiceCall(false)} />
      )}
    </div>
  );
};
