import React, { createContext, useContext, useState, useEffect } from 'react';
import { Table, Field, TabType } from '../types';

export interface GenerationProgress {
  isGenerating: boolean;
  generated: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'generating' | 'waiting' | 'done' | 'cancelled' | 'error';
  tableName: string;
}

interface DatabaseContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  activeTableId: string;
  setActiveTableId: (id: string) => void;
  activeTable: Table;
  fields: Field[];
  generatedData: any[];
  setFields: (newFields: Field[] | ((prev: Field[]) => Field[])) => void;
  setGeneratedData: (newData: any[] | ((prev: any[]) => any[])) => void;
  createTable: () => void;
  duplicateTable: (table: Table) => void;
  deleteTable: (id: string) => void;
  renameTable: (id: string, newName: string) => void;
  addField: () => void;
  updateField: (id: string, key: keyof Field, value: string) => void;
  removeField: (id: string) => void;
  
  // Generator State
  chatInput: string;
  setChatInput: (val: string) => void;
  plan: string;
  setPlan: (val: string) => void;
  count: number;
  setCount: (val: number) => void;
  creativity: number;
  setCreativity: (val: number) => void;

  // Generation Progress (global)
  genProgress: GenerationProgress;
  setGenProgress: React.Dispatch<React.SetStateAction<GenerationProgress>>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('structure');
  
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('dbfakeai_tables');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{
      id: 'default',
      name: 'usuarios',
      fields: [
        { id: '1', name: 'id', type: 'NUMBER', description: 'Identificador único sequencial' },
        { id: '2', name: 'nome', type: 'STRING', description: 'Nome completo da pessoa' },
        { id: '3', name: 'email', type: 'STRING', description: 'Endereço de email' },
      ],
      data: []
    }];
  });
  
  const [activeTableId, setActiveTableId] = useState<string>(() => {
    const saved = localStorage.getItem('dbfakeai_tables');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return 'default';
  });

  useEffect(() => {
    localStorage.setItem('dbfakeai_tables', JSON.stringify(tables));
  }, [tables]);

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];
  const fields = activeTable.fields;
  const generatedData = activeTable.data;

  const setFields = (newFields: Field[] | ((prev: Field[]) => Field[])) => {
    setTables(prev => prev.map(t => {
      if (t.id === activeTableId) {
        return { ...t, fields: typeof newFields === 'function' ? newFields(t.fields) : newFields };
      }
      return t;
    }));
  };

  const setGeneratedData = (newData: any[] | ((prev: any[]) => any[])) => {
    setTables(prev => prev.map(t => {
      if (t.id === activeTableId) {
        return { ...t, data: typeof newData === 'function' ? newData(t.data) : newData };
      }
      return t;
    }));
  };

  const createTable = () => {
    const newTable: Table = {
      id: Math.random().toString(36).substring(7),
      name: `nova_tabela_${tables.length + 1}`,
      fields: [{ id: '1', name: 'id', type: 'NUMBER', description: 'ID' }],
      data: []
    };
    setTables([...tables, newTable]);
    setActiveTableId(newTable.id);
  };

  const duplicateTable = (table: Table) => {
    const newTable: Table = {
      ...table,
      id: Math.random().toString(36).substring(7),
      name: `${table.name}_copia`,
    };
    setTables([...tables, newTable]);
    setActiveTableId(newTable.id);
  };

  const deleteTable = (id: string) => {
    if (tables.length === 1) {
      alert('Você não pode excluir a única tabela.');
      return;
    }
    const newTables = tables.filter(t => t.id !== id);
    setTables(newTables);
    if (activeTableId === id) {
      setActiveTableId(newTables[0].id);
    }
  };

  const renameTable = (id: string, newName: string) => {
    setTables(tables.map(t => t.id === id ? { ...t, name: newName } : t));
  };
  
  const addField = () => {
    setFields([...fields, { id: Math.random().toString(36).substring(7), name: '', type: 'STRING', description: '' }]);
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value as any } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const [chatInput, setChatInput] = useState('');
  const [plan, setPlan] = useState('Gere dados realistas de usuários brasileiros.');
  const [count, setCount] = useState(10);
  const [creativity, setCreativity] = useState(0.7);

  const [genProgress, setGenProgress] = useState<GenerationProgress>({
    isGenerating: false, generated: 0, total: 0,
    currentBatch: 0, totalBatches: 0,
    status: 'idle', tableName: ''
  });

  return (
    <DatabaseContext.Provider value={{
      activeTab, setActiveTab,
      tables, setTables, activeTableId, setActiveTableId,
      activeTable, fields, generatedData,
      setFields, setGeneratedData,
      createTable, duplicateTable, deleteTable, renameTable,
      addField, updateField, removeField,
      chatInput, setChatInput,
      plan, setPlan, count, setCount, creativity, setCreativity,
      genProgress, setGenProgress
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
}
