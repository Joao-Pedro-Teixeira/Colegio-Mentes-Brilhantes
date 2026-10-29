const express = require("express")
const router = express.Router()
const { pool } = require("../server-complete")
const Joi = require("joi")

// Schema de validação para contato
const contatoSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  assunto: Joi.string().max(200).optional(),
  mensagem: Joi.string().min(10).max(1000).required(),
})

// Schema de validação para agendamento de visita
const visitaSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  telefone: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().required(),
  data: Joi.date().optional(),
  observacoes: Joi.string().max(500).optional(),
})

// POST /api/contato/mensagem - Enviar mensagem de contato
router.post("/mensagem", async (req, res) => {
  try {
    // Validar dados
    const { error, value } = contatoSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const { nome, email, assunto, mensagem } = value

    // Inserir no banco de dados
    const query = `
      INSERT INTO contatos (nome, email, assunto, mensagem, data_envio, status)
      VALUES (?, ?, ?, ?, NOW(), 'pendente')
    `

    const [result] = await pool.execute(query, [nome, email, assunto || "", mensagem])

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso! Retornaremos em breve.",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// POST /api/contato/visita - Agendar visita
router.post("/visita", async (req, res) => {
  try {
    // Validar dados
    const { error, value } = visitaSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const { nome, telefone, email, data, observacoes } = value

    // Inserir no banco de dados
    const query = `
      INSERT INTO agendamentos_visita (nome, telefone, email, data_preferida, observacoes, data_solicitacao, status)
      VALUES (?, ?, ?, ?, ?, NOW(), 'pendente')
    `

    const [result] = await pool.execute(query, [nome, telefone, email, data || null, observacoes || ""])

    res.json({
      success: true,
      message: "Visita agendada com sucesso! Entraremos em contato para confirmar.",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Erro ao agendar visita:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// GET /api/contato/mensagens - Listar mensagens (para admin)
router.get("/mensagens", async (req, res) => {
  try {
    const query = `
      SELECT id, nome, email, assunto, mensagem, data_envio, status
      FROM contatos
      ORDER BY data_envio DESC
      LIMIT 50
    `

    const [rows] = await pool.execute(query)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

module.exports = router
