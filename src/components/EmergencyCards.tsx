import React, { useState } from 'react';
import { ShieldAlert, Briefcase, Home, Globe, X, ArrowRight, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { EMERGENCY_CARDS_DATA } from '../constants/legalData';
import { cn } from '../lib/utils';

const ICON_MAP: Record<string, any> = {
  ShieldAlert,
  Briefcase,
  Home,
  Globe
};

export function EmergencyCards() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = EMERGENCY_CARDS_DATA.find(c => c.id === selectedCardId);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-10 custom-scrollbar max-w-5xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-brand-primary/5 rounded-[2rem] flex items-center justify-center mb-6 mx-auto animate-in fade-in slide-in-from-bottom-4">
          <ShieldAlert className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-4xl font-serif font-medium text-brand-ink mb-4 animate-in fade-in slide-in-from-bottom-4 [animation-delay:100ms]">Emergency Legal Help</h2>
        <p className="text-brand-muted max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 [animation-delay:200ms]">
          Quick, actionable guidance for high-stress legal situations. Know exactly what to say and do to protect your rights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 [animation-delay:300ms]">
        {EMERGENCY_CARDS_DATA.map((card) => {
          const Icon = ICON_MAP[card.icon];
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="group relative flex items-center gap-6 p-8 bg-white border border-brand-border rounded-[2.5rem] hover:border-brand-primary/30 hover:bg-brand-bg transition-all text-left shadow-sm active:scale-[0.98]"
            >
              <div className="w-16 h-16 bg-brand-primary/5 rounded-3xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-medium text-brand-ink mb-1">{card.title}</h3>
                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold">Quick Action Card</p>
              </div>
              <ChevronRight className="w-6 h-6 text-brand-muted group-hover:translate-x-1 transition-transform" />
            </button>
          );
        })}
      </div>

      {/* Modal / Overlay for Card Details */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedCardId(null)}
          />
          
          <div className="relative w-full max-w-2xl bg-brand-surface rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-brand-border flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-bg shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-primary rounded-[1.25rem] text-white shadow-lg shadow-brand-primary/20">
                  {React.createElement(ICON_MAP[selectedCard.icon], { className: "w-6 h-6" })}
                </div>
                <h2 className="text-2xl font-serif font-medium text-brand-ink">{selectedCard.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedCardId(null)}
                className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-ink"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              {/* What to Say */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>What to Say (Verbal Protocol)</span>
                </div>
                <div className="space-y-4">
                  {selectedCard.whatToSay.map((text, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-brand-bg/50 border border-brand-border rounded-2xl italic text-brand-ink text-sm leading-relaxed">
                      <span className="text-brand-accent font-serif text-lg">"</span>
                      {text}
                      <span className="text-brand-accent font-serif text-lg">"</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* What to Do */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>What to Do (Action Steps)</span>
                </div>
                <div className="space-y-3">
                  {selectedCard.whatToDo.map((text, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-brand-surface border border-brand-border rounded-2xl text-sm text-brand-ink shadow-sm">
                      <div className="w-6 h-6 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent font-bold text-xs flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-brand-bg border-t border-brand-border flex justify-end shrink-0">
              <button
                onClick={() => setSelectedCardId(null)}
                className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-[0.98]"
              >
                Got it, Stay Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
