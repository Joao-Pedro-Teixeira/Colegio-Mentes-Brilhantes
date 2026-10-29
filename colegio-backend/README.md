# Backend - Colégio Mentes Brilhantes

Backend em Node.js para o site do Colégio Mentes Brilhantes, com APIs para contato, login e matrícula.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 8.0 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <url-do-repositorio>
cd colegio-backend
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure as variáveis de ambiente**
\`\`\`bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
\`\`\`

4. **Configure o banco de dados**
\`\`\`bash
npm run setup-db
\`\`\`

5. **Inicie o servidor**
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção
npm start
\`\`\`

## 📚 Endpoints da API

### 🔐 Autenticação (`/api/auth`)

- `POST /login` - Fazer login
- `POST /forgot-password` - Recuperar senha
- `GET /profile` - Obter perfil do usuário (requer token)

### 📞 Contato (`/api/contato`)

- `POST /mensagem` - Enviar mensagem de contato
- `POST /visita` - Agendar visita
- `GET /mensagens` - Listar mensagens (admin)

### 🎓 Matrícula (`/api/matricula`)

- `POST /solicitar` - Solicitar matrícula
- `GET /status/:protocolo` - Consultar status da matrícula
- `GET /listar` - Listar matrículas (admin)

## 🗄️ Estrutura do Banco

### Principais Tabelas

- **usuarios** - Usuários do sistema (alunos, responsáveis, funcionários)
- **alunos** - Dados dos alunos matriculados
- **responsaveis** - Dados dos responsáveis
- **matriculas** - Solicitações de matrícula
- **contatos** - Mensagens de contato
- **agendamentos_visita** - Agendamentos de visita

## 🔑 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

\`\`\`
Authorization: Bearer <seu-token>
\`\`\`

## 📝 Exemplos de Uso

### Login
\`\`\`javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'senha123'
  })
});
\`\`\`

### Enviar Mensagem de Contato
\`\`\`javascript
const response = await fetch('/api/contato/mensagem', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@email.com',
    assunto: 'Dúvida sobre matrícula',
    mensagem: 'Gostaria de saber mais informações...'
  })
});
\`\`\`

### Solicitar Matrícula
\`\`\`javascript
const response = await fetch('/api/matricula/solicitar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nomeAluno: 'Pedro Santos',
    dataNascimento: '2010-05-15',
    serie: '6ano',
    nomeResponsavel: 'Maria Santos',
    cpfResponsavel: '123.456.789-00',
    telefone: '(11) 99999-9999',
    email: 'maria@email.com',
    termoAceite: true
  })
});
\`\`\`

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento (com nodemon)
- `npm run setup-db` - Configura o banco de dados

## 🔒 Segurança

- Senhas são criptografadas com bcrypt
- Validação de dados com Joi
- Proteção contra SQL Injection
- Tokens JWT com expiração
- CORS configurado

## 📊 Logs

O sistema registra:
- Tentativas de login
- Erros do servidor
- Operações importantes

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
