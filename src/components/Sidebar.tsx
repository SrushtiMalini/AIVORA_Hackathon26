import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Settings, 
  LogOut, 
  User,
  Scale,
  Calculator,
  ShieldAlert,
  Sword,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewType = 'chat' | 'calculator' | 'emergency' | 'war-room';

interface SidebarProps {
  sessions: { id: string; title: string }[];
  activeSessionId: string;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  user: { name: string; email: string } | null;
  onCloseMobile?: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  currentView,
  onViewChange,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  onLogout,
  user,
  onCloseMobile
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleRename = (id: string) => {
    if (editValue.trim()) {
      onRenameSession(id, editValue);
    }
    setEditingId(null);
  };

  return (
    <div className="w-72 h-[100dvh] bg-brand-primary text-brand-primary-fg flex flex-col border-r border-white/10 shrink-0">
      {/* Header */}
      <div className="p-6 lg:p-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-brand-accent p-2.5 rounded-2xl shadow-lg shadow-brand-accent/20">
            <Scale className="w-6 h-6 text-brand-accent-fg" />
          </div>
          <h1 className="text-xl lg:text-2xl font-serif font-semibold tracking-tight">Defender AI</h1>
        </div>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="p-2 lg:hidden rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-6 mb-6">
        <button
          onClick={() => {
            onViewChange('chat');
            onNewChat();
          }}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary-fg/10 hover:bg-brand-primary-fg/20 border border-brand-primary-fg/10 transition-all py-3.5 rounded-2xl font-medium shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* Legal Tools */}
      <div className="px-4 mb-8 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary-fg/40 px-3 mb-3">Legal Tools</p>
        <button
          onClick={() => onViewChange('calculator')}
          className={cn(
            "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all",
            currentView === 'calculator' 
              ? "bg-brand-primary-fg/15 text-brand-primary-fg shadow-sm" 
              : "hover:bg-brand-primary-fg/5 text-brand-primary-fg/60 hover:text-brand-primary-fg"
          )}
        >
          <Calculator className="w-4 h-4 opacity-60" />
          <span className="text-sm font-medium">Cost Calculator</span>
        </button>
        <button
          onClick={() => onViewChange('emergency')}
          className={cn(
            "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all",
            currentView === 'emergency' 
              ? "bg-brand-primary-fg/15 text-brand-primary-fg shadow-sm" 
              : "hover:bg-brand-primary-fg/5 text-brand-primary-fg/60 hover:text-brand-primary-fg"
          )}
        >
          <ShieldAlert className="w-4 h-4 opacity-60" />
          <span className="text-sm font-medium">Emergency Help</span>
        </button>
        <button
          onClick={() => onViewChange('war-room')}
          className={cn(
            "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all",
            currentView === 'war-room' 
              ? "bg-brand-primary-fg/15 text-brand-primary-fg shadow-sm" 
              : "hover:bg-brand-primary-fg/5 text-brand-primary-fg/60 hover:text-brand-primary-fg"
          )}
        >
          <Sword className="w-4 h-4 opacity-60" />
          <span className="text-sm font-medium">Legal War Room</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary-fg/40 px-3 mb-3">Recent Consultations</p>
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => {
              onViewChange('chat');
              onSelectSession(session.id);
            }}
            className={cn(
              "group relative flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all",
              currentView === 'chat' && activeSessionId === session.id 
                ? "bg-brand-primary-fg/15 text-brand-primary-fg shadow-sm" 
                : "hover:bg-brand-primary-fg/5 text-brand-primary-fg/60 hover:text-brand-primary-fg"
            )}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
            
            {editingId === session.id ? (
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-sm w-full"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRename(session.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(session.id)}
              />
            ) : (
              <span className="text-sm truncate flex-1 font-medium">{session.title}</span>
            )}

            <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-brand-primary/90 backdrop-blur-sm pl-2 rounded-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(session.id);
                  setEditValue(session.title);
                }}
                className="p-1.5 hover:text-brand-accent transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="p-1.5 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t border-brand-primary-fg/10 bg-black/10">
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-brand-primary-fg/5 transition-colors group relative cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center font-bold text-brand-accent-fg shadow-inner">
            {user?.name?.[0] || <User className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || "Guest User"}</p>
            <p className="text-xs text-brand-primary-fg/40 truncate">{user?.email || "No account"}</p>
          </div>
          
          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-brand-primary border border-brand-primary-fg/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-4 text-sm hover:bg-brand-primary-fg/5 transition-colors text-left"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-4 text-sm hover:bg-red-500/10 text-red-400 transition-colors border-t border-brand-primary-fg/5 text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
