import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Gavel,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface RoadmapStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  estimatedTime?: string;
}

export interface LegalStrategy {
  strengthScore: number; // 0 to 100
  strengthLabel: string;
  roadmap: RoadmapStep[];
  keyRisks: string[];
}

interface LegalStrategyPanelProps {
  strategy: LegalStrategy | null;
  onClose: () => void;
}

export function LegalStrategyPanel({ strategy, onClose }: LegalStrategyPanelProps) {
  if (!strategy) return null;

  const getStrengthColor = (score: number) => {
    if (score >= 70) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 40) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getGaugeColor = (score: number) => {
    if (score >= 70) return '#22c55e'; // green-500
    if (score >= 40) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-96 h-full bg-brand-surface border-l border-brand-border flex flex-col shadow-2xl z-30"
    >
      {/* Header */}
      <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-brand-primary" />
          <h3 className="font-serif font-semibold text-brand-ink">Case Strategy</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-brand-bg rounded-xl transition-colors text-brand-muted"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Strength Meter */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">Strength of Case</h4>
            <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getStrengthColor(strategy.strengthScore))}>
              {strategy.strengthLabel}
            </div>
          </div>
          
          <div className="relative flex flex-col items-center justify-center p-6 bg-brand-bg rounded-3xl border border-brand-border overflow-hidden">
            <div className="relative w-40 h-24 overflow-hidden">
              {/* Semi-circle Gauge Background */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-brand-border"
                  strokeDasharray="219.9"
                  strokeDashoffset="219.9"
                  strokeLinecap="round"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke={getGaugeColor(strategy.strengthScore)}
                  strokeWidth="12"
                  strokeDasharray="219.9"
                  initial={{ strokeDashoffset: 219.9 }}
                  animate={{ strokeDashoffset: 219.9 - (219.9 * strategy.strengthScore / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute bottom-0 left-0 w-full text-center">
                <span className="text-3xl font-serif font-bold text-brand-ink">{strategy.strengthScore}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-center text-brand-muted leading-relaxed">
              Based on current facts and relevant Indian statutes.
            </p>
          </div>
        </section>

        {/* Legal Roadmap */}
        <section>
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-muted mb-6">Legal Roadmap</h4>
          <div className="space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-brand-border" />
            
            {strategy.roadmap.map((step, index) => (
              <div key={index} className="relative pl-10">
                <div className={cn(
                  "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2",
                  step.status === 'completed' ? "bg-brand-primary border-brand-primary text-white" :
                  step.status === 'current' ? "bg-brand-surface border-brand-primary text-brand-primary animate-pulse" :
                  "bg-brand-surface border-brand-border text-brand-muted"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                </div>
                
                <div className={cn(
                  "p-4 rounded-2xl border transition-all",
                  step.status === 'current' ? "bg-brand-primary/5 border-brand-primary/20 shadow-sm" : "border-transparent"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={cn("text-sm font-bold", step.status === 'upcoming' ? "text-brand-muted" : "text-brand-ink")}>
                      {step.title}
                    </h5>
                    {step.estimatedTime && (
                      <span className="text-[10px] text-brand-muted flex items-center gap-1">
                        <Info className="w-3 h-3" /> {step.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Risks */}
        {strategy.keyRisks.length > 0 && (
          <section className="p-5 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <h4 className="text-[10px] uppercase tracking-widest font-bold">Critical Risks</h4>
            </div>
            <ul className="space-y-2">
              {strategy.keyRisks.map((risk, i) => (
                <li key={i} className="text-xs text-red-700/80 flex gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-brand-bg/50 border-t border-brand-border">
        <div className="flex items-center gap-3 text-brand-muted">
          <ShieldCheck className="w-5 h-5 text-brand-primary opacity-50" />
          <p className="text-[10px] leading-tight">
            This roadmap is a strategic projection. Actual legal proceedings may vary based on court discretion and opposing counsel actions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
