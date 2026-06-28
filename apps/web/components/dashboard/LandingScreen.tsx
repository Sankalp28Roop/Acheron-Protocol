'use client';

import { useState } from 'react';

interface LandingScreenProps {
  onGenerate: (type: 'SMS' | 'EMAIL', region: 'IN' | 'UK' | 'US', ttlSeconds: number) => void;
  isGenerating: boolean;
}

const DURATIONS = [
  { label: '1H', value: 3600 },
  { label: '2H', value: 7200 },
  { label: '5H', value: 18000 },
  { label: '12H', value: 43200 },
  { label: '24H', value: 86400 },
  { label: '2W', value: 1209600 },
];

export function LandingScreen({ onGenerate, isGenerating }: LandingScreenProps) {
  const [type, setType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [region, setRegion] = useState<'IN' | 'UK' | 'US'>('IN');
  const [ttl, setTtl] = useState<number>(7200);

  return (
    <div className="panel-titanium rounded-2xl p-8 flex flex-col items-center max-w-2xl w-full mx-auto relative overflow-hidden animate-card-mount">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,126,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-12 h-12 rounded-full border border-[#00d47e]/30 flex items-center justify-center mb-6 bg-zinc-900/50 backdrop-blur">
        <div className="w-4 h-4 bg-[#00d47e] rounded-sm rotate-45 shadow-[0_0_15px_#00d47e]" />
      </div>
      
      <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight mb-2 text-center">
        Initialize Secure Comm Link
      </h2>
      <p className="font-mono text-[11px] text-on-surface-variant leading-relaxed text-center mb-8 max-w-lg">
        Bypass intrusive verification walls without exposing your real identity. Generate self-destructing SMS and Email routing links that vanish from existence the moment their timer expires.
      </p>

      {/* Type Selection */}
      <div className="flex gap-4 w-full mb-6">
        <button
          onClick={() => setType('SMS')}
          className={`flex-1 py-4 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#00e680] ${
            type === 'SMS' 
              ? 'bg-[#00d47e]/10 border-[#00d47e] text-[#00d47e] shadow-[0_0_20px_rgba(0,212,126,0.1)]' 
              : 'panel-titanium-inset text-on-surface hover:border-zinc-600'
          }`}
        >
          SMS Endpoint
        </button>
        <button
          onClick={() => setType('EMAIL')}
          className={`flex-1 py-4 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#00e680] ${
            type === 'EMAIL' 
              ? 'bg-[#00d47e]/10 border-[#00d47e] text-[#00d47e] shadow-[0_0_20px_rgba(0,212,126,0.1)]' 
              : 'panel-titanium-inset text-on-surface hover:border-zinc-600'
          }`}
        >
          Email Endpoint
        </button>
      </div>

      {/* Region Selection (Only for SMS) */}
      <div className={`w-full transition-all duration-300 overflow-hidden ${type === 'SMS' ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 px-1">
          Select Routing Node Region
        </label>
        <div className="flex gap-2 w-full">
          {(['IN', 'UK', 'US'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex-1 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-300 border focus:outline-none focus:ring-1 focus:ring-[#00e680] ${
                region === r
                  ? 'border-[#00d47e]/50 text-[#00d47e] bg-[#00d47e]/5'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 bg-zinc-900/50'
              }`}
            >
              {r} ({r === 'IN' ? '+91' : r === 'UK' ? '+44' : '+1'})
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="w-full mb-8">
        <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 px-1">
          Session Duration
        </label>
        <div className="flex gap-2 w-full">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setTtl(d.value)}
              className={`flex-1 py-2 rounded-lg font-mono text-xs tracking-wider transition-all duration-300 border focus:outline-none focus:ring-1 focus:ring-[#00e680] ${
                ttl === d.value
                  ? 'border-[#00d47e]/50 text-[#00d47e] bg-[#00d47e]/5'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 bg-zinc-900/50'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => onGenerate(type, region, ttl)}
        disabled={isGenerating}
        className="w-full relative overflow-hidden group panel-titanium rounded-xl p-4 cursor-pointer hover:border-[#00d47e] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#00e680] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d47e]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out block" />
        <span className="relative z-10 flex items-center justify-center gap-3 w-full">
          <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-zinc-500 animate-ping' : 'bg-[#00d47e] shadow-[0_0_8px_#00d47e] animate-pulse'}`} />
          <span className="font-display font-bold text-lg text-on-surface tracking-wide group-hover:text-[#00e680] transition-colors">
            {isGenerating ? 'Provisioning...' : 'Establish Secure Link'}
          </span>
        </span>
      </button>
    </div>
  );
}
