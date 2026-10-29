USE colegio_mentes_brilhantes;

-- Inserir usuário administrador
INSERT INTO usuarios (nome, email, cpf, senha, tipo) VALUES 
('Administrador', 'admin@mentesbrilhantes.edu.br', '000.000.000-00', '$2b$10$rQZ8kqXqxqxqxqxqxqxqxOeKqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'admin');

-- Inserir alguns usuários de teste
INSERT INTO usuarios (nome, email, cpf, senha, tipo) VALUES 
('João Silva', 'joao.silva@email.com', '123.456.789-01', '$2b$10$rQZ8kqXqxqxqxqxqxqxqxOeKqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'responsavel'),
('Maria Santos', 'maria.santos@email.com', '987.654.321-09', '$2b$10$rQZ8kqXqxqxqxqxqxqxqxOeKqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'responsavel');

-- Inserir responsáveis
INSERT INTO responsaveis (usuario_id, nome_completo, cpf, telefone, parentesco) VALUES 
(2, 'João Silva', '123.456.789-01', '(11) 99999-1111', 'pai'),
(3, 'Maria Santos', '987.654.321-09', '(11) 99999-2222', 'mae');

-- Inserir alguns alunos de exemplo
INSERT INTO alunos (usuario_id, matricula, nome_completo, data_nascimento, genero, serie, turno, status, data_matricula) VALUES 
(NULL, 'MB202400001', 'Pedro Silva', '2010-05-15', 'masculino', '8ano', 'manha', 'ativo', '2024-01-15'),
(NULL, 'MB202400002', 'Ana Santos', '2008-03-22', 'feminino', '1medio', 'manha', 'ativo', '2024-01-15');

-- Relacionar alunos com responsáveis
INSERT INTO aluno_responsavel (aluno_id, responsavel_id, tipo_responsabilidade) VALUES 
(1, 1, 'principal'),
(2, 2, 'principal');

-- Inserir algumas matrículas de exemplo
INSERT INTO matriculas (
    protocolo, nome_aluno, data_nascimento, genero, serie, turno,
    nome_responsavel, cpf_responsavel, telefone, email,
    status, data_solicitacao
) VALUES 
('MB202400003', 'Carlos Oliveira', '2009-08-10', 'masculino', '7ano', 'tarde',
 'Roberto Oliveira', '111.222.333-44', '(11) 88888-3333', 'roberto@email.com',
 'pendente', NOW()),
('MB202400004', 'Lucia Ferreira', '2011-12-05', 'feminino', '5ano', 'manha',
 'Sandra Ferreira', '555.666.777-88', '(11) 77777-4444', 'sandra@email.com',
 'em_analise', NOW());

-- Inserir alguns contatos de exemplo
INSERT INTO contatos (nome, email, assunto, mensagem, status) VALUES 
('Paulo Mendes', 'paulo@email.com', 'Informações sobre matrícula', 'Gostaria de saber sobre o processo de matrícula para o 6º ano.', 'pendente'),
('Carla Lima', 'carla@email.com', 'Dúvida sobre horários', 'Qual o horário de funcionamento da secretaria?', 'respondido');

-- Inserir alguns agendamentos de visita
INSERT INTO agendamentos_visita (nome, telefone, email, data_preferida, observacoes, status) VALUES 
('Ricardo Costa', '(11) 66666-5555', 'ricardo@email.com', '2024-02-15', 'Gostaria de conhecer a estrutura da escola', 'pendente'),
('Fernanda Alves', '(11) 55555-6666', 'fernanda@email.com', '2024-02-20', 'Interessada em matrícula para o ensino médio', 'confirmado');
