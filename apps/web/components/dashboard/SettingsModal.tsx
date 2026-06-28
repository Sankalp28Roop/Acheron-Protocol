'use client';

import { useSettings } from '@/hooks/useSettings';
import { useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting, isLoaded } = useSettings();

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#181311]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative panel-titanium rounded-2xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-700/50 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-xl text-on-surface font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e]" />
            System Configuration
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-[#00e680] rounded-full p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Toggle: Stealth Mode */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-sm text-on-surface uppercase tracking-wider mb-1">
                Stealth Mode
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                Mutes audio and visually hidden regions
              </span>
            </div>
            <button
              onClick={() => updateSetting('stealthMode', !settings.stealthMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e680] focus:ring-offset-2 focus:ring-offset-[#181311] ${settings.stealthMode ? 'bg-[#00d47e]' : 'bg-zinc-700'}`}
            >
              <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${settings.stealthMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Toggle: Auto-Copy OTP */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-sm text-on-surface uppercase tracking-wider mb-1">
                Auto-Copy OTPs
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                Instantly writes extracted OTPs to clipboard
              </span>
            </div>
            <button
              onClick={() => updateSetting('autoCopyOTP', !settings.autoCopyOTP)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e680] focus:ring-offset-2 focus:ring-offset-[#181311] ${settings.autoCopyOTP ? 'bg-[#00d47e]' : 'bg-zinc-700'}`}
            >
              <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${settings.autoCopyOTP ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
