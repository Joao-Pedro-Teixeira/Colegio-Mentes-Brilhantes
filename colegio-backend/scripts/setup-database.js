const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function setupDatabase() {
  let connection

  try {
    console.log("🔧 Configurando banco de dados...")

    // Conectar sem especificar o banco (para criar o banco)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    })

    console.log("✅ Conectado ao MySQL")

    // Ler e executar schema
    const schemaPath = path.join(__dirname, "database-schema.sql")
    const schemaSQL = fs.readFileSync(schemaPath, "utf8")

    console.log("📋 Criando estrutura do banco...")
    await connection.execute(schemaSQL)
    console.log("✅ Estrutura criada com sucesso")

    // Ler e executar dados iniciais
    const dataPath = path.join(__dirname, "initial-data.sql")
    const dataSQL = fs.readFileSync(dataPath, "utf8")

    console.log("📊 Inserindo dados iniciais...")
    await connection.execute(dataSQL)
    console.log("✅ Dados iniciais inseridos")

    console.log("🎉 Banco de dados configurado com sucesso!")
    console.log("\n📝 Credenciais de teste:")
    console.log("Admin: admin@mentesbrilhantes.edu.br / senha: admin123")
    console.log("Responsável: joao.silva@email.com / senha: senha123")
  } catch (error) {
    console.error("❌ Erro ao configurar banco:", error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase()
}

module.exports = setupDatabase
