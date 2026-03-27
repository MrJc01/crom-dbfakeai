import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, Timer, X, AlertTriangle } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';
import { useSettings } from '../../store/SettingsContext';
import { generateDataChunk, RateLimitError } from '../../services/ai.service';

export function GenerateTab() {
  const { activeTab, setActiveTab, fields, activeTable, generatedData, setGeneratedData, plan, setPlan, count, setCount, creativity, setCreativity, genProgress, setGenProgress } = useDatabase();
  const { apiKey, model } = useSettings();

  const [isGeneratingData, setIsGeneratingData] = useState(false);
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
    setIsGeneratingData(false);
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setGenProgress(prev => ({ ...prev, isGenerating: false, status: 'cancelled' }));
    setError('Geração cancelada pelo usuário.');
  }, [setGenProgress]);

  const startCountdown = useCallback((seconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      cancelledRef.current = false;
      setIsWaitingRetry(true);
      setRetryCountdown(seconds);
      setGenProgress(prev => ({ ...prev, status: 'waiting' }));

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
          setGenProgress(prev => ({ ...prev, status: 'generating' }));
          resolve(true);
        }
      }, 1000);
    });
  }, [setGenProgress]);

  if (activeTab !== 'generate') return null;

  const handleGenerateData = async () => {
    if (fields.length === 0) {
      setError('O schema precisa ter pelo menos um campo.');
      return;
    }
    const invalidFields = fields.filter(f => !f.name.trim());
    if (invalidFields.length > 0) {
      setError('Todos os campos precisam ter um nome válido.');
      return;
    }
    if (!apiKey) {
      setError('API Key é obrigatória. Configure nas Configurações.');
      return;
    }

    cancelledRef.current = false;
    setIsGeneratingData(true);
    setError('');
    
    const chunkSize = 10;
    const totalBatches = Math.ceil(count / chunkSize);

    setGenProgress({
      isGenerating: true, generated: 0, total: count,
      currentBatch: 0, totalBatches,
      status: 'generating', tableName: activeTable.name
    });

    setActiveTab('browse'); 
    
    let remaining = count;
    let currentData = [...generatedData];
    let batchIndex = 0;
    
    while (remaining > 0 && !cancelledRef.current) {
      const toGenerate = Math.min(remaining, chunkSize);
      
      setGenProgress(prev => ({
        ...prev,
        currentBatch: batchIndex + 1,
        status: 'generating'
      }));

      try {
        const newData = await generateDataChunk({
          schema: fields,
          plan,
          count: toGenerate,
          creativity,
          apiKey,
          model,
          existingData: currentData,
          batchIndex
        });
        
        const stringFields = fields.filter(f => f.type === 'STRING').map(f => f.name);
        
        const uniqueNewData = newData.filter(newItem => {
          return !currentData.some(existingItem => {
            for (const sf of stringFields) {
              const newVal = String(newItem[sf] || '').toLowerCase().trim();
              const existVal = String(existingItem[sf] || '').toLowerCase().trim();
              if (newVal.length > 10 && existVal.length > 10) {
                if (newVal === existVal) return true;
                if (newVal.substring(0, 30) === existVal.substring(0, 30)) return true;
              }
            }
            return false;
          });
        });

        currentData = [...currentData, ...uniqueNewData];
        setGeneratedData(currentData);
        remaining -= toGenerate;
        batchIndex++;

        setGenProgress(prev => ({
          ...prev,
          generated: count - remaining,
          currentBatch: batchIndex,
        }));
        
      } catch (err: any) {
        if (err instanceof RateLimitError) {
          const shouldRetry = await startCountdown(err.retryAfterSeconds);
          if (!shouldRetry) break;
          continue;
        } else {
          setGenProgress(prev => ({ ...prev, isGenerating: false, status: 'error' }));
          setError(err.message || 'Erro ao gerar dados');
          break;
        }
      }
    }
    
    setIsGeneratingData(false);
    if (!cancelledRef.current) {
      setGenProgress(prev => ({ ...prev, isGenerating: false, status: 'done', generated: prev.total }));
    }
  };

  const maxRetry = 60;
  const countdownProgress = retryCountdown / maxRetry;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - countdownProgress);

  return (
    <div className="max-w-3xl space-y-6">
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
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            Executar Geração de Dados
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Preencha a tabela <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">{activeTable.name}</code> com dados sintéticos baseados na estrutura atual.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Instruções de Preenchimento (Prompt)
            </label>
            <textarea 
              value={plan}
              onChange={e => setPlan(e.target.value)}
              rows={3}
              placeholder="Ex: Gere dados de usuários brasileiros. Os emails devem ser corporativos. As idades entre 18 e 65 anos."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Número de Linhas
              </label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={count}
                onChange={e => setCount(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-zinc-500 mt-1.5">Máximo de 100 linhas por execução.</p>
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                <span>Temperatura (Criatividade)</span>
                <span className="text-blue-400 font-mono">{creativity.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0"
                max="2"
                step="0.1"
                value={creativity}
                onChange={e => setCreativity(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1.5">
                <span>Factual (0.0)</span>
                <span>Criativo (2.0)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button 
            onClick={handleGenerateData}
            disabled={isGeneratingData || fields.length === 0}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            {isGeneratingData ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {isGeneratingData ? 'Processando...' : 'Executar (Gerar Dados)'}
          </button>
        </div>
      </div>
    </div>
  );
}
