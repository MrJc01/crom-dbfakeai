import React from 'react';
import { Download, FileJson, FileText, FileCode2, Database, FileSpreadsheet } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';
import { ExportService } from '../../services/export.service';

export function ExportTab() {
  const { activeTab, activeTable, fields, generatedData } = useDatabase();

  if (activeTab !== 'export') return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Exportando tabela '{activeTable.name}'
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50 flex flex-col items-center text-center hover:border-zinc-700 transition-colors">
            <FileJson className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="font-medium text-zinc-200 mb-1">Formato JSON</h3>
            <p className="text-xs text-zinc-500 mb-4">Exporta os dados como um array de objetos JSON, ideal para APIs e NoSQL.</p>
            <button 
              onClick={() => ExportService.exportJSON(activeTable, generatedData)}
              disabled={generatedData.length === 0}
              className="mt-auto w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Baixar JSON
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50 flex flex-col items-center text-center hover:border-zinc-700 transition-colors">
            <FileText className="w-10 h-10 text-green-500 mb-3" />
            <h3 className="font-medium text-zinc-200 mb-1">Formato CSV</h3>
            <p className="text-xs text-zinc-500 mb-4">Exporta os dados separados por vírgula, ideal para bancos relacionais.</p>
            <button 
              onClick={() => ExportService.exportCSV(activeTable, fields, generatedData)}
              disabled={generatedData.length === 0}
              className="mt-auto w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Baixar CSV
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50 flex flex-col items-center text-center hover:border-zinc-700 transition-colors">
            <FileCode2 className="w-10 h-10 text-blue-500 mb-3" />
            <h3 className="font-medium text-zinc-200 mb-1">Formato SQL</h3>
            <p className="text-xs text-zinc-500 mb-4">Exporta um script com comandos CREATE TABLE e INSERT INTO.</p>
            <button 
              onClick={() => ExportService.exportSQL(activeTable, fields, generatedData)}
              disabled={generatedData.length === 0}
              className="mt-auto w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Baixar SQL
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50 flex flex-col items-center text-center hover:border-zinc-700 transition-colors">
            <Database className="w-10 h-10 text-purple-500 mb-3" />
            <h3 className="font-medium text-zinc-200 mb-1">Banco SQLite (.db)</h3>
            <p className="text-xs text-zinc-500 mb-4">Gera um arquivo de banco de dados SQLite pronto para uso.</p>
            <button 
              onClick={() => ExportService.exportSQLite(activeTable, fields, generatedData)}
              disabled={generatedData.length === 0}
              className="mt-auto w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Baixar SQLite
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950/50 flex flex-col items-center text-center hover:border-zinc-700 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-emerald-500 mb-3" />
            <h3 className="font-medium text-zinc-200 mb-1">Planilha Excel</h3>
            <p className="text-xs text-zinc-500 mb-4">Exporta os dados formatados em uma planilha .xlsx.</p>
            <button 
              onClick={() => ExportService.exportExcel(activeTable, generatedData)}
              disabled={generatedData.length === 0}
              className="mt-auto w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Baixar Excel
            </button>
          </div>
        </div>

        {generatedData.length === 0 && (
          <div className="mt-6 text-center text-sm text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md">
            Aviso: Não há dados para exportar. Gere dados primeiro.
          </div>
        )}
      </div>
    </div>
  );
}
