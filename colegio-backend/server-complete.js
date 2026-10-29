const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const app = express()
const PORT = 3000

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "colegio_mentes_brilhantes",
}

let pool

// Inicializar conexão com banco
async function initDatabase() {
  try {
    // Conectar sem especificar database para criá-lo se não existir
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    // Criar database se não existir
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.end()

    // Criar pool de conexões
    pool = mysql.createPool(dbConfig)

    // Criar tabelas se não existirem
    await createTables()

    console.log("✅ Conectado ao MySQL e tabelas criadas!")
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error.message)
    return false
  }
}

// Criar tabelas necessárias
async function createTables() {
  const tables = [
    // Tabela de contatos
    `CREATE TABLE IF NOT EXISTS contatos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      assunto VARCHAR(255),
      mensagem TEXT NOT NULL,
      data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pendente', 'respondido') DEFAULT 'pendente'
    )`,

    // Tabela de agendamento de visitas
    `CREATE TABLE IF NOT EXISTS visitas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      data_preferida DATE,
      observacoes TEXT,
      data_agendamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pendente', 'confirmada', 'realizada', 'cancelada') DEFAULT 'pendente'
    )`,

    // Tabela de alunos (conforme estrutura original)
    `CREATE TABLE IF NOT EXISTS alunos (
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
    )`,

    // Tabela de responsáveis
    `CREATE TABLE IF NOT EXISTS responsaveis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aluno_id INT,
      nome_completo VARCHAR(255) NOT NULL,
      parentesco ENUM('pai', 'mae', 'avo', 'tio', 'responsavel', 'outro') NOT NULL,
      cpf VARCHAR(14) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      endereco TEXT,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    )`,

    // Tabela de matrículas
    `CREATE TABLE IF NOT EXISTS matriculas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aluno_id INT,
      responsavel_id INT,
      nome_aluno VARCHAR(255),
      data_nascimento DATE,
      serie VARCHAR(50),
      nome_responsavel VARCHAR(255),
      cpf_responsavel VARCHAR(14),
      telefone VARCHAR(20),
      email VARCHAR(255),
      observacoes TEXT,
      autorizacao_imagem BOOLEAN DEFAULT FALSE,
      termo_aceite BOOLEAN DEFAULT FALSE,
      data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pendente', 'aprovada', 'rejeitada') DEFAULT 'pendente',
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
      FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE CASCADE
    )`,

    // Tabela de administradores
    `CREATE TABLE IF NOT EXISTS administradores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      nivel ENUM('admin', 'secretaria') DEFAULT 'secretaria',
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('ativo', 'inativo') DEFAULT 'ativo'
    )`,
  ]

  for (const tableSQL of tables) {
    await pool.execute(tableSQL)
  }

  // Inserir administrador padrão se não existir
  try {
    const adminExists = await pool.execute("SELECT id FROM administradores WHERE email = ?", [
      "admin@mentesbrilhantes.edu.br",
    ])
    if (adminExists[0].length === 0) {
      const senhaAdmin = await bcrypt.hash("password", 10)
      await pool.execute("INSERT INTO administradores (nome, email, senha, nivel) VALUES (?, ?, ?, ?)", [
        "Administrador",
        "admin@mentesbrilhantes.edu.br",
        senhaAdmin,
        "admin",
      ])
      console.log("👤 Administrador padrão criado")
    }
  } catch (error) {
    console.log("⚠️ Erro ao criar administrador padrão:", error.message)
  }
}

// Função para verificar se coluna existe
async function columnExists(tableName, columnName) {
  try {
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [dbConfig.database, tableName, columnName],
    )
    return columns.length > 0
  } catch (error) {
    return false
  }
}

// Função para executar queries
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Erro na query:", error)
    throw error
  }
}

// Função para gerar senha aleatória
function gerarSenha() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let senha = ""
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

// Caminho para a pasta frontend
const frontendPath = path.join(__dirname, "..", "frontend")

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(frontendPath))

// Middleware para disponibilizar executeQuery nas rotas
app.use((req, res, next) => {
  req.executeQuery = executeQuery
  next()
})

