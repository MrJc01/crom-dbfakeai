import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Database } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';

export function GenerationToast() {
  const { genProgress } = useDatabase();
  const [visible, setVisible] = useState(false);
  const [doneTimeout, setDoneTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (genProgress.status === 'generating' || genProgress.status === 'waiting') {
      setVisible(true);
      if (doneTimeout) { clearTimeout(doneTimeout); setDoneTimeout(null); }
    } else if (genProgress.status === 'done' || genProgress.status === 'cancelled' || genProgress.status === 'error') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      setDoneTimeout(t);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [genProgress.status]);

  if (!visible) return null;

  const pct = genProgress.total > 0 ? Math.round((genProgress.generated / genProgress.total) * 100) : 0;

  const statusConfig = {
    generating: { icon: <Loader2 className="w-4 h-4 animate-spin text-blue-400" />, label: 'Gerando...', barColor: 'bg-blue-500' },
    waiting:    { icon: <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />, label: 'Aguardando cota...', barColor: 'bg-yellow-500' },
    done:       { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: 'Concluído!', barColor: 'bg-emerald-500' },
    cancelled:  { icon: <XCircle className="w-4 h-4 text-zinc-400" />, label: 'Cancelado', barColor: 'bg-zinc-500' },
    error:      { icon: <XCircle className="w-4 h-4 text-red-400" />, label: 'Erro', barColor: 'bg-red-500' },
    idle:       { icon: null, label: '', barColor: '' },
  };

  const cfg = statusConfig[genProgress.status];

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-bottom-2">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl shadow-black/50 w-72 overflow-hidden">
        {/* Header */}
        <div className="px-3.5 py-2.5 flex items-center gap-2.5">
          {cfg.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200 truncate flex items-center gap-1.5">
                <Database className="w-3 h-3 text-zinc-500" />
                {genProgress.tableName || 'Tabela'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 ml-2 shrink-0">{pct}%</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-zinc-500">{cfg.label}</span>
              <span className="text-[10px] text-zinc-500 tabular-nums">
                {genProgress.generated}/{genProgress.total} linhas
                {genProgress.totalBatches > 0 && (
                  <> · Batch {genProgress.currentBatch}/{genProgress.totalBatches}</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800 w-full">
          <div 
            className={`h-full ${cfg.barColor} transition-all duration-500 ease-out`}
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
