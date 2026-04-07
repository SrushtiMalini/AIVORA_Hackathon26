import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  MapPin, 
  Moon, 
  Sun, 
  Shield, 
  Trash2,
  Search,
  Check,
  Settings
} from 'lucide-react';
import { Language, UserSettings } from '../types';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onClearHistory: () => void;
}

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 
  'Russian', 'Portuguese', 'Italian', 'Korean', 'Bengali', 'Marathi', 'Telugu', 
  'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Japan', 'China', 'Brazil', 'Russia', 'South Africa', 'United Arab Emirates', 'Singapore', 
  'Spain', 'Italy', 'Mexico', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 
  'New Zealand', 'Ireland', 'Belgium', 'Austria', 'Portugal', 'Greece', 'Turkey', 'Israel', 
  'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Egypt', 'Nigeria', 'Kenya', 
  'Argentina', 'Chile', 'Colombia', 'Peru', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 
  'Philippines', 'South Korea', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'
];

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory
}: SettingsModalProps) {
  const [langSearch, setLangSearch] = useState("");
  const [locSearch, setLocSearch] = useState("");
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  // Reset local settings when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const filteredLanguages = LANGUAGES.filter(l => 
    l.toLowerCase().includes(langSearch.toLowerCase())
  );

  const filteredLocations = COUNTRIES.filter(l => 
    l.toLowerCase().includes(locSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-brand-surface rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-brand-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-bg shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary rounded-[1.25rem] text-white shadow-lg shadow-brand-primary/20">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-brand-ink">Preferences</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-ink"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
          {/* Language Picker */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">
              <Globe className="w-4 h-4" />
              <span>Language Preference</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Search language..."
                className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all text-sm font-medium"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocalSettings({ ...localSettings, language: lang })}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all",
                    localSettings.language === lang
                      ? "bg-brand-primary border-brand-primary text-brand-primary-fg shadow-lg shadow-brand-primary/20"
                      : "bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/30 hover:bg-brand-bg"
                  )}
                >
                  {lang}
                  {localSettings.language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Location Picker */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Search city or state..."
                className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/30 transition-all text-sm font-medium"
                value={locSearch}
                onChange={(e) => setLocSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocalSettings({ ...localSettings, location: loc })}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all",
                    localSettings.location === loc
                      ? "bg-brand-primary border-brand-primary text-brand-primary-fg shadow-lg shadow-brand-primary/20"
                      : "bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/30 hover:bg-brand-bg"
                  )}
                >
                  {loc}
                  {localSettings.location === loc && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <section className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-[0.98]"
            >
              Save Preferences
            </button>
          </section>

          {/* Danger Zone */}
          <section className="pt-8 border-t border-brand-border">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Chat History
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
