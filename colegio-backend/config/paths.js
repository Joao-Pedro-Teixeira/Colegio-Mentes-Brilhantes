const path = require("path")

// Função para detectar automaticamente a pasta frontend
function getFrontendPath() {
  const possiblePaths = [
    path.join(__dirname, "..", "frontend"), // ../frontend
    path.join(__dirname, "..", "..", "frontend"), // ../../frontend
    path.join(__dirname, "public"), // ./public
    path.join(__dirname, "..", "public"), // ../public
    path.join(__dirname, "frontend"), // ./frontend
  ]

  const fs = require("fs")

  for (const possiblePath of possiblePaths) {
    try {
      // Verificar se existe index.html na pasta
      const indexPath = path.join(possiblePath, "index.html")
      if (fs.existsSync(indexPath)) {
        console.log(`✅ Pasta frontend encontrada: ${possiblePath}`)
        return possiblePath
      }
    } catch (error) {
      // Continuar procurando
    }
  }

  // Se não encontrar, usar padrão
  console.log("⚠️  Pasta frontend não encontrada automaticamente, usando padrão")
  return path.join(__dirname, "..", "frontend")
}

module.exports = {
  getFrontendPath,
}
