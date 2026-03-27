import React from 'react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';

export function BrowseTab() {
  const { activeTab, setActiveTab, fields, activeTable, generatedData, setGeneratedData } = useDatabase();

  if (activeTab !== 'browse') return null;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Mostrando linhas <span className="text-zinc-200 font-medium">0 - {generatedData.length > 0 ? generatedData.length - 1 : 0}</span> (Total: {generatedData.length})
        </div>
        <div className="flex items-center gap-4">
          {generatedData.length > 0 && (
            <>
              <button 
                onClick={() => setGeneratedData([])}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Limpar
              </button>
              <button 
                onClick={() => setActiveTab('generate')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Inserir mais
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-auto">
          {generatedData.length > 0 ? (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-zinc-800/80 text-zinc-300 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 border-b border-zinc-700 w-16 text-center text-zinc-500">Linha</th>
                  {fields.map(field => (
                    <th key={field.id} className="px-4 py-3 border-b border-zinc-700 font-semibold">
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {generatedData.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-4 py-2 text-center text-zinc-600 text-xs border-r border-zinc-800/50 bg-zinc-900/50 group-hover:bg-transparent">
                      {i + 1}
                    </td>
                    {fields.map(field => {
                      const val = row[field.name];
                      const isNull = val === null || val === undefined;
                      const isBool = typeof val === 'boolean';
                      
                      return (
                        <td key={field.id} className={`px-4 py-2 ${isNull ? 'text-zinc-600 italic' : 'text-zinc-300'}`}>
                          {isNull ? 'NULL' : isBool ? (val ? 'true' : 'false') : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <TableIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-zinc-400">Tabela vazia</p>
              <p className="text-sm mt-1 max-w-sm">
                A tabela <code className="text-zinc-400">{activeTable.name}</code> não contém dados. Vá para a aba "Gerar IA" para popular esta tabela.
              </p>
              <button 
                onClick={() => setActiveTab('generate')}
                className="mt-6 bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-sm font-medium"
              >
                Ir para Gerar IA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
