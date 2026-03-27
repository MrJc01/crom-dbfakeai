export type FieldType = 'STRING' | 'NUMBER' | 'BOOLEAN';

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  description: string;
}

export interface Table {
  id: string;
  name: string;
  fields: Field[];
  data: any[];
}

export type TabType = 'browse' | 'structure' | 'generate' | 'export' | 'settings' | 'templates';
