/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DatabaseProvider } from './store/DatabaseContext';
import { SettingsProvider, useSettings } from './store/SettingsContext';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { TutorialModal } from './components/modals/TutorialModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GenerationToast } from './components/layout/GenerationToast';
import { StructureTab } from './components/tabs/StructureTab';
import { GenerateTab } from './components/tabs/GenerateTab';
import { BrowseTab } from './components/tabs/BrowseTab';
import { ExportTab } from './components/tabs/ExportTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { TemplatesTab } from './components/tabs/TemplatesTab';
import { useDatabase } from './store/DatabaseContext';
import { LayoutList, Settings2, Sparkles, Download, Settings, Library } from 'lucide-react';

function TabNavigation() {
  const { activeTab, setActiveTab } = useDatabase();

  return (
    <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-2 overflow-x-auto shrink-0 scrollbar-hide">
      <button 
        onClick={() => setActiveTab('browse')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'browse' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <LayoutList className="w-4 h-4" /> Visualizar
      </button>
      <button 
        onClick={() => setActiveTab('structure')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'structure' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <Settings2 className="w-4 h-4" /> Estrutura
      </button>
      <button 
        onClick={() => setActiveTab('generate')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'generate' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <Sparkles className="w-4 h-4" /> Gerar IA
      </button>
      <button 
        onClick={() => setActiveTab('export')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'export' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <Download className="w-4 h-4" /> Exportar
      </button>
      <button 
        onClick={() => setActiveTab('settings')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <Settings className="w-4 h-4" /> Configurações
      </button>
      <button 
        onClick={() => setActiveTab('templates')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
      >
        <Library className="w-4 h-4" /> Templates
      </button>
    </div>
  );
}

function MainApp() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col selection:bg-blue-500/30">
      <OnboardingModal />
      <TutorialModal />

      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          <TabNavigation />

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <StructureTab />
            <GenerateTab />
            <BrowseTab />
            <ExportTab />
            <SettingsTab />
            <TemplatesTab />
          </div>
        </main>
      </div>

      <GenerationToast />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <DatabaseProvider>
        <MainApp />
      </DatabaseProvider>
    </SettingsProvider>
  );
}
