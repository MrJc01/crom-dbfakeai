import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || process.env.GEMINI_API_KEY || '');
  const [model, setModel] = useState(() => localStorage.getItem('model') || 'gemini-3.1-pro-preview');
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('onboardingSeen') !== 'true');
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (apiKey) localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);
  
  useEffect(() => {
    if (model) localStorage.setItem('model', model);
  }, [model]);

  return (
    <SettingsContext.Provider value={{
      apiKey, setApiKey,
      model, setModel,
      showOnboarding, setShowOnboarding,
      showTutorial, setShowTutorial,
      currentSlide, setCurrentSlide
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
