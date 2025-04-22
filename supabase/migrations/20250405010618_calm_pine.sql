/*
  # Atualizar políticas RLS para tabela uniforms

  1. Alterações
    - Remover políticas RLS existentes da tabela uniforms
    - Adicionar nova política que permite todas as operações sem restrições
    
  2. Segurança
    - Como este é um sistema interno, permitiremos todas as operações
    - Não há necessidade de autenticação para este caso específico
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON uniforms;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON uniforms;

-- Criar nova política que permite todas as operações
CREATE POLICY "Enable all operations for all users"
ON uniforms
FOR ALL
USING (true)
WITH CHECK (true);