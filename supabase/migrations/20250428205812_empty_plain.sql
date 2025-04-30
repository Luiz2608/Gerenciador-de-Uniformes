/*
  # Traduzir nomes das tabelas e colunas para português

  1. Alterações
    - Renomear tabelas para português
    - Renomear colunas para português
    - Atualizar constraints e foreign keys
    - Atualizar triggers
    
  2. Segurança
    - Manter as políticas RLS existentes
    - Garantir integridade dos dados durante a migração
*/

-- Primeiro remover as constraints existentes
ALTER TABLE uniforms DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE uniform_assignments DROP CONSTRAINT IF EXISTS valid_status;

-- Atualizar os valores de status nas tabelas existentes
UPDATE uniforms 
SET status = CASE 
  WHEN status = 'available' THEN 'disponivel'
  WHEN status = 'assigned' THEN 'atribuido'
  WHEN status = 'maintenance' THEN 'manutencao'
END;

UPDATE uniform_assignments 
SET status = CASE 
  WHEN status = 'scheduled' THEN 'agendado'
  WHEN status = 'picked_up' THEN 'retirado'
  WHEN status = 'returned' THEN 'devolvido'
END;

-- Renomear tabelas
ALTER TABLE athletes RENAME TO atletas;
ALTER TABLE uniforms RENAME TO uniformes;
ALTER TABLE uniform_assignments RENAME TO atribuicoes_uniformes;

-- Atualizar colunas da tabela atletas
ALTER TABLE atletas RENAME COLUMN name TO nome;

-- Atualizar colunas da tabela uniformes
ALTER TABLE uniformes RENAME COLUMN type TO tipo;
ALTER TABLE uniformes RENAME COLUMN size TO tamanho;
ALTER TABLE uniformes RENAME COLUMN status TO situacao;
ALTER TABLE uniformes RENAME COLUMN number TO numero;
ALTER TABLE uniformes RENAME COLUMN condition TO condicao;

-- Adicionar nova constraint para situacao
ALTER TABLE uniformes ADD CONSTRAINT situacao_valida 
  CHECK (situacao IN ('disponivel', 'atribuido', 'manutencao'));

-- Atualizar colunas da tabela atribuicoes_uniformes
ALTER TABLE atribuicoes_uniformes RENAME COLUMN athlete_id TO atleta_id;
ALTER TABLE atribuicoes_uniformes RENAME COLUMN uniform_id TO uniforme_id;
ALTER TABLE atribuicoes_uniformes RENAME COLUMN pickup_date TO data_retirada;
ALTER TABLE atribuicoes_uniformes RENAME COLUMN return_date TO data_devolucao;
ALTER TABLE atribuicoes_uniformes RENAME COLUMN status TO situacao;

-- Adicionar nova constraint para situacao
ALTER TABLE atribuicoes_uniformes ADD CONSTRAINT situacao_valida 
  CHECK (situacao IN ('agendado', 'retirado', 'devolvido'));

-- Atualizar foreign keys
ALTER TABLE atribuicoes_uniformes DROP CONSTRAINT IF EXISTS uniform_assignments_athlete_id_fkey;
ALTER TABLE atribuicoes_uniformes DROP CONSTRAINT IF EXISTS uniform_assignments_uniform_id_fkey;
ALTER TABLE atribuicoes_uniformes ADD CONSTRAINT atribuicoes_uniformes_atleta_id_fkey 
  FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE CASCADE;
ALTER TABLE atribuicoes_uniformes ADD CONSTRAINT atribuicoes_uniformes_uniforme_id_fkey 
  FOREIGN KEY (uniforme_id) REFERENCES uniformes(id) ON DELETE CASCADE;

-- Atualizar triggers
ALTER TRIGGER update_athletes_updated_at ON atletas 
  RENAME TO atualizar_atletas_updated_at;

ALTER TRIGGER update_uniforms_updated_at ON uniformes 
  RENAME TO atualizar_uniformes_updated_at;

ALTER TRIGGER update_uniform_assignments_updated_at ON atribuicoes_uniformes 
  RENAME TO atualizar_atribuicoes_updated_at;