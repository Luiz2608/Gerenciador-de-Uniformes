import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para as tabelas em português
export interface Atleta {
  id: string;
  nome: string;
  cpf: string;
  sport: string;
  phone: string | null;
  course: string | null;
  photo_url: string | null;
  uniform_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface Uniforme {
  id: string;
  tipo: string;
  tamanho: string;
  situacao: 'disponivel' | 'atribuido' | 'manutencao';
  numero: number;
  condicao: string;
  created_at: string;
  updated_at: string;
}

export interface AtribuicaoUniforme {
  id: string;
  atleta_id: string;
  uniforme_id: string;
  data_retirada: string;
  data_devolucao: string | null;
  situacao: 'agendado' | 'retirado' | 'devolvido';
  atleta: Atleta;
  uniforme: Uniforme;
  created_at: string;
  updated_at: string;
}