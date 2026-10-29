-- Script para adicionar colunas faltantes na tabela matriculas
USE colegio_mentes_brilhantes;

-- Verificar se as colunas existem antes de adicionar
SET @sql = '';

-- Adicionar aluno_id se não existir
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'colegio_mentes_brilhantes' 
AND table_name = 'matriculas' 
AND column_name = 'aluno_id';

SET @sql = IF(@col_exists = 0, 'ALTER TABLE matriculas ADD COLUMN aluno_id INT;', '');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar responsavel_id se não existir
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'colegio_mentes_brilhantes' 
AND table_name = 'matriculas' 
AND column_name = 'responsavel_id';

SET @sql = IF(@col_exists = 0, 'ALTER TABLE matriculas ADD COLUMN responsavel_id INT;', '');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar outras colunas importantes
ALTER TABLE matriculas 
ADD COLUMN IF NOT EXISTS nome_aluno VARCHAR(255),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS serie VARCHAR(50),
ADD COLUMN IF NOT EXISTS nome_responsavel VARCHAR(255),
ADD COLUMN IF NOT EXISTS cpf_responsavel VARCHAR(14),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS autorizacao_imagem BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS termo_aceite BOOLEAN DEFAULT FALSE;

-- Mostrar estrutura atual da tabela
DESCRIBE matriculas;

SELECT 'Tabela matriculas atualizada com sucesso!' as resultado;
