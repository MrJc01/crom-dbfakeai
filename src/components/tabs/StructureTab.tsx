import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Loader2, MessageSquare, Trash2, Plus, AlertTriangle, Timer, X } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';
import { useSettings } from '../../store/SettingsContext';
import { generateSchemaFromChat, RateLimitError } from '../../services/ai.service';

export function StructureTab() {
  const { fields, setFields, updateField, removeField, addField, activeTab } = useDatabase();
  const { apiKey } = useSettings();
  
  const [chatInput, setChatInput] = useState('');
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [error, setError] = useState('');

  // Retry state
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [isWaitingRetry, setIsWaitingRetry] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, []);

  const cancelRetry = useCallback(() => {
    cancelledRef.current = true;
    setIsWaitingRetry(false);
    setRetryCountdown(0);
    setIsGeneratingSchema(false);
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setError('Geração cancelada pelo usuário.');
  }, []);

  const startCountdown = useCallback((seconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      cancelledRef.current = false;
      setIsWaitingRetry(true);
      setRetryCountdown(seconds);

      let remaining = seconds;
      retryTimerRef.current = setInterval(() => {
        remaining -= 1;
        setRetryCountdown(remaining);

        if (cancelledRef.current) {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          retryTimerRef.current = null;
          resolve(false);
          return;
        }

        if (remaining <= 0) {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          retryTimerRef.current = null;
          setIsWaitingRetry(false);
          setRetryCountdown(0);
          resolve(true);
        }
      }, 1000);
    });
  }, []);

  if (activeTab !== 'structure') return null;

  const handleAskSchema = async () => {
    if (!chatInput.trim()) return;
    if (!apiKey) {
      setError('API Key é obrigatória. Configure nas Configurações.');
      return;
    }
    cancelledRef.current = false;
    setIsGeneratingSchema(true);
    setError('');

    let success = false;
    while (!success && !cancelledRef.current) {
      try {
        const newFields = await generateSchemaFromChat(chatInput, fields, apiKey);
        setFields(newFields);
        setChatInput('');
        success = true;
      } catch (err: any) {
        if (err instanceof RateLimitError) {
          const shouldRetry = await startCountdown(err.retryAfterSeconds);
          if (!shouldRetry) break;
          continue;
        } else {
          setError(err.message || 'Erro ao gerar schema');
          break;
        }
      }
    }
    setIsGeneratingSchema(false);
  };

  const maxRetry = 60;
  const progress = retryCountdown / maxRetry;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* RETRY POPUP OVERLAY */}
      {isWaitingRetry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Limite de Cota Atingido</h3>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed">
              A API do Gemini Free atingiu o limite de requisições por minuto. 
              Aguardando automaticamente para tentar novamente...
            </p>

            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-zinc-100 tabular-nums">{retryCountdown}</span>
                <span className="text-xs text-zinc-500">segundos</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-500 leading-relaxed">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium mb-1">
                <Timer className="w-3.5 h-3.5" /> Limite do Plano Gratuito
              </div>
              O Gemini Free permite até <strong className="text-zinc-300">5 requisições/minuto</strong> por modelo. 
              A geração retomará automaticamente ao final do timer.
            </div>

            <button
              onClick={cancelRetry}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors border border-zinc-700"
            >
              <X className="w-4 h-4" />
              Cancelar e Parar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Gerar estrutura com IA
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ex: Tabela de produtos com nome, preço, categoria e em estoque..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleAskSchema()}
          />
          <button 
            onClick={handleAskSchema}
            disabled={isGeneratingSchema || !chatInput.trim()}
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors whitespace-nowrap"
          >
            {isGeneratingSchema ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            Executar
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3 w-1/4">Nome do Campo</th>
                <th className="px-4 py-3 w-40">Tipo</th>
                <th className="px-4 py-3">Descrição (Contexto IA)</th>
                <th className="px-4 py-3 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-center text-zinc-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={field.name}
                      onChange={e => updateField(field.id, 'name', e.target.value)}
                      placeholder="nome_campo"
                      className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-blue-500 focus:bg-zinc-950 rounded px-2 py-1 text-zinc-200 focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={field.type}
                      onChange={e => updateField(field.id, 'type', e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-blue-500 focus:bg-zinc-950 rounded px-2 py-1 text-zinc-200 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="STRING" className="bg-zinc-900">VARCHAR (Texto)</option>
                      <option value="NUMBER" className="bg-zinc-900">INT/FLOAT (Número)</option>
                      <option value="BOOLEAN" className="bg-zinc-900">TINYINT (Booleano)</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={field.description}
                      onChange={e => updateField(field.id, 'description', e.target.value)}
                      placeholder="Instrução para a IA..."
                      className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-blue-500 focus:bg-zinc-950 rounded px-2 py-1 text-zinc-400 focus:text-zinc-200 focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => removeField(field.id)} 
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800"
                      title="Remover campo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Nenhum campo definido.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={addField} 
            className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar coluna
          </button>
        </div>
      </div>
    </div>
  );
}
