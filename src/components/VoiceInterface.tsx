import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  lastResponse?: string;
  isProcessing?: boolean;
}

const LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'bn-IN', name: 'Bengali' },
];

export function VoiceInterface({ onTranscript, lastResponse, isProcessing }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        if (event.results[current].isFinal) {
          onTranscript(result);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser.');
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [onTranscript]);

  useEffect(() => {
    if (lastResponse && !isProcessing) {
      speak(lastResponse);
    }
  }, [lastResponse, isProcessing]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (isSpeaking) {
        synthRef.current?.cancel();
        setIsSpeaking(false);
      }
      setTranscript('');
      setError(null);
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    // Clean text from markdown
    const cleanText = text.replace(/[*#_]/g, '').substring(0, 500); // Limit length for TTS
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-brand-surface border border-brand-border rounded-[2.5rem] shadow-xl animate-in fade-in zoom-in-95">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-4 h-4 text-brand-primary" />
        <select 
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-brand-bg border border-brand-border rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
            isListening 
              ? "bg-red-500 text-white animate-pulse scale-110" 
              : "bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-105 active:scale-95"
          )}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
        
        {isListening && (
          <div className="absolute -inset-4 border-4 border-red-500/20 rounded-full animate-ping" />
        )}
      </div>

      <div className="text-center min-h-[3rem] max-w-xs">
        {error ? (
          <p className="text-red-500 text-xs font-medium">{error}</p>
        ) : isListening ? (
          <p className="text-brand-ink text-sm font-medium italic">"{transcript || 'Listening...'}"</p>
        ) : isProcessing ? (
          <p className="text-brand-muted text-sm animate-pulse">Processing your legal issue...</p>
        ) : isSpeaking ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-brand-primary text-sm font-medium">Speaking response...</p>
            <button 
              onClick={stopSpeaking}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline"
            >
              <VolumeX className="w-3 h-3" /> Stop Audio
            </button>
          </div>
        ) : (
          <p className="text-brand-muted text-sm">Tap to speak your legal issue in your language</p>
        )}
      </div>
    </div>
  );
}
