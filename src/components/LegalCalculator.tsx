import React, { useState, useMemo } from 'react';
import { Calculator, MapPin, Briefcase, IndianRupee, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { COURT_FEES_DATA } from '../constants/legalData';
import { cn } from '../lib/utils';

export function LegalCalculator() {
  const [caseType, setCaseType] = useState(COURT_FEES_DATA.caseTypes[0].id);
  const [state, setState] = useState(COURT_FEES_DATA.states[0]);
  const [amount, setAmount] = useState<number>(0);

  const selectedCase = useMemo(() => 
    COURT_FEES_DATA.caseTypes.find(c => c.id === caseType)!, 
  [caseType]);

  const calculations = useMemo(() => {
    const courtFee = selectedCase.baseFee + (amount * selectedCase.percentage);
    const stampDuty = amount * selectedCase.stampDuty;
    const total = courtFee + stampDuty;
    
    return {
      courtFee: Math.round(courtFee),
      stampDuty: Math.round(stampDuty),
      total: Math.round(total),
      penalty: selectedCase.penaltyRange
    };
  }, [selectedCase, amount]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-10 custom-scrollbar max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-brand-primary/5 rounded-[2rem] flex items-center justify-center mb-6 mx-auto animate-in fade-in slide-in-from-bottom-4">
          <Calculator className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-brand-ink mb-4 animate-in fade-in slide-in-from-bottom-4 [animation-delay:100ms]">Legal Cost Calculator</h2>
        <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 [animation-delay:200ms]">
          Estimate your potential legal expenses, court fees, and stamp duties across different Indian states and case types.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 [animation-delay:300ms]">
        {/* Inputs */}
        <div className="space-y-8 bg-white border border-brand-border p-8 rounded-[2.5rem] shadow-sm">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted">
              <Briefcase className="w-3.5 h-3.5" /> Case Category
            </label>
            <select 
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-5 text-sm font-semibold text-brand-ink focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all"
            >
              {COURT_FEES_DATA.caseTypes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted">
              <MapPin className="w-3.5 h-3.5" /> State/Jurisdiction
            </label>
            <select 
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-5 text-sm font-semibold text-brand-ink focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all"
            >
              {COURT_FEES_DATA.states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted">
              <IndianRupee className="w-3.5 h-3.5" /> Claim Amount / Property Value
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-5 text-sm font-semibold text-brand-ink focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all"
              />
            </div>
            <p className="text-[10px] text-brand-muted italic px-2">Enter the disputed amount or property value for accurate estimation.</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-brand-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-brand-primary/20 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Estimated Total Cost</p>
              <h3 className="text-4xl sm:text-5xl font-serif font-medium">₹{calculations.total.toLocaleString()}</h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-sm font-medium text-white/70">Court Fees</span>
                <span className="text-lg font-serif">₹{calculations.courtFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-sm font-medium text-white/70">Stamp Duty</span>
                <span className="text-lg font-serif">₹{calculations.stampDuty.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-white/70">Potential Penalty</span>
                <span className="text-sm font-medium text-brand-accent italic">{calculations.penalty}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-bg border border-brand-border p-6 rounded-3xl flex gap-4 items-start">
            <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-ink">Disclaimer</p>
              <p className="text-xs text-brand-muted leading-relaxed">
                These estimates are based on general schedules and may vary by specific court rules, lawyer fees, and recent amendments. Consult a qualified professional for precise legal costs.
              </p>
            </div>
          </div>

          <button className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/30 p-5 rounded-3xl flex items-center justify-between group transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-primary/5 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-brand-ink">Need a detailed breakdown?</p>
                <p className="text-xs text-brand-muted">Ask Defender AI about specific state rules</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-muted group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
