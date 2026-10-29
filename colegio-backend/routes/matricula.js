const express = require("express")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const { executeQuery } = require("../config/database")
const router = express.Router()

// Rota para enviar matrícula
router.post(
  "/enviar",
  [
    body("nomeAluno").notEmpty().withMessage("Nome do aluno é obrigatório"),
    body("dataNascimento").isDate().withMessage("Data de nascimento inválida"),
    body("serie").notEmpty().withMessage("Série é obrigatória"),
    body("nomeResponsavel").notEmpty().withMessage("Nome do responsável é obrigatório"),
    body("cpfResponsavel").notEmpty().withMessage("CPF do responsável é obrigatório"),
    body("telefone").notEmpty().withMessage("Telefone é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("termoAceite").equals("true").withMessage("Você deve aceitar os termos"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        })
      }

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

      // Gerar senha temporária para o aluno
      const senhaTemporaria = Math.random().toString(36).slice(-8)
      const senhaHash = await bcrypt.hash(senhaTemporaria, 10)

      // Iniciar transação
      const connection = await require("../config/database").pool.getConnection()

      try {
        console.log("📝 Dados recebidos:", req.body)
        await connection.beginTransaction()

        // Inserir aluno
        const queryAluno = `
        INSERT INTO alunos (
          nome_completo, data_nascimento, genero, cpf, rg, endereco, cep, cidade,
          serie, turno, escola_anterior, email, senha, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
      `

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

        // Inserir responsável
        const queryResponsavel = `
        INSERT INTO responsaveis (
          aluno_id, nome_completo, parentesco, cpf, telefone, email, endereco
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `

        const [resultResponsavel] = await connection.execute(queryResponsavel, [
          alunoId,
          nomeResponsavel,
          parentesco || "responsavel",
          cpfResponsavel,
          telefone,
          email,
          enderecoResponsavel || endereco || null,
        ])

        const responsavelId = resultResponsavel.insertId

        // Inserir matrícula
        const queryMatricula = `
        INSERT INTO matriculas (
          aluno_id, responsavel_id, observacoes, autorizacao_imagem, termo_aceite, status
        ) VALUES (?, ?, ?, ?, ?, 'pendente')
      `

        const [resultMatricula] = await connection.execute(queryMatricula, [
          alunoId,
          responsavelId,
          observacoes || null,
          autorizacaoImagem === "true" ? 1 : 0,
          1,
        ])

        const matriculaId = resultMatricula.insertId

        // Confirmar transação
        await connection.commit()

        console.log("✅ Aluno inserido com ID:", alunoId)
        console.log("✅ Matrícula inserida com ID:", matriculaId)

        res.json({
          success: true,
          message: "Matrícula enviada com sucesso! Em breve entraremos em contato.",
          senhaTemporaria, // Em produção, enviar por email
        })
      } catch (error) {
        // Reverter transação em caso de erro
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error("Erro ao processar matrícula:", error)

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
  },
)

// Rota para listar matrículas (admin)
router.get("/listar", async (req, res) => {
  try {
    const query = `
      SELECT 
        m.id,
        m.status as status_matricula,
        m.data_solicitacao,
        a.nome_completo as nome_aluno,
        a.serie,
        a.turno,
        r.nome_completo as nome_responsavel,
        r.telefone,
        r.email
      FROM matriculas m
      JOIN alunos a ON m.aluno_id = a.id
      JOIN responsaveis r ON m.responsavel_id = r.id
      ORDER BY m.data_solicitacao DESC
    `

    const matriculas = await executeQuery(query)

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

// Rota para aprovar/rejeitar matrícula
router.put(
  "/:id/status",
  [body("status").isIn(["aprovada", "rejeitada"]).withMessage("Status inválido")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        })
      }

      const { id } = req.params
      const { status } = req.body

      // Atualizar status da matrícula
      const queryMatricula = `
      UPDATE matriculas 
      SET status = ? 
      WHERE id = ?
    `

      await executeQuery(queryMatricula, [status, id])

      // Se aprovada, ativar aluno
      if (status === "aprovada") {
        const queryAluno = `
        UPDATE alunos a
        JOIN matriculas m ON a.id = m.aluno_id
        SET a.status = 'ativo'
        WHERE m.id = ?
      `

        await executeQuery(queryAluno, [id])
      }

      res.json({
        success: true,
        message: `Matrícula ${status} com sucesso!`,
      })
    } catch (error) {
      console.error("Erro ao atualizar status da matrícula:", error)
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      })
    }
  },
)

module.exports = router
