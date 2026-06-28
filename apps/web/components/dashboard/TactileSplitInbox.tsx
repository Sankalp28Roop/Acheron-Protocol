'use client';

import { useEphemeralLedger } from '@/hooks/useEphemeralLedger';
import type { Credential, Message } from '@/lib/api-client';
import { MessageDetailViewer } from './MessageDetailViewer';
import { OtpQuickReadMatrix } from '../OtpQuickReadMatrix';
import { useState } from 'react';

interface TactileSplitInboxProps {
  credential: Credential | null;
}

export function TactileSplitInbox({ credential }: TactileSplitInboxProps) {
  const { messages, loading } = useEphemeralLedger(credential?.value ?? null);
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  if (!credential) return null;

  return (
    <main className="w-full h-full flex overflow-hidden panel-titanium rounded-2xl">
      {/* ── Left Panel (Transmission Ledger) ───────────────────────────── */}
      <aside className="w-[350px] shrink-0 flex flex-col border-r border-zinc-700/50 bg-zinc-900/40">
        <div className="px-5 py-4 border-b border-zinc-700/50 flex items-center justify-between">
          <h2 className="font-mono text-sm tracking-widest text-on-surface uppercase">Ledger</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e] animate-pulse" />
            <span className="text-[10px] font-mono text-outline uppercase">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">


          {loading && messages.length === 0 && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg animate-pulse bg-zinc-800/30 border border-zinc-700/30"
                />
              ))}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-12 px-4 h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-[#00d47e]/20 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border border-[#00d47e]/50 animate-ping opacity-20" />
                <div className="w-2 h-2 rounded-full bg-[#00d47e] shadow-[0_0_8px_#00d47e]" />
              </div>
              <p className="font-mono text-xs text-outline uppercase tracking-wider leading-relaxed">
                Secure Channel Active [IST]<br />
                <span className="text-on-surface-variant">Awaiting Localized OTP Payload...</span>
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const sender = msg.sender ?? msg.from ?? 'Unknown';
            const time = new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isSelected = selectedMessage?.receivedAt === msg.receivedAt;
            
            return (
              <button
                key={`${msg.receivedAt}-${i}`}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 animate-message-in border focus:outline-none focus:ring-2 focus:ring-[#00e680] ${
                  msg.isOTP ? 'scale-105 shadow-[0_0_15px_rgba(0,212,126,0.3)] my-2' : ''
                } ${
                  isSelected 
                    ? 'panel-titanium-inset border-[#00d47e]/30' 
                    : 'bg-zinc-800/20 border-zinc-700/30 hover:bg-zinc-800/40 hover:border-zinc-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-on-surface truncate pr-2">{sender}</span>
                  <span className="font-mono text-[10px] text-outline shrink-0">{time}</span>
                </div>
                {msg.isOTP ? (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-body text-xs text-on-surface-variant truncate mr-2">{msg.text}</p>
                    <div className="flex flex-col items-end gap-1">
                      <span className="shrink-0 bg-[#00d47e]/20 text-[#00d47e] border border-[#00d47e]/50 px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold tracking-widest uppercase">
                        OTP RECEIVED
                      </span>
                      {msg.otpValue && (
                        <span className="font-mono text-lg font-bold text-on-surface tracking-widest">
                          {msg.otpValue}
                        </span>
                      )}
                    </div>
                  </div>
                ) : msg.subject ? (
                  <p className="font-body text-sm text-on-surface-variant truncate">{msg.subject}</p>
                ) : (
                  <p className="font-body text-sm text-on-surface-variant truncate">{msg.text}</p>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Right Panel (Secure Dial-In Frame) ─────────────────────────── */}
      <article className="flex-1 flex flex-col bg-zinc-950/20">
        {!selectedMessage ? (
          <div className="flex-1 flex items-center justify-center p-8">
            {messages.length > 0 && messages[0].isOTP && messages[0].otpValue ? (
              <div className="w-full max-w-2xl">
                <OtpQuickReadMatrix otpValue={messages[0].otpValue} />
              </div>
            ) : (
              <div className="w-16 h-16 opacity-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div className="px-8 py-6 border-b border-zinc-700/50 bg-zinc-900/30 shrink-0">
              <h3 className="font-body text-lg text-on-surface mb-2">
                {selectedMessage.subject || 'Secure Text Transmission'}
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-on-surface-variant">
                  From: {selectedMessage.sender ?? selectedMessage.from ?? 'Unknown'}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-mono text-xs text-outline">
                  {new Date(selectedMessage.receivedAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden p-8">
              {selectedMessage.html ? (
                <MessageDetailViewer html={selectedMessage.html} />
              ) : (
                <div className="panel-titanium-inset p-6 rounded-xl h-full overflow-y-auto">
                  <p className="font-mono text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.text}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
