/*
  # Criar tabela de uniformes

  1. Nova Tabela
    - `uniformes`
      - `id` (uuid, chave primária)
      - `tipo` (text)
      - `tamanho` (text)
      - `situacao` (text) - disponivel, atribuido, manutencao
      - `numero` (integer)
      - `condicao` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS
    - Adicionar política para todos os usuários
*/

-- Criar tabela de uniformes
CREATE TABLE IF NOT EXISTS uniformes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  tamanho text NOT NULL,
  situacao text NOT NULL DEFAULT 'disponivel',
  numero integer NOT NULL,
  condicao text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT situacao_valida CHECK (situacao IN ('disponivel', 'atribuido', 'manutencao'))
);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER atualizar_uniformes_updated_at
    BEFORE UPDATE ON uniformes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE uniformes ENABLE ROW LEVEL SECURITY;

-- Criar política que permite todas as operações
CREATE POLICY "Enable all operations for all users"
ON uniformes
FOR ALL
USING (true)
WITH CHECK (true);