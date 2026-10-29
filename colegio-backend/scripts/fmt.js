const mysql = require("mysql2/promise")
require("dotenv").config()

async function fixMatriculasTable() {
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

    // Primeiro, vamos ver a estrutura atual da tabela
    console.log("📋 Estrutura atual da tabela matriculas:")
    try {
      const [columns] = await connection.execute("DESCRIBE matriculas")
      columns.forEach((col) => {
        console.log(`   ${col.Field} - ${col.Type}`)
      })
    } catch (error) {
      console.log("❌ Erro ao descrever tabela:", error.message)
    }

    console.log("\n🔄 Adicionando colunas faltantes...")

    // Adicionar colunas uma por uma
    const columnsToAdd = [
      { name: "aluno_id", type: "INT" },
      { name: "responsavel_id", type: "INT" },
      { name: "nome_aluno", type: "VARCHAR(255)" },
      { name: "data_nascimento", type: "DATE" },
      { name: "genero", type: "ENUM('masculino', 'feminino', 'outro')" },
      { name: "cpf_aluno", type: "VARCHAR(14)" },
      { name: "rg_aluno", type: "VARCHAR(20)" },
      { name: "endereco", type: "TEXT" },
      { name: "cep", type: "VARCHAR(10)" },
      { name: "cidade", type: "VARCHAR(100)" },
      { name: "serie", type: "VARCHAR(50)" },
      { name: "turno", type: "ENUM('manha', 'tarde', 'noite')" },
      { name: "escola_anterior", type: "VARCHAR(255)" },
      { name: "nome_responsavel", type: "VARCHAR(255)" },
      { name: "parentesco", type: "ENUM('pai', 'mae', 'avo', 'tio', 'responsavel', 'outro')" },
      { name: "cpf_responsavel", type: "VARCHAR(14)" },
      { name: "telefone", type: "VARCHAR(20)" },
      { name: "email", type: "VARCHAR(255)" },
      { name: "endereco_responsavel", type: "TEXT" },
      { name: "autorizacao_imagem", type: "BOOLEAN DEFAULT FALSE" },
      { name: "termo_aceite", type: "BOOLEAN DEFAULT FALSE" },
    ]

    for (const column of columnsToAdd) {
      try {
        // Verificar se a coluna já existe
        const [existing] = await connection.execute(
          `SELECT COUNT(*) as count FROM information_schema.columns 
           WHERE table_schema = ? AND table_name = 'matriculas' AND column_name = ?`,
          [process.env.DB_NAME || "colegio_mentes_brilhantes", column.name],
        )

        if (existing[0].count === 0) {
          // Coluna não existe, adicionar
          const sql = `ALTER TABLE matriculas ADD COLUMN ${column.name} ${column.type}`
          await connection.execute(sql)
          console.log(`✅ Adicionada coluna: ${column.name}`)
        } else {
          console.log(`⚠️ Coluna já existe: ${column.name}`)
        }
      } catch (error) {
        console.log(`❌ Erro ao adicionar ${column.name}:`, error.message)
      }
    }

    // Mostrar estrutura final
    console.log("\n📋 Estrutura final da tabela matriculas:")
    const [finalColumns] = await connection.execute("DESCRIBE matriculas")
    finalColumns.forEach((col) => {
      console.log(`   ${col.Field} - ${col.Type}`)
    })

    console.log("\n✅ Tabela matriculas atualizada com sucesso!")
    console.log("🔄 Agora você pode testar o formulário de matrícula novamente.")
  } catch (error) {
    console.error("❌ Erro geral:", error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Executar
fixMatriculasTable()
