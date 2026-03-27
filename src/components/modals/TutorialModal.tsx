import React from 'react';
import { Database, Settings2, Sparkles, Download, Key, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSettings } from '../../store/SettingsContext';

const tutorialSlides = [
  {
    icon: <Database className="w-12 h-12 text-blue-500" />,
    title: "O que é o dbfakeai?",
    description: "Uma ferramenta poderosa para desenvolvedores e analistas de dados. Gere massas de dados sintéticos, realistas e relacionais usando a inteligência artificial do Google Gemini, tudo diretamente no seu navegador."
  },
  {
    icon: <Settings2 className="w-12 h-12 text-purple-500" />,
    title: "1. Defina a Estrutura",
    description: "Comece criando as colunas da sua tabela. Você pode adicionar campos manualmente ou usar o assistente de IA para gerar um schema completo a partir de uma simples descrição."
  },
  {
    icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
    title: "2. Gere Dados com IA",
    description: "Na aba 'Gerar IA', escreva um prompt detalhando como os dados devem ser. Ajuste a temperatura para dados mais factuais ou criativos e defina a quantidade de linhas."
  },
  {
    icon: <Download className="w-12 h-12 text-emerald-500" />,
    title: "3. Exporte em Vários Formatos",
    description: "Depois de visualizar e validar os dados gerados, exporte-os para o formato que melhor atende sua necessidade: JSON, CSV, Planilha Excel, Script SQL ou SQLite."
  },
  {
    icon: <Key className="w-12 h-12 text-red-500" />,
    title: "Privacidade e Segurança",
    description: "O dbfakeai roda localmente no seu navegador. Sua chave de API do Gemini é salva apenas no seu local storage e as requisições são feitas diretamente para a API do Google."
  }
];

export function TutorialModal() {
  const { showTutorial, setShowTutorial, currentSlide, setCurrentSlide } = useSettings();

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col min-h-[400px]">
        <button 
          onClick={() => setShowTutorial(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="mb-6 p-4 bg-zinc-800/50 rounded-full">
            {tutorialSlides[currentSlide].icon}
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            {tutorialSlides[currentSlide].title}
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
            {tutorialSlides[currentSlide].description}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          
          <div className="flex gap-2">
            {tutorialSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-blue-500' : 'bg-zinc-700 hover:bg-zinc-500'}`}
              />
            ))}
          </div>

          {currentSlide < tutorialSlides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide(prev => Math.min(tutorialSlides.length - 1, prev + 1))}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowTutorial(false)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Começar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
