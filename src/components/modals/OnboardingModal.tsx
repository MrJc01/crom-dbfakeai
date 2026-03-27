import React from 'react';
import { Sparkles, Key, Info } from 'lucide-react';
import { useSettings } from '../../store/SettingsContext';

export function OnboardingModal() {
  const { apiKey, setApiKey, showOnboarding, setShowOnboarding } = useSettings();

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">Bem-vindo ao dbfakeai</h2>
        </div>
        
        <div className="space-y-4 text-zinc-300 text-sm">
          <p>Esta ferramenta permite gerar dados sintéticos realistas usando Inteligência Artificial.</p>
          <ul className="space-y-2 list-disc pl-5 text-zinc-400">
            <li>Defina a <strong>Estrutura</strong> da sua tabela (manualmente ou com IA).</li>
            <li>Vá em <strong>Gerar IA</strong> para criar os dados em lotes.</li>
            <li>Visualize os resultados em tempo real na aba <strong>Visualizar</strong>.</li>
            <li>Exporte para JSON ou CSV na aba <strong>Exportar</strong>.</li>
          </ul>
          
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mt-4">
            <h3 className="font-medium text-zinc-200 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" /> Configuração da API
            </h3>
            {process.env.GEMINI_API_KEY ? (
              <p className="text-green-400 text-xs flex items-center gap-1">
                <Info className="w-3 h-3" /> Chave de API detectada no ambiente. Configuração opcional.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-yellow-400 text-xs flex items-center gap-1">
                  <Info className="w-3 h-3" /> Chave de API não detectada. É obrigatório configurar.
                </p>
                <input 
                  type="password"
                  placeholder="Cole sua Gemini API Key aqui..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => {
              if (!process.env.GEMINI_API_KEY && !apiKey.trim()) {
                alert('Por favor, insira uma chave de API para continuar.');
                return;
              }
              setShowOnboarding(false);
              localStorage.setItem('onboardingSeen', 'true');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Começar a usar
          </button>
        </div>
      </div>
    </div>
  );
}
