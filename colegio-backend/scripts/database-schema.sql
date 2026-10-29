-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS colegio_mentes_brilhantes;
USE colegio_mentes_brilhantes;

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    assunto VARCHAR(255),
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'respondido') DEFAULT 'pendente'
);

-- Tabela de agendamento de visitas
CREATE TABLE IF NOT EXISTS visitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    data_preferida DATE,
    observacoes TEXT,
    data_agendamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'confirmada', 'realizada', 'cancelada') DEFAULT 'pendente'
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    genero ENUM('masculino', 'feminino', 'outro'),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    endereco TEXT,
    cep VARCHAR(10),
    cidade VARCHAR(100),
    serie VARCHAR(50) NOT NULL,
    turno ENUM('manha', 'tarde', 'noite'),
    escola_anterior VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ativo', 'inativo', 'pendente') DEFAULT 'pendente'
);

-- Tabela de responsáveis
CREATE TABLE IF NOT EXISTS responsaveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT,
    nome_completo VARCHAR(255) NOT NULL,
    parentesco ENUM('pai', 'mae', 'avo', 'tio', 'responsavel', 'outro') NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco TEXT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT,
    responsavel_id INT,
    observacoes TEXT,
    autorizacao_imagem BOOLEAN DEFAULT FALSE,
    termo_aceite BOOLEAN DEFAULT FALSE,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovada', 'rejeitada') DEFAULT 'pendente',
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE CASCADE
);

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel ENUM('admin', 'secretaria') DEFAULT 'secretaria',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo'
);

-- Inserir administrador padrão
INSERT INTO administradores (nome, email, senha, nivel) 
VALUES ('Administrador', 'admin@mentesbrilhantes.edu.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE nome = nome;

-- Índices para melhor performance
CREATE INDEX idx_alunos_email ON alunos(email);
CREATE INDEX idx_alunos_cpf ON alunos(cpf);
CREATE INDEX idx_contatos_data ON contatos(data_envio);
CREATE INDEX idx_visitas_data ON visitas(data_agendamento);
CREATE INDEX idx_matriculas_status ON matriculas(status);

-- Adicionar colunas que podem estar faltando na tabela matriculas
ALTER TABLE matriculas 
ADD COLUMN IF NOT EXISTS aluno_id INT,
ADD COLUMN IF NOT EXISTS responsavel_id INT,
ADD COLUMN IF NOT EXISTS nome_aluno VARCHAR(255),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS genero ENUM('masculino', 'feminino', 'outro'),
ADD COLUMN IF NOT EXISTS cpf_aluno VARCHAR(14),
ADD COLUMN IF NOT EXISTS rg_aluno VARCHAR(20),
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cep VARCHAR(10),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS serie VARCHAR(50),
ADD COLUMN IF NOT EXISTS turno ENUM('manha', 'tarde', 'noite'),
ADD COLUMN IF NOT EXISTS escola_anterior VARCHAR(255),
ADD COLUMN IF NOT EXISTS nome_responsavel VARCHAR(255),
ADD COLUMN IF NOT EXISTS parentesco ENUM('pai', 'mae', 'avo', 'tio', 'responsavel', 'outro'),
ADD COLUMN IF NOT EXISTS cpf_responsavel VARCHAR(14),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS endereco_responsavel TEXT,
ADD COLUMN IF NOT EXISTS autorizacao_imagem BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS termo_aceite BOOLEAN DEFAULT FALSE;

-- Adicionar foreign keys se não existirem (pode dar erro se já existirem, mas não tem problema)
-- ALTER TABLE matriculas ADD CONSTRAINT fk_matriculas_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE;
-- ALTER TABLE matriculas ADD CONSTRAINT fk_matriculas_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE CASCADE;
