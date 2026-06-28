'use client';

import { useState } from 'react';
import { CountdownRing } from '@/components/ui/Countdown';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRevokeCredential } from '@/hooks/useCredentials';
import { useCountdown } from '@/hooks/useCountdown';
import type { Credential } from '@/lib/api-client';

interface CredentialCardProps {
  credential: Credential;
  onSelect: (credential: Credential) => void;
  selected: boolean;
}

export function CredentialCard({ credential, onSelect, selected }: CredentialCardProps) {
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const { mutate: revoke, isPending } = useRevokeCredential();
  const { expired } = useCountdown(credential.expiresAt, credential.ttlSeconds);

  const copyValue = async () => {
    await navigator.clipboard.writeText(credential.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      setTimeout(() => setConfirmRevoke(false), 3000);
      return;
    }
    revoke(credential.id);
  };

  return (
    <div
      className="animate-card-mount rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(19,27,46,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${selected ? 'rgba(45,219,222,0.4)' : 'rgba(66,71,80,0.15)'}`,
        boxShadow: selected
          ? '0 0 24px rgba(45,219,222,0.12), 0 4px 32px rgba(0,0,0,0.4)'
          : '0 4px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{ background: 'rgba(45,49,73,0.5)' }}
        onClick={() => onSelect(credential)}
      >
        <div className="flex items-center gap-2">
          <Badge variant={credential.type === 'EMAIL' ? 'email' : 'sms'}>
            {credential.type}
          </Badge>
          {!expired && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          )}
          {expired && <Badge variant="expired">Expired</Badge>}
        </div>
        <CountdownRing
          expiresAt={credential.expiresAt}
          ttlSeconds={credential.ttlSeconds}
          size={44}
        />
      </div>

      {/* Card body */}
      <div className="px-4 py-3 space-y-3">
        {/* Credential value */}
        <div className="group flex items-center gap-2 rounded-md px-3 py-2" style={{ background: 'rgba(11,19,38,0.5)' }}>
          <span className="font-mono text-sm text-primary flex-1 truncate tracking-wide">
            {credential.value}
          </span>
          <button
            onClick={copyValue}
            className="text-on-surface-variant hover:text-primary transition-colors ml-1 shrink-0"
            aria-label="Copy credential"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2ddbde">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelect(credential)}
            className="flex-1 text-xs"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-2h11v2zm5-4H4v-2h16v2zm0-4H4V6h16v4z"/>
            </svg>
            Inbox
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleRevoke}
            loading={isPending}
            disabled={expired}
            className="text-xs"
          >
            {confirmRevoke ? 'Confirm?' : 'Revoke'}
          </Button>
        </div>
      </div>
    </div>
  );
}
