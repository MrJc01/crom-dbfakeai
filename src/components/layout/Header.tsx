import React from 'react';
import { Database, HelpCircle } from 'lucide-react';
import { useSettings } from '../../store/SettingsContext';

export function Header() {
  const { setShowTutorial, setCurrentSlide } = useSettings();

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-md">
          <Database className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-100 hidden sm:block">dbfakeai</h1>
      </div>
      <button
        onClick={() => { setShowTutorial(true); setCurrentSlide(0); }}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-md"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Como funciona</span>
      </button>
    </header>
  );
}
