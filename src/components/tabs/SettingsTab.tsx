import React from 'react';
import { Settings } from 'lucide-react';
import { useSettings } from '../../store/SettingsContext';
import { useDatabase } from '../../store/DatabaseContext';

export function SettingsTab() {
  const { apiKey, setApiKey, model, setModel } = useSettings();
  const { activeTab } = useDatabase();

  if (activeTab !== 'settings') return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Configurações
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Gemini API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={process.env.GEMINI_API_KEY ? "Chave configurada no ambiente (opcional substituir)" : "Insira sua API Key"}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1.5">
              Sua chave é salva apenas localmente no seu navegador.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Modelo de IA
            </label>
            <select 
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Melhor para dados complexos)</option>
              <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Mais rápido)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