// Rota principal
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html")
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(`
      <h1>❌ index.html não encontrado</h1>
      <p>Procurando em: ${indexPath}</p>
    `)
  }
})

// ===== ROTAS DE CONTATO =====

// Enviar mensagem de contato
app.post("/api/contato/enviar", async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body

    // Validação básica
    if (!nome || !email || !mensagem) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e mensagem são obrigatórios",
      })
    }

    // Inserir no banco de dados
    const query = `
      INSERT INTO contatos (nome, email, assunto, mensagem) 
      VALUES (?, ?, ?, ?)
    `

    const result = await executeQuery(query, [nome, email, assunto || "", mensagem])

    console.log("📧 Contato salvo no banco:", { id: result.insertId, nome, email })

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso! Retornaremos em breve.",
    })
  } catch (error) {
    console.error("Erro ao salvar contato:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Agendar visita
app.post("/api/contato/agendar-visita", async (req, res) => {
  try {
    const { nome, telefone, email, data, observacoes } = req.body

    // Validação básica
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome, telefone e email são obrigatórios",
      })
    }

    // Inserir no banco de dados
    const query = `
      INSERT INTO visitas (nome, telefone, email, data_preferida, observacoes) 
      VALUES (?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [nome, telefone, email, data || null, observacoes || ""])

    console.log("📅 Visita salva no banco:", { id: result.insertId, nome, telefone })

    res.json({
      success: true,
      message: "Visita agendada com sucesso! Entraremos em contato para confirmar.",
    })
  } catch (error) {
    console.error("Erro ao agendar visita:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// ===== ROTAS DE MATRÍCULA =====

// Enviar solicitação de matrícula
app.post("/api/matricula/enviar", async (req, res) => {
  try {
    const {
      // Dados do aluno
      nomeAluno,
      dataNascimento,
      genero,
      cpfAluno,
      rgAluno,
      endereco,
      cep,
      cidade,
      serie,
      turno,
      escolaAnterior,
      // Dados do responsável
      nomeResponsavel,
      parentesco,
      cpfResponsavel,
      telefone,
      email,
      enderecoResponsavel,
      // Outros dados
      observacoes,
      autorizacaoImagem,
      termoAceite,
    } = req.body

    console.log("📝 Dados recebidos da matrícula:", req.body)

    // Validação básica
    if (!nomeAluno || !dataNascimento || !serie || !nomeResponsavel || !cpfResponsavel || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios não preenchidos",
      })
    }

    if (!termoAceite) {
      return res.status(400).json({
        success: false,
        message: "Você deve aceitar os termos e condições",
      })
    }

    // Gerar senha para o aluno
    const senhaAluno = gerarSenha()
    const senhaHash = await bcrypt.hash(senhaAluno, 10)

    // Iniciar transação
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      console.log("🔄 Iniciando transação...")

      // 1. Inserir aluno na tabela alunos
      const queryAluno = `
        INSERT INTO alunos (
          nome_completo, data_nascimento, genero, cpf, rg, endereco, cep, cidade,
          serie, turno, escola_anterior, email, senha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      console.log("📝 Inserindo aluno...")
      const [resultAluno] = await connection.execute(queryAluno, [
        nomeAluno,
        dataNascimento,
        genero || null,
        cpfAluno || null,
        rgAluno || null,
        endereco || null,
        cep || null,
        cidade || null,
        serie,
        turno || null,
        escolaAnterior || null,
        email,
        senhaHash,
      ])

      const alunoId = resultAluno.insertId
      console.log("✅ Aluno inserido com ID:", alunoId)

      // 2. Inserir responsável na tabela responsaveis
      const queryResponsavel = `
        INSERT INTO responsaveis (aluno_id, nome_completo, parentesco, cpf, telefone, email) 
        VALUES (?, ?, ?, ?, ?, ?)
      `

      console.log("📝 Inserindo responsável...")
      const [resultResponsavel] = await connection.execute(queryResponsavel, [
        alunoId,
        nomeResponsavel,
        parentesco || "responsavel",
        cpfResponsavel,
        telefone,
        email,
      ])

      const responsavelId = resultResponsavel.insertId
      console.log("✅ Responsável inserido com ID:", responsavelId)

      // 3. Inserir matrícula na tabela matriculas
      const queryMatricula = `
        INSERT INTO matriculas (
          aluno_id, responsavel_id, nome_aluno, data_nascimento, serie,
          nome_responsavel, cpf_responsavel, telefone, email, observacoes, 
          autorizacao_imagem, termo_aceite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      console.log("📝 Inserindo matrícula...")
      const [resultMatricula] = await connection.execute(queryMatricula, [
        alunoId,
        responsavelId,
        nomeAluno,
        dataNascimento,
        serie,
        nomeResponsavel,
        cpfResponsavel,
        telefone,
        email,
        observacoes || null,
        autorizacaoImagem ? 1 : 0,
        termoAceite ? 1 : 0,
      ])

      const matriculaId = resultMatricula.insertId
      console.log("✅ Matrícula inserida com ID:", matriculaId)

      // Confirmar transação
      await connection.commit()
      console.log("✅ Transação confirmada!")

      console.log("🎉 Matrícula completa criada:", {
        matriculaId,
        alunoId,
        responsavelId,
        aluno: nomeAluno,
        email: email,
        senha: senhaAluno,
      })

      res.json({
        success: true,
        message: "Matrícula enviada com sucesso! Seus dados de acesso foram criados.",
        dadosAcesso: {
          email: email,
          senha: senhaAluno,
          matriculaId: matriculaId,
        },
      })
    } catch (error) {
      // Reverter transação em caso de erro
      await connection.rollback()
      console.error("❌ Erro na transação:", error)
      console.error("❌ SQL que causou erro:", error.sql)
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erro ao processar matrícula:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "CPF ou email já cadastrado no sistema",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erro interno do servidor: " + error.message,
    })
  }
})

// ===== ROTAS DE AUTENTICAÇÃO =====

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      })
    }

    // Buscar aluno no banco
    const query = `
      SELECT id, nome_completo, email, senha, serie, turno, status 
      FROM alunos 
      WHERE email = ? AND status = 'ativo'
    `

    const alunos = await executeQuery(query, [email])

    if (alunos.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    const aluno = alunos[0]

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, aluno.senha)
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      aluno: {
        id: aluno.id,
        nome: aluno.nome_completo,
        email: aluno.email,
        serie: aluno.serie,
        turno: aluno.turno,
        status: aluno.status,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

app.post("/api/auth/forgot-password", (req, res) => {
  console.log("🔑 Recuperação de senha:", req.body)
  res.json({
    success: true,
    message: "Instruções de recuperação enviadas para seu email!",
  })
})

// ===== ROTAS DE ADMINISTRAÇÃO =====

// Login de administrador
app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("🔐 Tentativa de login admin:")
    console.log("   Email recebido:", email)

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      })
    }

    // Buscar administrador no banco de dados
    const query = `
      SELECT id, nome, email, senha, nivel, status 
      FROM administradores 
      WHERE email = ? AND status = 'ativo'
    `

    const admins = await executeQuery(query, [email])
    console.log("   Administradores encontrados:", admins.length)

    if (admins.length === 0) {
      console.log("❌ Nenhum administrador encontrado com este email")
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    const admin = admins[0]
    console.log("   Admin encontrado:", admin.nome, admin.email)

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, admin.senha)
    console.log("   Senha válida:", senhaValida)

    if (!senhaValida) {
      console.log("❌ Senha incorreta")
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    console.log("✅ Login admin realizado com sucesso!")

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel: admin.nivel,
      },
    })
  } catch (error) {
    console.error("❌ Erro no login admin:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Listar contatos para admin
app.get("/api/admin/contatos", async (req, res) => {
  try {
    const query = `
      SELECT id, nome, email, assunto, mensagem, data_envio, status 
      FROM contatos 
      ORDER BY data_envio DESC
      LIMIT 50
    `
    const contatos = await executeQuery(query)

    res.json({
      success: true,
      contatos,
    })
  } catch (error) {
    console.error("Erro ao listar contatos:", error)
    res.json({
      success: true,
      contatos: [],
    })
  }
})

// Listar visitas para admin
app.get("/api/admin/visitas", async (req, res) => {
  try {
    const query = `
      SELECT id, nome, telefone, email, data_preferida, observacoes, data_agendamento, status 
      FROM visitas 
      ORDER BY data_agendamento DESC
      LIMIT 50
    `
    const visitas = await executeQuery(query)

    res.json({
      success: true,
      visitas,
    })
  } catch (error) {
    console.error("Erro ao listar visitas:", error)
    res.json({
      success: true,
      visitas: [],
    })
  }
})

// Listar matrículas para admin (usando apenas colunas da própria tabela matriculas)
app.get("/api/admin/matriculas", async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        nome_aluno,
        serie,
        nome_responsavel,
        telefone,
        email,
        data_solicitacao,
        status
      FROM matriculas
      ORDER BY data_solicitacao DESC
      LIMIT 50
    `
    const matriculas = await executeQuery(query)

    res.json({
      success: true,
      matriculas,
    })
  } catch (error) {
    console.error("Erro ao listar matrículas:", error)
    res.json({
      success: true,
      matriculas: [],
    })
  }
})

