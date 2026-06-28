'use client';

import { useState, useEffect } from 'react';

interface Settings {
  stealthMode: boolean;
  autoCopyOTP: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  stealthMode: false,
  autoCopyOTP: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cloakcomms_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load settings from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('cloakcomms_settings', JSON.stringify(next));
      return next;
    });
  };

  return { settings, updateSetting, isLoaded };
}
