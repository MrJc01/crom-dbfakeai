import { GoogleGenAI, Type } from '@google/genai';
import { Field, FieldType } from '../types';

const typeMap: Record<FieldType, Type> = {
  'STRING': Type.STRING,
  'NUMBER': Type.NUMBER,
  'BOOLEAN': Type.BOOLEAN
};

/**
 * Erro customizado para Rate Limit (429).
 * Carrega o tempo de espera recomendado pela API.
 */
export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Analisa o corpo do erro da API e, se for 429 (RESOURCE_EXHAUSTED),
 * lança um RateLimitError com o tempo de retry extraído.
 */
function handleApiError(err: any): never {
  const errMsg = err?.message || String(err);

  try {
    const jsonMatch = errMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.code === 429 || parsed?.error?.status === 'RESOURCE_EXHAUSTED') {
        let retrySeconds = 60;
        const details = parsed?.error?.details;
        if (Array.isArray(details)) {
          const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo'));
          if (retryInfo?.retryDelay) {
            const match = retryInfo.retryDelay.match(/([\d.]+)/);
            if (match) retrySeconds = Math.ceil(parseFloat(match[1]));
          }
        }
        retrySeconds = Math.max(retrySeconds, 60);
        throw new RateLimitError(
          `Cota excedida. A API recomenda aguardar ${retrySeconds}s antes de tentar novamente.`,
          retrySeconds
        );
      }
    }
  } catch (parseErr) {
    if (parseErr instanceof RateLimitError) throw parseErr;
  }

  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
    throw new RateLimitError(
      'Cota excedida. Aguarde 60 segundos antes de tentar novamente.',
      60
    );
  }

  // 503 = API temporariamente indisponível (overloaded)
  if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded')) {
    throw new RateLimitError(
      'API temporariamente indisponível (503). Tentando novamente em 30s...',
      30
    );
  }

  throw err;
}

export async function generateSchemaFromChat(prompt: string, currentSchema: Field[], apiKey: string): Promise<Field[]> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a database schema expert. The user wants to create or modify a database schema.
Current schema: ${JSON.stringify(currentSchema)}
User request: ${prompt}
Return the new schema as a list of fields.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The name of the field (camelCase)" },
              type: { type: Type.STRING, description: "The type of the field. MUST be one of: STRING, NUMBER, BOOLEAN" },
              description: { type: Type.STRING, description: "A description of what the field contains" }
            },
            required: ["name", "type", "description"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const parsed = JSON.parse(text);
    return parsed.map((f: any) => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      type: f.type as FieldType,
      description: f.description
    }));
  } catch (err: any) {
    handleApiError(err);
  }
}

/**
 * Extrai uma amostra representativa dos dados existentes para enviar como contexto ao modelo.
 * Limita a 15 itens (últimos 10 + 5 aleatórios) para não explodir o token count.
 */
function buildExistingSampleSummary(existingData: any[], fields: Field[]): string {
  if (existingData.length === 0) return '';

  const stringFields = fields.filter(f => f.type === 'STRING').map(f => f.name);
  const numberFields = fields.filter(f => f.type === 'NUMBER').map(f => f.name);

  // Coleta valores STRING já usados para evitar repetição
  const usedStringValues: Record<string, Set<string>> = {};
  for (const fname of stringFields) {
    usedStringValues[fname] = new Set<string>();
    for (const row of existingData) {
      if (row[fname]) usedStringValues[fname].add(String(row[fname]));
    }
  }

  // Encontra o maior valor numérico para continuidade de IDs
  const maxNumbers: Record<string, number> = {};
  for (const fname of numberFields) {
    let max = 0;
    for (const row of existingData) {
      const val = Number(row[fname]);
      if (!isNaN(val) && val > max) max = val;
    }
    maxNumbers[fname] = max;
  }

  let summary = `\n\n=== IMPORTANT CONTEXT: EXISTING DATA ===\n`;
  summary += `The database already has ${existingData.length} rows.\n`;

  // IDs devem continuar
  for (const [fname, maxVal] of Object.entries(maxNumbers)) {
    if (maxVal > 0) {
      summary += `- Field "${fname}": The highest existing value is ${maxVal}. Start new values from ${maxVal + 1} and increment sequentially.\n`;
    }
  }

  // Valores string já usados (sample para não explodir tokens)
  for (const [fname, valSet] of Object.entries(usedStringValues)) {
    if (valSet.size > 0) {
      const sampleVals = Array.from(valSet).slice(-30); // Últimos 30 valores
      summary += `- Field "${fname}": The following values are ALREADY USED (DO NOT repeat or paraphrase these): ${JSON.stringify(sampleVals)}\n`;
    }
  }

  summary += `=== END CONTEXT ===\n`;
  return summary;
}

