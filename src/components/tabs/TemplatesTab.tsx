import React from 'react';
import { Library } from 'lucide-react';
import { useDatabase } from '../../store/DatabaseContext';
import { Table, Field } from '../../types';

export function TemplatesTab() {
  const { activeTab, setTables, tables, setActiveTableId, setActiveTab } = useDatabase();

  if (activeTab !== 'templates') return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-500" />
            Templates de Banco de Dados
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Escolha um template para criar uma nova tabela rapidamente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'E-commerce: Produtos',
              desc: 'Tabela básica de produtos com preço e estoque.',
              fields: [
                { id: '1', name: 'id', type: 'NUMBER', description: 'ID do produto' },
                { id: '2', name: 'nome', type: 'STRING', description: 'Nome do produto' },
                { id: '3', name: 'preco', type: 'NUMBER', description: 'Preço em reais' },
                { id: '4', name: 'em_estoque', type: 'BOOLEAN', description: 'Se está em estoque' },
                { id: '5', name: 'categoria', type: 'STRING', description: 'Categoria do produto' }
              ]
            },
            {
              name: 'Blog: Posts',
              desc: 'Tabela para artigos de um blog.',
              fields: [
                { id: '1', name: 'id', type: 'NUMBER', description: 'ID do post' },
                { id: '2', name: 'titulo', type: 'STRING', description: 'Título do artigo' },
                { id: '3', name: 'conteudo', type: 'STRING', description: 'Resumo do artigo' },
                { id: '4', name: 'autor', type: 'STRING', description: 'Nome do autor' },
                { id: '5', name: 'publicado', type: 'BOOLEAN', description: 'Se está publicado' }
              ]
            },
            {
              name: 'RH: Funcionários',
              desc: 'Dados de funcionários de uma empresa.',
              fields: [
                { id: '1', name: 'id', type: 'NUMBER', description: 'ID do funcionário' },
                { id: '2', name: 'nome', type: 'STRING', description: 'Nome completo' },
                { id: '3', name: 'cargo', type: 'STRING', description: 'Cargo na empresa' },
                { id: '4', name: 'salario', type: 'NUMBER', description: 'Salário atual' },
                { id: '5', name: 'ativo', type: 'BOOLEAN', description: 'Se está ativo na empresa' }
              ]
            }
          ].map((tpl, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50 hover:border-zinc-700 transition-colors flex flex-col">
              <h3 className="font-medium text-zinc-200 mb-1">{tpl.name}</h3>
              <p className="text-xs text-zinc-500 mb-4 flex-1">{tpl.desc}</p>
              <button 
                onClick={() => {
                  const newTable: Table = {
                    id: Math.random().toString(36).substring(7),
                    name: tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''),
                    fields: tpl.fields as Field[],
                    data: []
                  };
                  setTables([...tables, newTable]);
                  setActiveTableId(newTable.id);
                  setActiveTab('structure');
                }}
                className="w-full bg-zinc-800 text-zinc-200 px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-sm font-medium"
              >
                Usar Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
