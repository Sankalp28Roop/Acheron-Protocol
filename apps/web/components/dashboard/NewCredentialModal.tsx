'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreateCredential } from '@/hooks/useCredentials';

interface NewCredentialModalProps {
  open: boolean;
  onClose: () => void;
}

const TTL_PRESETS = [
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '1 hr', value: 3600 },
  { label: '6 hrs', value: 21600 },
  { label: '24 hrs', value: 86400 },
];

export function NewCredentialModal({ open, onClose }: NewCredentialModalProps) {
  const [type, setType] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [ttlSeconds, setTtlSeconds] = useState(3600);
  const { mutate: create, isPending, error } = useCreateCredential();

  if (!open) return null;

  const handleSubmit = () => {
    create({ type, ttlSeconds }, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(11,19,38,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-high rounded-xl w-full max-w-md mx-4 animate-card-mount overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(45,219,222,0.08), 0 24px 64px rgba(0,0,0,0.6)' }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 bg-surface-highest/80 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-base text-on-surface">New Credential</h2>
            <p className="text-on-surface-variant text-xs font-body mt-0.5">
              Configure your disposable identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-md hover:bg-surface-bright/40"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type selector */}
          <div>
            <p className="text-xs font-body font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Credential type
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(['EMAIL', 'SMS'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="relative p-4 rounded-lg text-left transition-all duration-200"
                  style={{
                    background: type === t ? 'rgba(19,27,46,0.8)' : 'rgba(23,31,51,0.4)',
                    border: `1px solid ${type === t ? 'rgba(45,219,222,0.4)' : 'rgba(66,71,80,0.15)'}`,
                    boxShadow: type === t ? '0 0 16px rgba(45,219,222,0.12)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center"
                      style={{ background: type === t ? 'rgba(45,219,222,0.15)' : 'rgba(66,71,80,0.1)' }}
                    >
                      {t === 'EMAIL' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={type === t ? '#2ddbde' : '#8c919b'}>
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={type === t ? '#2ddbde' : '#8c919b'}>
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold" style={{ color: type === t ? '#2ddbde' : '#c2c6d1' }}>
                        {t === 'EMAIL' ? 'Email' : 'SMS'}
                      </p>
                      <p className="font-body text-xs text-on-surface-variant">
                        {t === 'EMAIL' ? 'Disposable inbox' : 'Burner number'}
                      </p>
                    </div>
                  </div>
                  {type === t && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TTL selector */}
          <div>
            <p className="text-xs font-body font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Expiry duration
            </p>
            <div className="flex flex-wrap gap-2">
              {TTL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setTtlSeconds(preset.value)}
                  className="px-3 py-1.5 rounded-md text-xs font-body font-semibold transition-all duration-150"
                  style={{
                    background: ttlSeconds === preset.value ? 'rgba(45,219,222,0.15)' : 'rgba(45,49,73,0.4)',
                    border: `1px solid ${ttlSeconds === preset.value ? 'rgba(45,219,222,0.4)' : 'rgba(66,71,80,0.2)'}`,
                    color: ttlSeconds === preset.value ? '#2ddbde' : '#c2c6d1',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg p-3" style={{ background: 'rgba(11,19,38,0.5)', border: '1px solid rgba(66,71,80,0.1)' }}>
            <p className="text-xs font-body text-on-surface-variant">
              A disposable <span className="text-primary font-semibold">{type === 'EMAIL' ? 'email address' : 'phone number'}</span> will be generated,
              valid for <span className="text-on-surface font-semibold">{TTL_PRESETS.find(p => p.value === ttlSeconds)?.label}</span>.
              It auto-destructs when the timer expires.
            </p>
          </div>

          {error && (
            <p className="text-error text-xs font-body">
              {(error as Error).message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" size="md" loading={isPending} onClick={handleSubmit} className="flex-1">
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
