const express = require("express")
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

// ===== SIMULAÇÃO DE BANCO DE DADOS (ARRAYS) =====
const contatos = []
const visitas = []
const matriculas = []
const alunos = []

// ===== ROTA DE TESTE =====
app.get("/api/test", (req, res) => {
  console.log("🧪 Teste da API")
  res.json({
    success: true,
    message: "API funcionando sem banco de dados!",
    timestamp: new Date().toISOString(),
    dados: {
      contatos: contatos.length,
      visitas: visitas.length,
      matriculas: matriculas.length,
    },
  })
})

// ===== ROTA DE CONTATO =====
app.post("/api/contato/enviar", (req, res) => {
  console.log("📧 Contato recebido:", req.body)

  try {
    const { nome, email, assunto, mensagem } = req.body

    if (!nome || !email || !mensagem) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e mensagem são obrigatórios",
      })
    }

    // Salvar em array (simulando banco)
    const novoContato = {
      id: contatos.length + 1,
      nome,
      email,
      assunto: assunto || "",
      mensagem,
      data: new Date().toISOString(),
    }

    contatos.push(novoContato)

    console.log("✅ Contato salvo:", novoContato)
    console.log(`📊 Total de contatos: ${contatos.length}`)

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso! Retornaremos em breve.",
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
app.post("/api/contato/agendar-visita", (req, res) => {
  console.log("📅 Visita recebida:", req.body)

  try {
    const { nome, telefone, email, data, observacoes } = req.body

    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome, telefone e email são obrigatórios",
      })
    }

    // Salvar em array (simulando banco)
    const novaVisita = {
      id: visitas.length + 1,
      nome,
      telefone,
      email,
      data: data || null,
      observacoes: observacoes || "",
      dataAgendamento: new Date().toISOString(),
    }

    visitas.push(novaVisita)

    console.log("✅ Visita salva:", novaVisita)
    console.log(`📊 Total de visitas: ${visitas.length}`)

    res.json({
      success: true,
      message: "Visita agendada com sucesso! Entraremos em contato para confirmar.",
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
app.post("/api/matricula/enviar", (req, res) => {
  console.log("📝 Matrícula recebida:", req.body)

  try {
    const dados = req.body

    // Validação básica
    const nomeAluno = dados.nomeAluno || dados.nome_aluno || dados.nome
    const email = dados.email

    if (!nomeAluno || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome do aluno e email são obrigatórios",
      })
    }

    // Gerar senha
    const senha = "senha" + Math.floor(Math.random() * 10000)

    // Criar aluno
    const novoAluno = {
      id: alunos.length + 1,
      nome: nomeAluno,
      email: email,
      senha: senha,
      cpf: dados.cpfAluno || null,
      serie: dados.serie || "",
      turno: dados.turno || "",
      status: "pendente",
      dataCriacao: new Date().toISOString(),
    }

    alunos.push(novoAluno)

    // Criar matrícula
    const novaMatricula = {
      id: matriculas.length + 1,
      alunoId: novoAluno.id,
      nomeAluno: nomeAluno,
      email: email,
      nomeResponsavel: dados.nomeResponsavel || dados.nome_responsavel || "",
      telefone: dados.telefone || "",
      serie: dados.serie || "",
      status: "pendente",
      dataSolicitacao: new Date().toISOString(),
      dadosCompletos: dados,
    }

    matriculas.push(novaMatricula)

    console.log("✅ Aluno criado:", novoAluno)
    console.log("✅ Matrícula salva:", novaMatricula)
    console.log(`📊 Total de matrículas: ${matriculas.length}`)

    res.json({
      success: true,
      message: "Matrícula enviada com sucesso! Seus dados de acesso foram criados.",
      dadosAcesso: {
        email: email,
        senha: senha,
        matriculaId: novaMatricula.id,
      },
    })
  } catch (error) {
    console.error("❌ Erro na matrícula:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// ===== ROTA PARA VER DADOS SALVOS =====
app.get("/api/admin/dados", (req, res) => {
  res.json({
    success: true,
    dados: {
      contatos: contatos,
      visitas: visitas,
      matriculas: matriculas,
      alunos: alunos,
    },
  })
})

// ===== ROTAS PARA PÁGINAS =====
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html")
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(`
      <h1>❌ index.html não encontrado</h1>
      <p>Procurando em: ${indexPath}</p>
      <p>Certifique-se de que seus arquivos HTML estão na pasta 'frontend'</p>
    `)
  }
})

app.get("/contato", (req, res) => {
  const contatoPath = path.join(frontendPath, "contato.html")
  if (fs.existsSync(contatoPath)) {
    res.sendFile(contatoPath)
  } else {
    res.send(`<h1>❌ contato.html não encontrado em: ${contatoPath}</h1>`)
  }
})

app.get("/matricula", (req, res) => {
  const matriculaPath = path.join(frontendPath, "matricula.html")
  if (fs.existsSync(matriculaPath)) {
    res.sendFile(matriculaPath)
  } else {
    res.send(`<h1>❌ matricula.html não encontrado em: ${matriculaPath}</h1>`)
  }
})

// Fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "Endpoint não encontrado" })
  }
  res.redirect("/")
})

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📁 Pasta frontend: ${frontendPath}`)
  console.log(`🔗 Teste: http://localhost:${PORT}/api/test`)
  console.log(`📊 Ver dados: http://localhost:${PORT}/api/admin/dados`)

  console.log("\n✅ SERVIDOR SEM BANCO DE DADOS")
  console.log("📋 Funcionalidades:")
  console.log("   ✅ Formulário de contato")
  console.log("   ✅ Agendamento de visita")
  console.log("   ✅ Matrícula com login/senha")
  console.log("   ✅ Dados salvos em memória")

  console.log("\n🧪 Para testar:")
  console.log("   1. http://localhost:3000/contato")
  console.log("   2. http://localhost:3000/matricula")
  console.log("   3. Abra F12 para ver os logs")
})
