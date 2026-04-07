import React, { useState } from 'react';
import { Scale, Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-primary text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="bg-brand-accent p-3.5 rounded-[1.25rem] shadow-2xl shadow-brand-accent/20">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-semibold tracking-tight">Defender AI</h1>
          </div>
          
          <h2 className="text-6xl font-serif font-medium leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Justice for all, <br />
            <span className="text-brand-accent italic">redefined by AI.</span>
          </h2>
          <p className="text-xl text-white/60 max-w-md leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 [animation-delay:200ms]">
            Navigate the complexities of Indian law with clarity. Your sophisticated AI Public Defender is here to guide you.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-10 text-xs uppercase tracking-[0.2em] font-bold text-white/30 animate-in fade-in [animation-delay:500ms]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-brand-accent rounded-full shadow-[0_0_10px_rgba(127,84,61,0.8)]" />
            <span>10k+ Consultations</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-brand-accent rounded-full shadow-[0_0_10px_rgba(127,84,61,0.8)]" />
            <span>24/7 Availability</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-20">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="bg-brand-primary p-4 rounded-2xl shadow-xl shadow-brand-primary/20">
                <Scale className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-4xl font-serif font-medium text-brand-ink mb-3">
              {isLogin ? "Welcome Back" : "Begin Your Journey"}
            </h3>
            <p className="text-brand-muted font-medium">
              {isLogin 
                ? "Sign in to access your legal consultations" 
                : "Join Defender AI to start your legal journey"}
            </p>
          </div>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-3xl animate-in fade-in zoom-in-95 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-brand-muted ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                  <input
                    type="text"
                    required
                    className="w-full bg-brand-surface border border-brand-border text-brand-ink rounded-2xl py-4.5 pl-14 pr-5 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all shadow-sm"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-muted ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                <input
                  type="email"
                  required
                  className="w-full bg-brand-surface border border-brand-border text-brand-ink rounded-2xl py-4.5 pl-14 pr-5 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all shadow-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs uppercase tracking-widest font-bold text-brand-muted">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-accent/80 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                <input
                  type="password"
                  required
                  className="w-full bg-brand-surface border border-brand-border text-brand-ink rounded-2xl py-4.5 pl-14 pr-5 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="bg-brand-bg px-6 text-brand-muted">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-4 py-4 px-6 bg-brand-surface border border-brand-border rounded-2xl hover:bg-brand-bg transition-all font-bold text-brand-ink text-sm shadow-sm group"
            >
              <Globe className="w-5 h-5 text-brand-primary group-hover:rotate-12 transition-transform" />
              <span className="uppercase tracking-widest">Google Account</span>
            </button>
          </div>

          <p className="text-center text-sm text-brand-muted font-medium">
            {isLogin ? "New to Defender AI?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-brand-accent hover:text-brand-accent/80 transition-colors underline underline-offset-4"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
