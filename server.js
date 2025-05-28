import { reportController } from './src/controllers/reportController.js'
import express from "express"

const app = express()
const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`)
})

app.use(express.json()) // middleware para ler JSON no body das requisições

// adicionamos um controlador para a rota /send-email
app.post('/send-email', reportController)