const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

// Importar configuração do banco
const { testConnection } = require("./config/database")
const { getFrontendPath } = require("./config/paths")

// Importar rotas
const contatoRoutes = require("./routes/contato")
const authRoutes = require("./routes/auth")
const matriculaRoutes = require("./routes/matricula")

const app = express()
const PORT = process.env.PORT || 3000

// Detectar pasta frontend automaticamente
const frontendPath = getFrontendPath()

// Middlewares de segurança
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)

// Middlewares para parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Servir arquivos estáticos
app.use(express.static(frontendPath))

// Rotas da API
app.use("/api/contato", contatoRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/matricula", matriculaRoutes)

// Rota de teste da API
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API do Colégio Mentes Brilhantes funcionando!",
    timestamp: new Date().toISOString(),
    frontendPath: frontendPath,
  })
})

// Função para verificar se arquivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

// Rota principal
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html")
  if (fileExists(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send(`
      <h1>Arquivo index.html não encontrado</h1>
      <p>Procurando em: ${indexPath}</p>
      <p>Certifique-se de que o arquivo index.html está na pasta frontend</p>
    `)
  }
})

// Rotas para páginas específicas
const pages = ["contato", "login", "matricula", "ciclos", "galeria"]

pages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    const filePath = path.join(frontendPath, `${page}.html`)
    if (fileExists(filePath)) {
      res.sendFile(filePath)
    } else {
      // Fallback para index.html
      const indexPath = path.join(frontendPath, "index.html")
      if (fileExists(indexPath)) {
        res.sendFile(indexPath)
      } else {
        res.status(404).send(`Página ${page}.html não encontrada`)
      }
    }
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
  })
})

// Fallback para outras rotas
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "Endpoint da API não encontrado",
    })
  }

  const indexPath = path.join(frontendPath, "index.html")
  if (fileExists(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send("Página não encontrada")
  }
})

// Iniciar servidor
async function startServer() {
  try {
    const dbConnected = await testConnection()

    if (!dbConnected) {
      console.log("⚠️  Servidor iniciado sem conexão com banco de dados")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`🌐 Acesse: http://localhost:${PORT}`)
      console.log(`📁 Pasta frontend: ${frontendPath}`)
      console.log(`🔗 API: http://localhost:${PORT}/api`)
      console.log(`🧪 Teste: http://localhost:${PORT}/api/test`)

      // Verificar se index.html existe
      const indexPath = path.join(frontendPath, "index.html")
      if (fileExists(indexPath)) {
        console.log("✅ index.html encontrado")
      } else {
        console.log("❌ index.html NÃO encontrado")
        console.log("   Verifique se o arquivo está em:", indexPath)
      }
    })
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()
