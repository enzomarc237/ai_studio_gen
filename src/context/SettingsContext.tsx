import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Settings {
  provider: string;
  api_key: string;
  model: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: { provider: 'gemini', api_key: '', model: '' },
  setSettings: () => {},
  loading: true,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({ provider: 'gemini', api_key: '', model: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/settings')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (data && data.provider) setSettings(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return <SettingsContext.Provider value={{ settings, setSettings, loading }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
