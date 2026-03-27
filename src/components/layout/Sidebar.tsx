import React from 'react';
import { Search, Database, Table as TableIcon, Edit2, Copy, Trash2, Plus } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';

export function Sidebar() {
  const { 
    tables, activeTableId, setActiveTableId, setActiveTab, 
    renameTable, duplicateTable, deleteTable, createTable 
  } = useDatabase();

  return (
    <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800 hidden md:flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-300 font-medium">
          <Database className="w-4 h-4 text-zinc-400" />
          Tabelas
        </div>
        <div className="ml-4 mt-1 space-y-1">
          {tables.map(table => (
            <div key={table.id} className={`group flex items-center justify-between px-2 py-1.5 rounded-md transition-colors ${activeTableId === table.id ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300'}`}>
              <button 
                onClick={() => setActiveTab('browse')}
                onMouseDown={() => setActiveTableId(table.id)}
                className="flex items-center gap-2 flex-1 text-sm font-medium truncate text-left"
              >
                <TableIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{table.name}</span>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => {
                  const newName = prompt('Novo nome da tabela:', table.name);
                  if (newName) renameTable(table.id, newName);
                }} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200" title="Renomear">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => duplicateTable(table)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200" title="Duplicar">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => deleteTable(table.id)} className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400" title="Excluir">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={createTable} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md transition-colors mt-2">
          <Plus className="w-4 h-4" />
          Nova tabela
        </button>
      </div>
    </aside>
  );
}
