const express = require("express")
const router = express.Router()
const { pool } = require("../server")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Joi = require("joi")

// Schema de validação para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

// Schema de validação para recuperação de senha
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
})

// POST /api/auth/login - Fazer login
router.post("/login", async (req, res) => {
  try {
    // Validar dados
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const { email, password } = value

    // Buscar usuário no banco
    const query = `
      SELECT u.id, u.nome, u.email, u.senha, u.tipo, u.ativo,
             a.id as aluno_id, a.serie, a.turno
      FROM usuarios u
      LEFT JOIN alunos a ON u.id = a.usuario_id
      WHERE u.email = ? OR u.cpf = ?
    `

    const [rows] = await pool.execute(query, [email, email])

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      })
    }

    const user = rows[0]

    // Verificar se o usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: "Conta desativada. Entre em contato com a secretaria.",
      })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, user.senha)
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
        aluno_id: user.aluno_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    )

    // Registrar login
    await pool.execute("INSERT INTO logs_login (usuario_id, ip, data_login) VALUES (?, ?, NOW())", [user.id, req.ip])

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          aluno_id: user.aluno_id,
          serie: user.serie,
          turno: user.turno,
        },
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

// POST /api/auth/forgot-password - Recuperar senha
router.post("/forgot-password", async (req, res) => {
  try {
    // Validar dados
    const { error, value } = forgotPasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
      })
    }

    const { email } = value

    // Verificar se o usuário existe
    const query = "SELECT id, nome, email FROM usuarios WHERE email = ?"
    const [rows] = await pool.execute(query, [email])

    if (rows.length === 0) {
      // Por segurança, sempre retornamos sucesso
      return res.json({
        success: true,
        message: "Se o email existir, as instruções foram enviadas.",
      })
    }

    const user = rows[0]

    // Gerar token de recuperação
    const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" })

    // Salvar token no banco
    await pool.execute(
      "INSERT INTO tokens_recuperacao (usuario_id, token, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
      [user.id, resetToken],
    )

    // Aqui você implementaria o envio de email
    // Por enquanto, apenas simulamos
    console.log(`Token de recuperação para ${email}: ${resetToken}`)

    res.json({
      success: true,
      message: "Instruções enviadas para seu email!",
    })
  } catch (error) {
    console.error("Erro na recuperação de senha:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token não fornecido",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    })
  }
}

// GET /api/auth/profile - Obter perfil do usuário
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nome, u.email, u.tipo,
             a.id as aluno_id, a.serie, a.turno, a.data_nascimento
      FROM usuarios u
      LEFT JOIN alunos a ON u.id = a.usuario_id
      WHERE u.id = ?
    `

    const [rows] = await pool.execute(query, [req.user.id])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
})

module.exports = router
