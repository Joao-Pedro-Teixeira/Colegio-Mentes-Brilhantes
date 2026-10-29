const express = require("express")
const router = express.Router()

// Middleware para acessar executeQuery
router.use((req, res, next) => {
  if (!req.executeQuery) {
    return res.status(500).json({
      success: false,
      message: "Erro de configuração do servidor",
    })
  }
  next()
})

// Rota para listar contatos (admin)
router.get("/contatos", async (req, res) => {
  try {
    const query = `
      SELECT id, nome, email, assunto, mensagem, data_envio, status 
      FROM contatos 
      ORDER BY data_envio DESC
    `
    const contatos = await req.executeQuery(query)

    res.json({
      success: true,
      contatos,
    })
  } catch (error) {
    console.error("Erro ao listar contatos:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Rota para listar visitas (admin)
router.get("/visitas", async (req, res) => {
  try {
    const query = `
      SELECT id, nome, telefone, email, data_preferida, observacoes, data_agendamento, status 
      FROM visitas 
      ORDER BY data_agendamento DESC
    `
    const visitas = await req.executeQuery(query)

    res.json({
      success: true,
      visitas,
    })
  } catch (error) {
    console.error("Erro ao listar visitas:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Rota para listar matrículas (admin)
router.get("/matriculas", async (req, res) => {
  try {
    const query = `
      SELECT 
        m.id,
        m.status as status_matricula,
        m.data_solicitacao,
        a.nome_completo as nome_aluno,
        a.serie,
        a.turno,
        a.email,
        m.nome_responsavel,
        m.telefone
      FROM matriculas m
      LEFT JOIN alunos a ON m.aluno_id = a.id
      ORDER BY m.data_solicitacao DESC
    `
    const matriculas = await req.executeQuery(query)

    res.json({
      success: true,
      matriculas,
    })
  } catch (error) {
    console.error("Erro ao listar matrículas:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Rota para ver todos os dados de uma vez
router.get("/dados", async (req, res) => {
  try {
    const contatos = await req.executeQuery("SELECT * FROM contatos ORDER BY data_envio DESC LIMIT 10")
    const visitas = await req.executeQuery("SELECT * FROM visitas ORDER BY data_agendamento DESC LIMIT 10")
    const alunos = await req.executeQuery(
      "SELECT id, nome_completo, email, serie, status, data_criacao FROM alunos ORDER BY data_criacao DESC LIMIT 10",
    )
    const matriculas = await req.executeQuery("SELECT * FROM matriculas ORDER BY data_solicitacao DESC LIMIT 10")

    res.json({
      success: true,
      dados: {
        contatos: contatos.length,
        visitas: visitas.length,
        alunos: alunos.length,
        matriculas: matriculas.length,
      },
      detalhes: {
        contatos,
        visitas,
        alunos,
        matriculas,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

module.exports = router
