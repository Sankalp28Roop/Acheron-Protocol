'use client';

import { useState } from 'react';
import type { Credential } from '@/lib/api-client';

interface ChronographDisplayCardProps {
  credential: Credential | null;
  secondsRemaining: number;
  onRefresh?: () => void;
  onTerminate?: () => void;
  onRegionChange?: (region: 'IN' | 'UK' | 'US') => void;
  activeRegion?: 'IN' | 'UK' | 'US';
}

export function ChronographDisplayCard({
  credential,
  secondsRemaining,
  onRefresh,
  onTerminate,
  onRegionChange,
  activeRegion = 'IN'
}: ChronographDisplayCardProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    if (!credential) return;
    navigator.clipboard.writeText(credential.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Calculate percentage for circular progress
  const totalSeconds = credential?.ttlSeconds || 1;
  const percentage = (secondsRemaining / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatCredentialValue = (val: string, type: string) => {
    if (type === 'SMS' && val.startsWith('+91')) {
      // Format +91XXXXXXXXXX to +91 XXXX XXX XXX
      return `+91 ${val.slice(3, 7)} ${val.slice(7, 10)} ${val.slice(10)}`;
    }
    return val;
  };

  if (!credential) return null;

  return (
    <div className={`panel-titanium rounded-2xl p-8 flex flex-col items-center max-w-2xl w-full mx-auto relative overflow-hidden group transition-all duration-300 border-2 ${copied ? 'border-[#00e680] shadow-[0_0_30px_rgba(0,230,128,0.4)] animate-pulse' : 'border-transparent'}`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,126,0.08)_0%,transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Type Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          {credential.type} Active
        </span>
      </div>

      {/* Main Display */}
      <div className="mt-6 flex flex-col items-center">
        {/* Routing Region Selector */}
        {credential.type === 'SMS' && (
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e] animate-pulse" />
            <select
              value={activeRegion}
              onChange={(e) => onRegionChange?.(e.target.value as 'IN' | 'UK' | 'US')}
              className="bg-transparent border border-zinc-700/50 rounded-md py-1 px-2 text-[10px] font-mono tracking-widest text-[#00d47e] uppercase focus:outline-none focus:ring-1 focus:ring-[#00e680] appearance-none cursor-pointer hover:border-[#00e680]/50 transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300d47e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center', backgroundSize: '12px', paddingRight: '1.5rem' }}
            >
              <option value="IN" className="bg-[#181311] text-zinc-300">IN (+91)</option>
              <option value="UK" className="bg-[#181311] text-zinc-300">UK (+44)</option>
              <option value="US" className="bg-[#181311] text-zinc-300">US (+1)</option>
            </select>
          </div>
        )}

        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Mechanical Countdown Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="rgba(63,63,70,0.5)"
              strokeWidth="2"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="#00d47e"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,126,0.5))' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="font-mono text-xl text-on-surface font-bold">
              {formatTime(secondsRemaining)}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-outline mt-1">
              TTL REMAINING
            </span>
          </div>
        </div>

        {/* Credential Value */}
        <button className="panel-titanium-inset px-6 py-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[#00d47e]/50 transition-colors duration-300 group/copy relative focus:outline-none focus:ring-2 focus:ring-[#00e680]" onClick={handleCopy}>
          <span className="font-mono text-2xl tracking-tight text-on-surface">
            {formatCredentialValue(credential.value, credential.type)}
          </span>
          <span className="text-on-surface-variant group-hover/copy:text-[#00d47e] transition-colors">
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          
          <span className={`absolute -right-4 translate-x-full bg-zinc-900/90 backdrop-blur border border-[#00e680]/50 text-[#00e680] px-3 py-1.5 rounded-md font-mono text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,230,128,0.2)] whitespace-nowrap transition-all duration-300 pointer-events-none block ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
            Copied to Ledger
          </span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 w-full justify-center">
        <button 
          onClick={onRefresh}
          className="panel-titanium px-6 py-2 rounded-full font-display text-sm tracking-wide text-on-surface hover:text-[#00d47e] hover:border-[#00d47e]/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e680]"
        >
          Refresh
        </button>
        <button 
          onClick={onTerminate}
          className="panel-titanium px-6 py-2 rounded-full font-display text-sm tracking-wide text-on-surface hover:text-error hover:border-error/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e680]"
        >
          Destroy & Go Back
        </button>
      </div>
    </div>
  );
}
