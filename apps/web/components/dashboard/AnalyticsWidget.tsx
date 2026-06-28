'use client';

import { useEphemeralLedger } from '@/hooks/useEphemeralLedger';
import { useSocket } from '@/lib/socket';

interface AnalyticsWidgetProps {
  credentialValue?: string;
}

export function AnalyticsWidget({ credentialValue }: AnalyticsWidgetProps) {
  const { messages } = useEphemeralLedger(credentialValue || null);
  const { isConnected } = useSocket();

  const totalPackets = messages.length;
  const otpCount = messages.filter(m => m.isOTP).length;

  return (
    <div className="w-full max-w-2xl mx-auto panel-titanium rounded-2xl p-6 flex items-center justify-between shadow-2xl">
      <div className="flex gap-6">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Total Packets
          </span>
          <span className="font-display text-2xl text-on-surface font-bold">
            {totalPackets}
          </span>
        </div>
        <div className="w-px h-10 bg-zinc-800" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Extracted OTPs
          </span>
          <span className="font-display text-2xl text-[#00d47e] font-bold">
            {otpCount}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
          Bridge Status
        </span>
        <div className="flex items-center gap-2 panel-titanium-inset px-3 py-1.5 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#00d47e] shadow-[0_0_8px_#00d47e] animate-pulse' : 'bg-red-500'}`} />
          <span className={`font-mono text-[10px] tracking-widest uppercase ${isConnected ? 'text-[#00d47e]' : 'text-red-500'}`}>
            {isConnected ? 'Ephemeral Data Pipe Active' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}
