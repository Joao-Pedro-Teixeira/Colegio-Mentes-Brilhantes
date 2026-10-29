# CMB – Colégio Mentes Brilhantes

Aplicação web para uma instituição escolar, desenvolvida da prototipagem no Figma até a implementação. O site apresenta o colégio e permite que famílias enviem mensagens, agendem visitas e solicitem matrícula. Alunos acessam um portal com login e a secretaria gerencia tudo em um painel administrativo.

> Projeto acadêmico · 02/2025 · metodologia Scrum

## Funcionalidades

- **Site institucional** responsivo: início, nossos ciclos, galeria e contato
- **Formulário de contato** e **agendamento de visitas**
- **Matrícula online**, com criação de login e senha para o aluno
- **Portal do Aluno** com autenticação (senhas criptografadas com bcrypt)
- **Painel administrativo** para gerenciar contatos, visitas, matrículas e alunos

## Tecnologias

| Camada | Ferramentas |
| --- | --- |
| Design | Figma |
| Front-end | HTML, CSS e JavaScript |
| Back-end | Node.js, Express |
| Banco de dados | MySQL (`mysql2`) |
| Segurança | bcryptjs |
| Gestão | Scrum |

## Estrutura do repositório

```
.
├── colegio-backend/
│   ├── server-complete.js    # servidor principal (API + arquivos estáticos)
│   ├── config/               # detecção do caminho do front-end
│   ├── scripts/              # schema e dados iniciais do banco (SQL)
│   └── package.json
└── frontend/
    ├── index.html            # página inicial
    ├── ciclos.html           # nossos ciclos
    ├── galeria.html          # galeria
    ├── matricula.html        # matrícula
    ├── login.html            # portal do aluno
    ├── contato.html          # contato e agendamento de visita
    ├── admin.html            # painel administrativo
    └── img/                  # imagens
```

## Como executar

**Pré-requisitos:** Node.js 16+ e MySQL 8+ em execução.

1. Clone o repositório:
   ```bash
   git clone https://github.com/[seu-usuario]/[nome-do-repositorio].git
   cd [nome-do-repositorio]/colegio-backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` a partir do modelo e preencha com os dados do seu MySQL:
   ```bash
   cp .env.example .env
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
   Na primeira execução o servidor cria o banco `colegio_mentes_brilhantes` e as tabelas automaticamente.
5. Acesse **http://localhost:3000**. O painel administrativo fica em **http://localhost:3000/admin**.

> O usuário administrador padrão é criado pelos scripts em `colegio-backend/scripts/`. Troque a senha dele antes de qualquer uso real.

## Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/contato/enviar` | Envia mensagem de contato |
| POST | `/api/contato/agendar-visita` | Agenda visita |
| POST | `/api/matricula/enviar` | Solicita matrícula |
| POST | `/api/auth/login` | Login do aluno |
| POST | `/api/auth/admin/login` | Login do administrador |
| GET | `/api/admin/contatos` | Lista contatos |
| GET | `/api/admin/visitas` | Lista visitas |
| GET | `/api/admin/matriculas` | Lista matrículas |
| GET | `/api/admin/alunos` | Lista alunos |

## Banco de dados

Tabelas principais: `contatos`, `visitas`, `alunos`, `responsaveis`, `matriculas` e `administradores`. O schema completo está em `colegio-backend/scripts/database-schema.sql`.

## Links

- Protótipo no Figma: https://www.figma.com/design/B0q3foitkvuxyhkGlrbjQk/Untitled?node-id=0-1&t=ojGZ4UrS2Rp2Ggoo-1

## Licença

Projeto acadêmico, sem fins comerciais.
