const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function updateDatabase() {
  let connection

  try {
    // Conectar ao MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "colegio_mentes_brilhantes",
    })

    console.log("✅ Conectado ao MySQL")

    // Adicionar colunas uma por uma para evitar erros
    const alterCommands = [
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS aluno_id INT",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS responsavel_id INT",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS nome_aluno VARCHAR(255)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS data_nascimento DATE",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS serie VARCHAR(50)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS nome_responsavel VARCHAR(255)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS cpf_responsavel VARCHAR(14)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS telefone VARCHAR(20)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS autorizacao_imagem BOOLEAN DEFAULT FALSE",
      "ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS termo_aceite BOOLEAN DEFAULT FALSE",
    ]

    console.log("🔄 Atualizando estrutura da tabela matriculas...")

    for (const command of alterCommands) {
      try {
        await connection.execute(command)
        console.log("✅", command)
      } catch (error) {
        if (error.code === "ER_DUP_FIELDNAME") {
          console.log("⚠️ Coluna já existe:", command)
        } else {
          console.log("❌ Erro:", command, error.message)
        }
      }
    }

    // Mostrar estrutura atual da tabela
    console.log("\n📋 Estrutura atual da tabela matriculas:")
    const [columns] = await connection.execute("DESCRIBE matriculas")
    columns.forEach((col) => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`)
    })

    console.log("\n✅ Atualização concluída!")
  } catch (error) {
    console.error("❌ Erro ao atualizar banco:", error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateDatabase()
}

module.exports = updateDatabase
