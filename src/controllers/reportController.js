import { getAllUsers, getPosts, meanPostSizeByUser, generateUsersPostsReport, isValidString } from '../services/reportService.js'

// no controller, realizamos as validações necessárias e geramos o relatório
async function reportController(req, res) {
  try {
    const { reportType, to, subject, body } = req.body

    if ( !isValidString(to) || !isValidString(subject) || !isValidString(body) || (reportType !== "PDF" && reportType !== "Excel")
    ) {
      return res.status(400).json({ message: "Dados incompletos ou incorretos" })
    }

    const users = await getAllUsers()
    const userIDs = users.map(user => user.id)
    const posts = await getPosts(userIDs)
    const reportInfo = meanPostSizeByUser(posts)

    const reportData = reportInfo.map(reportInfo => {
        const user = users.find(u => u.id === reportInfo.userId) // precisamos encontrar o nome de cada usuário com userID conhecido

        return {
            userId: reportInfo.userId,
            name: user ? user.name : "Nome não encontrado",
            postCount: reportInfo.postCount,
            meanPostSize: reportInfo.meanPostSize
        }
    })

    generateUsersPostsReport(reportData, reportType)

    // insira aqui código que envia email aqui 
    // (OBS: tem que ter um email para o "from" e também varia de serviço pra serviço, tipo gmail)

    console.log("------------------------------")
    console.log("Enviando e-mail:")
    console.log(`Para: ${to}`)
    console.log(`Assunto: ${subject}`)
    console.log(`Corpo:\n${body}`)

    res.status(200).json({ message: "Email enviado com sucesso (simulado)" })
  } catch (error) {
    console.error("Erro ao gerar ou enviar relatório:", error)
    res.status(500).send("Erro ao gerar relatório.")
  }
}

export { reportController }