import initSqlJs from 'sql.js';
import * as XLSX from 'xlsx';
import { Field, Table } from '../types';

export const ExportService = {
  exportJSON: (activeTable: Table, generatedData: any[]) => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeTable.name}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  exportCSV: (activeTable: Table, fields: Field[], generatedData: any[]) => {
    if (generatedData.length === 0) return;
    const headers = fields.map(f => f.name).join(',');
    const rows = generatedData.map(row => 
      fields.map(f => {
        let val = row[f.name];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
    const exportFileDefaultName = `${activeTable.name}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  exportSQL: (activeTable: Table, fields: Field[], generatedData: any[]) => {
    if (generatedData.length === 0) return;
    const tableName = activeTable.name;
    const cols = fields.map(f => f.name).join(', ');
    
    let sql = `CREATE TABLE ${tableName} (\n`;
    const colDefs = fields.map(f => {
      let type = 'TEXT';
      if (f.type === 'NUMBER') type = 'NUMERIC';
      if (f.type === 'BOOLEAN') type = 'BOOLEAN';
      return `  ${f.name} ${type}`;
    }).join(',\n');
    sql += colDefs + '\n);\n\n';

    const inserts = generatedData.map(row => {
      const vals = fields.map(f => {
        const val = row[f.name];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      }).join(', ');
      return `INSERT INTO ${tableName} (${cols}) VALUES (${vals});`;
    }).join('\n');
    
    sql += inserts;
    
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportSQLite: async (activeTable: Table, fields: Field[], generatedData: any[]) => {
    if (generatedData.length === 0) return;
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
      const db = new SQL.Database();
      
      const tableName = activeTable.name;
      const colDefs = fields.map(f => {
        let type = 'TEXT';
        if (f.type === 'NUMBER') type = 'NUMERIC';
        if (f.type === 'BOOLEAN') type = 'INTEGER';
        return `${f.name} ${type}`;
      }).join(', ');
      
      db.run(`CREATE TABLE ${tableName} (${colDefs});`);
      
      const cols = fields.map(f => f.name).join(', ');
      const placeholders = fields.map(() => '?').join(', ');
      const insertStmt = db.prepare(`INSERT INTO ${tableName} (${cols}) VALUES (${placeholders})`);
      
      for (const row of generatedData) {
        const vals = fields.map(f => {
          let val = row[f.name];
          if (f.type === 'BOOLEAN' && typeof val === 'boolean') return val ? 1 : 0;
          return val;
        });
        insertStmt.run(vals);
      }
      insertStmt.free();
      
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}.db`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar arquivo SQLite.');
    }
  },

  exportExcel: (activeTable: Table, generatedData: any[]) => {
    if (generatedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(generatedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTable.name.substring(0, 31));
    XLSX.writeFile(workbook, `${activeTable.name}.xlsx`);
  }
};
