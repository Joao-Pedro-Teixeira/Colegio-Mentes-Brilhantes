const express = require("express")
const path = require("path")
const app = express()

// Servir arquivos da pasta frontend (ajuste o caminho conforme necessário)
app.use(express.static(path.join(__dirname, "..", "frontend")))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"))
})

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000")
  console.log("Pasta frontend:", path.join(__dirname, "..", "frontend"))
})