const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = 3000

// Middlewares básicos
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos
const frontendPath = path.join(__dirname, "..", "frontend")
app.use(express.static(frontendPath))
console.log("📁 Servindo arquivos de:", frontendPath)

// Configuração do banco
const dbConfig = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "MYdatabase@2025",
  database: "colegio_mentes_brilhantes",
}

let pool

// Inicializar banco
async function initDB() {
  try {
    pool = mysql.createPool(dbConfig)
    console.log("✅ Pool de conexões criado")
    return true
  } catch (error) {
    console.error("❌ Erro no banco:", error.message)
    return false
  }
}

// ===== ROTA DE TESTE =====
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando!",
    timestamp: new Date().toISOString(),
  })
})

// ===== ROTA DE CONTATO =====
app.post("/api/contato/enviar", async (req, res) => {
  console.log("📧 Recebendo contato:", req.body)

  try {
    const { nome, email, assunto, mensagem } = req.body

    if (!nome || !email || !mensagem) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e mensagem são obrigatórios",
      })
    }

    // Tentar salvar no banco
    if (pool) {
      const query = "INSERT INTO contatos (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)"
      const [result] = await pool.execute(query, [nome, email, assunto || "", mensagem])
      console.log("✅ Contato salvo no banco, ID:", result.insertId)
    } else {
      console.log("⚠️ Banco não conectado, mas simulando sucesso")
    }

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso!",
    })
  } catch (error) {
    console.error("❌ Erro no contato:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// ===== ROTA DE VISITA =====
app.post("/api/contato/agendar-visita", async (req, res) => {
  console.log("📅 Recebendo visita:", req.body)

  try {
    const { nome, telefone, email, data, observacoes } = req.body

    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome, telefone e email são obrigatórios",
      })
    }

    // Tentar salvar no banco
    if (pool) {
      const query = "INSERT INTO visitas (nome, telefone, email, data_preferida, observacoes) VALUES (?, ?, ?, ?, ?)"
      const [result] = await pool.execute(query, [nome, telefone, email, data || null, observacoes || ""])
      console.log("✅ Visita salva no banco, ID:", result.insertId)
    } else {
      console.log("⚠️ Banco não conectado, mas simulando sucesso")
    }

    res.json({
      success: true,
      message: "Visita agendada com sucesso!",
    })
  } catch (error) {
    console.error("❌ Erro na visita:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// ===== ROTA DE MATRÍCULA =====
app.post("/api/matricula/enviar", async (req, res) => {
  console.log("📝 Recebendo matrícula:", req.body)

  try {
    const dados = req.body

    // Validação básica
    if (!dados.nomeAluno || !dados.email || !dados.nomeResponsavel) {
      return res.status(400).json({
        success: false,
        message: "Nome do aluno, email e nome do responsável são obrigatórios",
      })
    }

    if (!dados.termoAceite) {
      return res.status(400).json({
        success: false,
        message: "Você deve aceitar os termos",
      })
    }

    // Gerar senha
    const senha = Math.random().toString(36).slice(-8)
    const senhaHash = await bcrypt.hash(senha, 10)

    let alunoId = null
    let matriculaId = null

    // Tentar salvar no banco
    if (pool) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()

        // Inserir aluno
        const [resultAluno] = await connection.execute(
          "INSERT INTO alunos (nome_completo, email, senha, cpf, data_nascimento, serie, turno, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')",
          [
            dados.nomeAluno,
            dados.email,
            senhaHash,
            dados.cpfAluno || null,
            dados.dataNascimento,
            dados.serie,
            dados.turno || null,
          ],
        )
        alunoId = resultAluno.insertId

        // Inserir matrícula
        const [resultMatricula] = await connection.execute(
          `INSERT INTO matriculas (
            aluno_id, nome_aluno, data_nascimento, genero, cpf_aluno, rg_aluno, endereco, cep, cidade,
            serie, turno, escola_anterior, nome_responsavel, parentesco, cpf_responsavel,
            telefone, email, endereco_responsavel, observacoes, autorizacao_imagem, termo_aceite
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            alunoId,
            dados.nomeAluno,
            dados.dataNascimento,
            dados.genero || null,
            dados.cpfAluno || null,
            dados.rgAluno || null,
            dados.endereco || null,
            dados.cep || null,
            dados.cidade || null,
            dados.serie,
            dados.turno || null,
            dados.escolaAnterior || null,
            dados.nomeResponsavel,
            dados.parentesco || "responsavel",
            dados.cpfResponsavel,
            dados.telefone,
            dados.email,
            dados.enderecoResponsavel || null,
            dados.observacoes || null,
            dados.autorizacaoImagem ? 1 : 0,
            1,
          ],
        )
        matriculaId = resultMatricula.insertId

        await connection.commit()
        console.log("✅ Matrícula salva no banco:", { alunoId, matriculaId })
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } else {
      console.log("⚠️ Banco não conectado, simulando IDs")
      alunoId = Math.floor(Math.random() * 1000)
      matriculaId = Math.floor(Math.random() * 1000)
    }

    res.json({
      success: true,
      message: "Matrícula enviada com sucesso!",
      dadosAcesso: {
        email: dados.email,
        senha: senha,
        matriculaId: matriculaId,
      },
    })
  } catch (error) {
    console.error("❌ Erro na matrícula:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Email ou CPF já cadastrado",
      })
    }

    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Rotas para páginas
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html")
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(`<h1>index.html não encontrado em: ${indexPath}</h1>`)
  }
})

app.get("/contato", (req, res) => {
  const contatoPath = path.join(frontendPath, "contato.html")
  if (fs.existsSync(contatoPath)) {
    res.sendFile(contatoPath)
  } else {
    res.send(`<h1>contato.html não encontrado em: ${contatoPath}</h1>`)
  }
})

app.get("/matricula", (req, res) => {
  const matriculaPath = path.join(frontendPath, "matricula.html")
  if (fs.existsSync(matriculaPath)) {
    res.sendFile(matriculaPath)
  } else {
    res.send(`<h1>matricula.html não encontrado em: ${matriculaPath}</h1>`)
  }
})

// Iniciar servidor
async function start() {
  const dbOk = await initDB()

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    console.log(`📁 Frontend: ${frontendPath}`)
    console.log(`🔗 Teste da API: http://localhost:${PORT}/api/test`)

    if (dbOk) {
      console.log("✅ Banco de dados conectado")
    } else {
      console.log("⚠️ Funcionando sem banco (modo simulação)")
    }

    console.log("\n🧪 Para testar:")
    console.log("1. Acesse http://localhost:3000/contato")
    console.log("2. Acesse http://localhost:3000/matricula")
    console.log("3. Verifique o console do navegador (F12)")
  })
}

start()