/**
 * Gera temas/categorias aleatórias para injetar diversidade no prompt.
 */
function generateDiversitySeed(): string {
  const themes = [
    'finanças pessoais', 'culinária internacional', 'astronomia', 'história antiga',
    'neurociência', 'arquitetura', 'filosofia', 'música clássica', 'física quântica',
    'biologia marinha', 'moda sustentável', 'fotografia', 'arqueologia', 'robótica',
    'design de jogos', 'literatura fantástica', 'vulcanologia', 'criptografia',
    'enologia', 'permacultura', 'cinema independente', 'paleontologia', 'ópera',
    'esportes radicais', 'biotecnologia', 'grafeno', 'aviação', 'cerâmica',
    'apicultura', 'etologia', 'cartografia', 'origami', 'mixologia',
    'nanotecnologia', 'geopolítica', 'oceanografia', 'dança contemporânea',
    'silvicultura', 'etnomusicologia', 'computação quântica', 'história da arte',
    'meteorologia', 'psicologia cognitiva', 'astrobiologia', 'sociolinguística',
    'energia nuclear', 'espeleologia', 'inteligência artificial', 'teatro',
    'medicina esportiva', 'agricultura vertical', 'mineração espacial'
  ];

  // Seleciona 5 temas aleatórios como "sugestão de diversidade"
  const shuffled = themes.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).join(', ');
}

export interface GenerateChunkOptions {
  schema: Field[];
  plan: string;
  count: number;
  creativity: number;
  apiKey: string;
  model: string;
  existingData: any[];
  batchIndex: number;
}

export async function generateDataChunk(options: GenerateChunkOptions): Promise<any[]> {
  const { schema, plan, count, creativity, apiKey, model, existingData, batchIndex } = options;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const field of schema) {
      properties[field.name] = {
        type: typeMap[field.type],
        description: field.description
      };
      required.push(field.name);
    }

    const responseSchema = {
      type: Type.ARRAY,
      description: `A list of exactly ${count} generated records.`,
      items: {
        type: Type.OBJECT,
        properties,
        required
      }
    };

    const existingContext = buildExistingSampleSummary(existingData, schema);
    const diversityThemes = generateDiversitySeed();
    const batchSeed = Math.random().toString(36).substring(2, 10);

    const prompt = `Generate exactly ${count} UNIQUE records for a database based on the provided schema.
This is batch #${batchIndex + 1} (seed: ${batchSeed}).

=== USER INSTRUCTIONS ===
${plan || "Generate realistic and diverse data."}

=== MANDATORY DIVERSITY RULES ===
1. Each record MUST be completely unique. Never repeat or paraphrase content from previous batches.
2. For numeric ID fields: continue incrementing from the highest existing value (see context below).
3. For text fields: use completely DIFFERENT topics, names, themes, and wording than what already exists.
4. Vary the length and style of text content significantly between records.
5. Use diverse boolean values (mix of true/false, not all the same).
6. For author/name fields: generate completely DIFFERENT names each time. Use diverse ethnic origins, varying name lengths, and both common and uncommon names.
7. Suggested thematic inspiration for this batch (use these as starting points, not limits): ${diversityThemes}.
8. DO NOT generate generic/obvious topics. Be creative, specific, and niche.
${existingContext}
Ensure you generate exactly ${count} items. Every single item must be meaningfully different from all others.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: Math.max(creativity, 1.0), // Força mínimo de 1.0 para diversidade
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (err: any) {
    handleApiError(err);
  }
}
