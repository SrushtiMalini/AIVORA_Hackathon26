import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { SettingsModal } from '../components/SettingsModal';
import { VoiceInterface } from '../components/VoiceInterface';
import { LegalCalculator } from '../components/LegalCalculator';
import { EmergencyCards } from '../components/EmergencyCards';
import { LegalStrategyPanel, LegalStrategy } from '../components/LegalStrategyPanel';
import { WarRoom } from '../components/WarRoom';
import { ViewType } from '../components/Sidebar';
import { Message, ChatSession, UserSettings, WarRoomData } from '../types';
import { generateLegalResponse, generateWarRoomAnalysis } from '../services/geminiService';
import { performOCR } from '../services/ocrService';
import { generateCaseBrief, generateEvidenceBundle } from '../services/exportService';
import { Scale, Globe, MapPin, Shield, Sun, Moon, Mic, FileText, Package, Download, Sword, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<LegalStrategy | null>(null);
  const [warRoomData, setWarRoomData] = useState<WarRoomData | null>(null);
  const [isWarRoomLoading, setIsWarRoomLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [chatInputValue, setChatInputValue] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('userSettings');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }

    return {
      language: 'English',
      location: 'India',
      theme: savedTheme || 'light'
    };
  });

  const user = auth.currentUser;

  // Sync theme with localStorage
  useEffect(() => {
    localStorage.setItem('theme', settings.theme);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load Sessions and Settings
  useEffect(() => {
    if (!user) return;

    // Load Settings
    const settingsRef = doc(db, 'users', user.uid);
    getDoc(settingsRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newSettings = {
          language: data.language || 'English',
          location: data.location || 'India',
          theme: data.theme || 'light'
        };
        setSettings(newSettings);
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
      } else {
        // Initialize user profile
        setDoc(settingsRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          ...settings,
          createdAt: Date.now()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    });

    // Listen to Sessions
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ChatSession[];
      setSessions(sessionList);
      
      if (sessionList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessionList[0].id);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/sessions`));

    return () => unsubscribe();
  }, [user]);

  // Load Messages for Active Session
  useEffect(() => {
    if (!user || !activeSessionId) return;

    const messagesRef = collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Message[];
      setMessages(messageList);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/sessions/${activeSessionId}/messages`));

    return () => unsubscribe();
  }, [user, activeSessionId]);

  const createNewChat = async () => {
    if (!user) return;
    
    const sessionId = Date.now().toString();
    const sessionsRef = doc(db, 'users', user.uid, 'sessions', sessionId);
    
    try {
      await setDoc(sessionsRef, {
        id: sessionId,
        userId: user.uid,
        title: "New Consultation",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setActiveSessionId(sessionId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/sessions/${sessionId}`);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !activeSessionId) return;

    const messageId = Date.now().toString();
    const messagesRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', messageId);
    
    const userMessage: Message = {
      id: messageId,
      sessionId: activeSessionId,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setIsTyping(true);

    try {
      await setDoc(messagesRef, userMessage);
      
      // Update session title and updatedAt
      const sessionRef = doc(db, 'users', user.uid, 'sessions', activeSessionId);
      const updates: any = { updatedAt: Date.now() };
      if (messages.length === 0) {
        updates.title = content.split(' ').slice(0, 5).join(' ') + (content.split(' ').length > 5 ? '...' : '');
      }
      await updateDoc(sessionRef, updates);

      const response = await generateLegalResponse([...messages, userMessage], settings);
      const aiResponse = response.text;
      if (response.strategy) {
        setCurrentStrategy(response.strategy);
      }
      
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessageRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', assistantMessageId);
      
      await setDoc(assistantMessageRef, {
        id: assistantMessageId,
        sessionId: activeSessionId,
        role: 'assistant',
        content: aiResponse || "I'm sorry, I couldn't process that request.",
        timestamp: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${activeSessionId}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user || !activeSessionId) return;
    setIsTyping(true);
    
    try {
      const text = await performOCR(file);
      const messageId = Date.now().toString();
      const messagesRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', messageId);
      
      const userMessage: Message = {
        id: messageId,
        sessionId: activeSessionId,
        role: 'user',
        content: `[Document Uploaded: ${file.name}]\n\nPlease analyze this document: \n\n${text.substring(0, 1000)}...`,
        timestamp: Date.now()
      };

      await setDoc(messagesRef, userMessage);

      const response = await generateLegalResponse([...messages, userMessage], settings, text);
      const aiResponse = response.text;
      if (response.strategy) {
        setCurrentStrategy(response.strategy);
      }
      
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessageRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', assistantMessageId);
      
      await setDoc(assistantMessageRef, {
        id: assistantMessageId,
        sessionId: activeSessionId,
        role: 'assistant',
        content: aiResponse || "Document analyzed. How can I help further?",
        timestamp: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${activeSessionId}`);
    } finally {
      setIsTyping(false);
    }
  };

  const updateSessionTitle = async (id: string, title: string) => {
    if (!user) return;
    const sessionRef = doc(db, 'users', user.uid, 'sessions', id);
    try {
      await updateDoc(sessionRef, { title, updatedAt: Date.now() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/sessions/${id}`);
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    const sessionRef = doc(db, 'users', user.uid, 'sessions', id);
    try {
      await deleteDoc(sessionRef);
      if (activeSessionId === id) {
        setActiveSessionId("");
        setMessages([]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sessions/${id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    localStorage.setItem('theme', newSettings.theme);
    
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { ...newSettings });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const fetchWarRoomData = async () => {
    if (!messages.length) return;
    setIsWarRoomLoading(true);
    try {
      const data = await generateWarRoomAnalysis(messages);
      setWarRoomData(data);
    } catch (error) {
      console.error("Failed to fetch War Room data", error);
    } finally {
      setIsWarRoomLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'war-room' && !warRoomData) {
      fetchWarRoomData();
    }
  }, [currentView]);

  return (
    <div className={`flex w-full h-screen bg-brand-bg relative overflow-hidden ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setIsMobileSidebarOpen(false);
            if (view !== 'chat') setIsVoiceOpen(false);
          }}
          onNewChat={() => {
            createNewChat();
            setIsMobileSidebarOpen(false);
          }}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setCurrentView('chat');
            setIsMobileSidebarOpen(false);
          }}
          onDeleteSession={deleteSession}
          onRenameSession={updateSessionTitle}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
          user={user ? { name: user.displayName || "User", email: user.email || "" } : null}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-brand-border flex items-center justify-between px-4 lg:px-8 bg-brand-surface/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4 truncate">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-brand-muted hover:text-brand-primary hover:bg-brand-bg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-serif font-medium text-brand-ink truncate">
              {currentView === 'chat' ? (sessions.find(s => s.id === activeSessionId)?.title || "Consultation") : 
               currentView === 'calculator' ? "Legal Cost Calculator" : 
               currentView === 'war-room' ? "Legal War Room" : "Emergency Help"}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {currentView === 'chat' && (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="relative">
                  <button
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="p-2.5 lg:p-3 rounded-2xl border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-primary transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">Export</span>
                  </button>
                  
                  {isExportMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <button 
                        onClick={() => {
                          const session = sessions.find(s => s.id === activeSessionId);
                          if (session) generateCaseBrief(session, messages);
                          setIsExportMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 text-sm hover:bg-brand-bg transition-colors text-left text-brand-ink"
                      >
                        <FileText className="w-4 h-4 text-brand-primary" />
                        Download Case Brief
                      </button>
                      <button 
                        onClick={() => {
                          // Mock files from messages if needed, or just use a placeholder for now
                          const files = messages.filter(m => m.fileUrl).map(m => ({
                            name: m.fileName || 'Evidence',
                            url: m.fileUrl!,
                            type: m.fileType || 'image/png'
                          }));
                          if (files.length > 0) {
                            generateEvidenceBundle(files);
                          } else {
                            alert('No evidence files found in this session.');
                          }
                          setIsExportMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 text-sm hover:bg-brand-bg transition-colors text-left text-brand-ink border-t border-brand-border"
                      >
                        <Package className="w-4 h-4 text-brand-accent" />
                        Evidence Bundle
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsVoiceOpen(!isVoiceOpen)}
                  className={cn(
                    "p-2.5 lg:p-3 rounded-2xl border transition-all shadow-sm active:scale-95 flex items-center gap-2 group",
                    isVoiceOpen 
                      ? "bg-brand-primary text-white border-brand-primary" 
                      : "bg-brand-bg border-brand-border text-brand-muted hover:text-brand-primary"
                  )}
                >
                  <Mic className={cn("w-5 h-5", isVoiceOpen && "animate-pulse")} />
                  <span className="text-[10px] uppercase tracking-widest font-bold hidden lg:block">Talk</span>
                </button>
              </div>
            )}

            {/* Theme Toggle in Header */}
            <button
              onClick={() => updateUserSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2.5 lg:p-3 rounded-2xl bg-brand-bg border border-brand-border text-brand-muted hover:text-brand-primary transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
              title={settings.theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest font-bold hidden lg:block">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest font-bold hidden lg:block">Dark</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-brand-bg border border-brand-border rounded-full text-brand-muted text-[10px] uppercase tracking-[0.15em] font-bold">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
              Defender AI Online
            </div>
          </div>
        </header>

        {currentView === 'chat' ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <ChatWindow 
                messages={messages} 
                isTyping={isTyping} 
                onSuggestionClick={(suggestion) => setChatInputValue(suggestion)}
              />
              
              {isVoiceOpen && (
                <div className="absolute top-24 right-8 z-20 w-80">
                  <VoiceInterface 
                    onTranscript={(text) => {
                      handleSendMessage(text);
                    }}
                    lastResponse={messages[messages.length - 1]?.role === 'assistant' ? messages[messages.length - 1].content : undefined}
                    isProcessing={isTyping}
                  />
                </div>
              )}

              <ChatInput 
                onSendMessage={handleSendMessage} 
                onFileUpload={handleFileUpload}
                isProcessing={isTyping}
                externalValue={chatInputValue}
                onInputChange={(val) => setChatInputValue(val)}
              />
            </div>

            <AnimatePresence>
              {currentStrategy && (
                <LegalStrategyPanel 
                  strategy={currentStrategy} 
                  onClose={() => setCurrentStrategy(null)} 
                />
              )}
            </AnimatePresence>
          </div>
        ) : currentView === 'calculator' ? (
          <LegalCalculator />
        ) : currentView === 'war-room' ? (
          <WarRoom 
            data={warRoomData} 
            isLoading={isWarRoomLoading} 
            onRefresh={fetchWarRoomData} 
          />
        ) : (
          <EmergencyCards />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={updateUserSettings}
          onClearHistory={async () => {
             // Logic to clear all sessions for the user
             for (const session of sessions) {
               await deleteSession(session.id);
             }
             setIsSettingsOpen(false);
          }}
        />
      </main>
    </div>
  );
}