// Listar alunos para admin (verificando se colunas existem)
app.get("/api/admin/alunos", async (req, res) => {
  try {
    // Verificar quais colunas existem
    const hasEmail = await columnExists("alunos", "email")
    const hasTurno = await columnExists("alunos", "turno")

    let query = `
      SELECT id, nome_completo, serie, status, data_matricula
    `

    if (hasEmail) {
      query = query.replace("SELECT id,", "SELECT id, email,")
    }

    if (hasTurno) {
      query = query.replace("serie,", "serie, turno,")
    }

    query += `
      FROM alunos 
      ORDER BY data_matricula DESC
      LIMIT 50
    `

    const alunos = await executeQuery(query)

    res.json({
      success: true,
      alunos,
    })
  } catch (error) {
    console.error("Erro ao listar alunos:", error)
    res.json({
      success: true,
      alunos: [],
    })
  }
})

// Rota para servir admin.html
app.get("/admin", (req, res) => {
  const adminPath = path.join(__dirname, "admin.html")
  if (fs.existsSync(adminPath)) {
    res.sendFile(adminPath)
  } else {
    res.send(`
      <h1>❌ admin.html não encontrado</h1>
      <p>Procurando em: ${adminPath}</p>
    `)
  }
})

// Rota para verificar estrutura do banco
app.get("/api/admin/database-info", async (req, res) => {
  try {
    const tables = {}

    // Verificar estrutura das tabelas principais
    const tableNames = ["contatos", "visitas", "alunos", "responsaveis", "matriculas", "administradores"]

    for (const tableName of tableNames) {
      try {
        const [columns] = await pool.execute(`DESCRIBE ${tableName}`)
        tables[tableName] = columns.map((col) => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          default: col.Default,
        }))
      } catch (error) {
        tables[tableName] = { error: "Tabela não existe" }
      }
    }

    res.json({
      success: true,
      database: dbConfig.database,
      tables,
    })
  } catch (error) {
    console.error("Erro ao verificar estrutura:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao verificar estrutura do banco",
    })
  }
})

// Iniciar servidor
async function startServer() {
  const dbConnected = await initDatabase()

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    console.log(`📁 Pasta frontend: ${frontendPath}`)
    console.log(`🔗 Admin: http://localhost:${PORT}/admin`)
    console.log(`🔍 Estrutura do banco: http://localhost:${PORT}/api/admin/database-info`)

    if (dbConnected) {
      console.log("✅ Banco de dados conectado!")
      console.log("📝 Funcionalidades ativas:")
      console.log("   - Formulário de contato")
      console.log("   - Agendamento de visitas")
      console.log("   - Matrícula com criação de login/senha")
      console.log("   - Sistema de login para alunos")
      console.log("   - Painel administrativo")
    } else {
      console.log("⚠️  Servidor funcionando sem banco de dados")
    }
  })
}

startServer()
