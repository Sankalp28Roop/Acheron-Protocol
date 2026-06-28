'use client';

import { useLuxuryLifecycle } from '@/hooks/useLuxuryLifecycle';
import { useCreateCredential, useRevokeCredential } from '@/hooks/useCredentials';
import { ChronographDisplayCard } from '@/components/dashboard/ChronographDisplayCard';
import { TactileSplitInbox } from '@/components/dashboard/TactileSplitInbox';
import { LandingScreen } from '@/components/dashboard/LandingScreen';
import { AnalyticsWidget } from '@/components/dashboard/AnalyticsWidget';
import { SettingsModal } from '@/components/dashboard/SettingsModal';
import { useState } from 'react';
import { LuxurySkeleton } from '@/components/ui/LuxurySkeleton';
import { ParticleBackground } from '@/components/particles/ParticleBackground';
import { AriaLiveRegion } from '@/components/AriaLiveRegion';
import { DeveloperControlOverlay } from '@/components/dev/DeveloperControlOverlay';

export default function DashboardClient() {
  const { 
    isLoading, 
    activeCredential, 
    secondsRemaining,
    setActiveCredential
  } = useLuxuryLifecycle();
  
  const { mutateAsync: createCredential, isPending: isCreating } = useCreateCredential();
  const { mutateAsync: revokeCredential } = useRevokeCredential();
  const [activeRegion, setActiveRegion] = useState<'IN' | 'UK' | 'US'>('IN');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRegionChange = async (region: 'IN' | 'UK' | 'US') => {
    setActiveRegion(region);
    
    // 1. Tear down tracking loop (revoke current active SMS credential)
    if (activeCredential && activeCredential.type === 'SMS') {
      try {
        await revokeCredential(activeCredential.id);
      } catch (e) {
        console.error('Failed to revoke previous credential:', e);
      }
    }
    
    // 2. Establish new real-time connection seamlessly (create new credential)
    await createCredential({ type: 'SMS', ttlSeconds: 7200, region });
  };

  const handleGenerate = async (type: 'SMS' | 'EMAIL', region: 'IN' | 'UK' | 'US', ttlSeconds: number) => {
    if (type === 'SMS') {
      setActiveRegion(region);
    }
    await createCredential({ type, ttlSeconds, region: type === 'SMS' ? region : undefined });
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center pb-12" style={{ zIndex: 1 }}>
      <AriaLiveRegion />
      {/* Ambient luxury particle background - optional, can keep for depth */}
      <ParticleBackground />

      {/* Luxury App Shell */}
      <div className="relative z-10 w-full max-w-[1400px] flex flex-col min-h-screen px-6 pt-12 gap-8">
        
        {/* Header / Brand */}
        <header className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center gap-4">
            {activeCredential && (
              <button 
                onClick={async () => {
                  try {
                    await revokeCredential(activeCredential.id);
                  } catch (e) {
                    console.error('Failed to revoke credential:', e);
                  }
                  setActiveCredential(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center panel-titanium text-on-surface-variant hover:text-error hover:border-error/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00e680]"
                aria-label="Go Back"
                title="Destroy & Go Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#00d47e]/30 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#00d47e] rounded-sm rotate-45 shadow-[0_0_12px_#00d47e]" />
              </div>
              <h1 className="font-display font-bold text-xl tracking-tight text-on-surface">
                Acheron Link
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeCredential && (
              <div className="panel-titanium-inset px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                  Secure Link Active
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center panel-titanium text-on-surface-variant hover:text-[#00d47e] hover:border-[#00d47e]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00e680]"
              aria-label="Open Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Hero Section: Chronograph Display or Landing Screen */}
        <section className="w-full flex flex-col items-center mt-4">
          {isLoading ? (
            <LuxurySkeleton type="hero" />
          ) : !activeCredential ? (
            <LandingScreen onGenerate={handleGenerate} isGenerating={isCreating} />
          ) : (
            <div className="w-full flex flex-col items-center gap-6 animate-card-mount">
              <ChronographDisplayCard 
                credential={activeCredential}
                secondsRemaining={secondsRemaining}
                activeRegion={activeRegion}
                onRegionChange={handleRegionChange}
                onRefresh={() => window.location.reload()}
                onTerminate={async () => {
                  try {
                    await revokeCredential(activeCredential.id);
                  } catch (e) {
                    console.error('Failed to revoke credential:', e);
                  }
                  setActiveCredential(null);
                }}
              />
              <AnalyticsWidget credentialValue={activeCredential.value} />
            </div>
          )}
        </section>

        {/* Split Inbox Section */}
        <section className="w-full flex-1 flex flex-col mt-8 animate-card-mount" style={{ minHeight: '600px' }}>
          {isLoading ? (
            <div className="w-full h-full flex gap-4">
              <div className="w-[350px] shrink-0 h-full"><LuxurySkeleton type="inbox" /></div>
              <div className="flex-1 h-full"><LuxurySkeleton type="inbox" /></div>
            </div>
          ) : !activeCredential ? (
            <div className="w-full flex flex-col gap-6" style={{ minHeight: '300px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card */}
                <div className="panel-titanium rounded-2xl p-8 flex flex-col items-start relative overflow-hidden group hover:scale-[1.01] hover:border-[#00e680]/30 hover:shadow-[0_0_30px_rgba(0,230,128,0.05)] transition-all duration-300 ease-in-out cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00d47e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-700/50 flex items-center justify-center mb-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h4 className="font-mono text-[10px] text-[#00e680] uppercase tracking-widest mb-2">Ephemeral Architecture</h4>
                  <h3 className="font-display text-xl text-on-surface font-bold tracking-tight mb-4">Zero Logs, Absolute Privacy</h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    We do not store, log, or cache your received messages. Once your session duration expires, the endpoint is completely torn down and all routed data is permanently wiped from our memory nodes.
                  </p>
                </div>

                {/* Right Card */}
                <div className="panel-titanium rounded-2xl p-8 flex flex-col items-start relative overflow-hidden group hover:scale-[1.01] hover:border-[#00e680]/30 hover:shadow-[0_0_30px_rgba(0,230,128,0.05)] transition-all duration-300 ease-in-out cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00d47e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-700/50 flex items-center justify-center mb-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <h4 className="font-mono text-[10px] text-[#00e680] uppercase tracking-widest mb-2">Eliminate Spam & Targeted Tracking</h4>
                  <h3 className="font-display text-xl text-on-surface font-bold tracking-tight mb-4">Bypass Comm Walls</h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    Use our global routing nodes to bypass mandatory registration forms, sketchy downloads, or verification checkpoints. Keep your real inbox clean and your personal phone number protected from marketing trackers and data breaches.
                  </p>
                </div>
              </div>

              {/* Live Network Status Indicator */}
              <div className="flex items-center gap-3 px-2 py-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e680] shadow-[0_0_8px_#00e680] animate-pulse" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                  All Routing Nodes Operational &nbsp;|&nbsp; Active Links: 1,482
                </span>
              </div>

              {/* Terminal Interactive Area */}
              <div className="w-full panel-titanium rounded-2xl p-6 min-h-[160px] flex items-center justify-center bg-[#0a0a0a]/60 border-zinc-800/60 backdrop-blur-md relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00e680]/20 to-transparent opacity-50" />
                 <p className="font-mono text-sm text-zinc-600 tracking-wider flex items-center gap-2">
                   [Awaiting incoming transmission...]
                   <span className="w-2 h-4 bg-[#00e680]/40 animate-pulse inline-block" />
                 </p>
              </div>
            </div>
          ) : (
            <TactileSplitInbox credential={activeCredential} />
          )}
        </section>

        {/* Footer */}
        <footer className="w-full py-8 mt-auto border-t border-zinc-800/50 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="max-w-xl">
              <h5 className="font-display text-sm text-on-surface font-bold mb-2">About Acheron Link</h5>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Acheron Link was engineered to solve a modern web crisis: the aggressive collection of personal phone numbers and emails. We provide on-demand, disposable gateway nodes to give you complete control over your digital perimeter. No sign-ups, no tracking, just instant communication cloaking.
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-1 mt-auto">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#00e680]">
                End-to-End Ephemeral Encryption
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-outline">
                v2.0.0 · Luxury Edition
              </span>
            </div>
          </div>
        </footer>

      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DeveloperControlOverlay />
    </main>
  );
}
