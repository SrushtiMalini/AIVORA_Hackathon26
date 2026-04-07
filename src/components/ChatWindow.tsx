import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Scale, AlertTriangle, Clock, ShieldCheck, IndianRupee, FileText, Calendar } from 'lucide-react';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { generateLegalNotice, generateCalendarEvent } from '../services/exportService';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatWindow({ messages, isTyping, onSuggestionClick }: ChatWindowProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto">
        <div className="w-24 h-24 bg-brand-primary/5 rounded-[2.5rem] flex items-center justify-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <Scale className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-4xl font-serif font-medium text-brand-ink mb-4 animate-in fade-in slide-in-from-bottom-4 [animation-delay:100ms]">How can I assist you today?</h2>
        <p className="text-brand-muted max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-4 [animation-delay:200ms]">
          I am your Defender AI. I can help you navigate legal complexities, analyze documents, and strategize your legal path with clarity and precision.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 [animation-delay:300ms]">
          {[
            "Explain my rights in a tenant dispute",
            "Analyze this employment contract",
            "What are the penalties for cyber fraud?",
            "How to file a consumer complaint?"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="p-5 text-left bg-brand-surface border border-brand-border rounded-3xl hover:border-brand-accent/30 hover:bg-brand-bg transition-all text-sm font-medium text-brand-ink shadow-sm group"
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-10 custom-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full gap-5 animate-in fade-in slide-in-from-bottom-4",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {message.role === 'assistant' && (
            <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/10">
              <Scale className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className={cn(
            "max-w-[85%] sm:max-w-[75%] p-6 shadow-sm",
            message.role === 'user' 
              ? "bg-brand-primary text-brand-primary-fg rounded-[2rem] rounded-tr-none" 
              : "bg-brand-surface border border-brand-border text-brand-ink rounded-[2rem] rounded-tl-none"
          )}>
            <div className={cn(
              "prose-legal prose-sm max-w-none",
              message.role === 'user' ? "text-brand-primary-fg user-prose" : "text-brand-ink"
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            {message.role === 'assistant' && (
              <div className="mt-6 pt-5 border-t border-brand-border flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-[0.15em] font-bold text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> Verified by Defender AI
                </span>
                <span className="flex items-center gap-1.5 text-brand-accent">
                  <AlertTriangle className="w-3.5 h-3.5" /> Not Legal Advice
                </span>
                
                {/* Export Tools */}
                <div className="flex items-center gap-4 ml-auto">
                  {(message.content.toLowerCase().includes('notice') || message.content.toLowerCase().includes('draft')) && (
                    <button 
                      onClick={() => generateLegalNotice(message.content)}
                      className="flex items-center gap-1.5 text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Export as Notice
                    </button>
                  )}
                  {(message.content.toLowerCase().includes('deadline') || message.content.toLowerCase().includes('date')) && (
                    <button 
                      onClick={() => {
                        // Simple regex to find a date like DD/MM/YYYY or YYYY-MM-DD
                        const dateMatch = message.content.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) || message.content.match(/\d{4}-\d{2}-\d{2}/);
                        if (dateMatch) {
                          generateCalendarEvent('Legal Deadline', dateMatch[0]);
                        } else {
                          // Fallback to current date + 7 days
                          const futureDate = new Date();
                          futureDate.setDate(futureDate.getDate() + 7);
                          generateCalendarEvent('Legal Deadline (Estimated)', futureDate.toISOString().split('T')[0]);
                        }
                      }}
                      className="flex items-center gap-1.5 text-brand-accent hover:text-brand-accent/80 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Add to Calendar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-11 h-11 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="w-5 h-5 text-brand-primary" />
            </div>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="flex w-full gap-5 animate-pulse">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-brand-primary/40" />
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-[2rem] rounded-tl-none p-5 w-28 flex gap-1.5 items-center justify-center">
            <div className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );
}
