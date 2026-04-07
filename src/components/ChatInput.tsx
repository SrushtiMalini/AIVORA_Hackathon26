import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  externalValue?: string;
  onInputChange?: (value: string) => void;
}

export function ChatInput({ 
  onSendMessage, 
  onFileUpload, 
  isProcessing,
  externalValue,
  onInputChange
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with external value if provided (for suggestions)
  useEffect(() => {
    if (externalValue !== undefined) {
      setInput(externalValue);
    }
  }, [externalValue]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (onInputChange) onInputChange(value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || selectedFile) && !isProcessing) {
      if (selectedFile) {
        onFileUpload(selectedFile);
        setSelectedFile(null);
      }
      if (input.trim()) {
        onSendMessage(input);
        handleInputChange("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      // Stop logic would go here
    } else {
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + " " + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    }
  };

  return (
    <div className="p-4 sm:p-10 bg-brand-bg border-t border-brand-border">
      <form 
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto relative flex items-center gap-2 sm:gap-4"
      >
        <div className="flex-1 relative flex flex-col gap-2">
          {selectedFile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded-xl self-start animate-in fade-in zoom-in-95">
              <Paperclip className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-medium text-brand-primary truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <div className="relative flex items-center w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-3 sm:left-5 p-2 text-brand-muted hover:text-brand-primary transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,image/*,video/*"
              onChange={handleFileChange}
            />

            <textarea
              rows={1}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Describe your legal issue or upload a document..."
              className="w-full bg-brand-surface border border-brand-border text-brand-ink rounded-[2rem] py-4 sm:py-5 pl-12 sm:pl-16 pr-24 sm:pr-28 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all resize-none text-sm sm:text-base shadow-sm"
            />

            <div className="absolute right-2 sm:right-4 flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  "p-2.5 rounded-2xl transition-all",
                  isRecording 
                    ? "bg-red-50 text-red-600 animate-pulse" 
                    : "text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5"
                )}
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || isProcessing}
                className={cn(
                  "p-2.5 rounded-2xl transition-all",
                  (input.trim() || selectedFile) && !isProcessing
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "bg-brand-bg border border-brand-border text-brand-muted cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      <p className="text-[10px] text-center text-brand-muted mt-5 uppercase tracking-[0.2em] font-bold">
        Defender AI can make mistakes. Check important info.
      </p>
    </div>
  );
}
