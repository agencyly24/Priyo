
import React, { useEffect, useState, useRef } from 'react';
import { GirlfriendProfile } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface VoiceCallModalProps {
  profile: GirlfriendProfile;
  onClose: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ profile, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startCall();
    return () => {
      endCall();
    };
  }, []);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startCall = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Setup Visualizer
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setVolume(average / 128);
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            source.connect(analyserRef.current!);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setStatus('error');
          },
          onclose: () => {
            if (status !== 'error') onClose();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.voiceName as any } },
          },
          systemInstruction: profile.systemPrompt + `
ভয়েস মোড স্পেশাল রুলস:
- ছোট এবং সহজ বাক্যে কথা বলবে যাতে রিয়েল-টাইম ফিল আসে। 
- মাঝে মাঝে "হুম...", "আচ্ছা", "ঠিক বলেছ" ব্যবহার করবে।
- কথা বলার সময় ইমোশনাল ইম্প্যাক্ট বজায় রাখবে।
- উত্তর দেওয়ার আগে দীর্ঘ চিন্তা করবে না, দ্রুত রেসপন্স করবে।`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Call failed:', err);
      setStatus('error');
    }
  };

  const endCall = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl overflow-hidden">
      {/* Dynamic Background Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div 
          className="w-[800px] h-[800px] rounded-full bg-pink-500/30 blur-[150px] transition-transform duration-75"
          style={{ transform: `scale(${1 + volume * 0.5})` }}
        />
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-12 p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="relative group flex flex-col items-center">
          {/* Pulsating Ring */}
          <div className={`absolute -inset-8 rounded-full border-2 border-pink-500/20 animate-ping duration-1000 ${status === 'connected' ? 'block' : 'hidden'}`}></div>
          <div className={`absolute -inset-16 rounded-full border-2 border-pink-500/10 animate-ping duration-[1500ms] ${status === 'connected' ? 'block' : 'hidden'}`}></div>

          <div className="relative rounded-full p-2 bg-gradient-to-br from-pink-500 to-rose-500 shadow-2xl">
            <img 
              src={profile.image} 
              alt={profile.name} 
              className={`w-64 h-64 md:w-80 md:h-80 rounded-full object-cover transition-all duration-1000 border-8 border-slate-950 ${status === 'connected' ? 'scale-100 shadow-pink-500/30' : 'grayscale scale-95 opacity-50'}`} 
            />
          </div>
          
          {status === 'connected' && (
            <div className="mt-8 flex items-center gap-2">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-pink-500 rounded-full transition-all duration-75"
                  style={{ 
                    height: `${Math.max(4, volume * (Math.random() * 40 + 20))}px`,
                    opacity: 0.5 + volume * 0.5
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-white tracking-tight">{profile.name}</h2>
          <div className="flex items-center justify-center gap-3">
             <span className={`h-3 w-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
             <p className={`text-lg font-bold uppercase tracking-[0.3em] ${status === 'connected' ? 'text-pink-400' : 'text-gray-500'}`}>
               {status === 'connecting' ? 'সংযোগ করা হচ্ছে...' : 
                status === 'connected' ? 'আলাপ চলছে' : 
                'সংযোগ বিচ্ছিন্ন'}
             </p>
          </div>
        </div>

        <div className="flex gap-12 items-center mt-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-8 rounded-full transition-all duration-300 transform active:scale-90 border-2 ${isMuted ? 'bg-red-600 border-red-500 text-white shadow-red-600/30' : 'glass border-white/10 text-white hover:bg-white/10'}`}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <button 
            onClick={onClose}
            className="p-10 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-2xl shadow-red-600/40 transition-all transform hover:scale-110 active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
