'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialApi, getSessionToken, type CreateCredentialPayload } from '@/lib/api-client';

const CREDENTIALS_KEY = 'credentials';

export function useCredentials() {
  // isMounted ensures server render and first client render are identical
  // (query is disabled on both). After mount, query is enabled on client only.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sessionToken = isMounted ? getSessionToken() : '';

  return useQuery({
    queryKey: [CREDENTIALS_KEY, sessionToken],
    queryFn: () => credentialApi.list(sessionToken),
    refetchInterval: 15_000,
    select: (data) => data.credentials,
    enabled: isMounted && sessionToken.length > 0,
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateCredentialPayload, 'sessionToken'>) => {
      const sessionToken = getSessionToken();
      return credentialApi.create({ ...payload, sessionToken });
    },
    onSuccess: () => {
      const sessionToken = getSessionToken();
      void queryClient.invalidateQueries({ queryKey: [CREDENTIALS_KEY, sessionToken] });
    },
  });
}

export function useRevokeCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) => {
      const sessionToken = getSessionToken();
      return credentialApi.revoke(credentialId, sessionToken);
    },
    onSuccess: () => {
      const sessionToken = getSessionToken();
      void queryClient.invalidateQueries({ queryKey: [CREDENTIALS_KEY, sessionToken] });
    },
  });
}
