import axios from "axios"
import PDFDocument from "pdfkit"
import * as XLSX from "xlsx"
import fs from "fs"

/**
 * Obtém todos os usuários da API JSONPlaceholder,
 * retornando apenas os campos "id" e "name"
 *
 * @returns {Promise<Array<{id: number, name: string}>} uma Promise de um array de usuários com id e nome
 */
async function getAllUsers() {
    // OBS: o ideal seria algo tipo GET /users?fields=id,name (evitaria exposição de dados desnecessários e imagino que seria menos custoso), mas a JSONplaceholder não suporta
    try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/users", { timeout: 5000 })
        return response.data.map(({ id, name }) => ({ id, name })) // aqui, ({ id, name }) => ({ id, name }) é um destructuring: desmonta os 2 parâmetros do objeto e monta um novo só com eles (mágica)
    } catch(error) {
        console.error("Erro na requisição de usuários via getUser: ", error.message || error)
        return [] // parece tampa-buraco, mas a ideia é dizer que nenhum usuario foi encontrado
    }
}

/**
 * Obtém todos os posts da API JSONPlaceholder 
 * dos usuários com IDs dados em userIDs
 *
 * @param {Array<number>} userIDs um array de IDs de usuários para filtrar os posts
 * @returns {Promise<Array<Object>>} uma Promise de um array de posts dos usuários com IDs dados em userIDs
 */
async function getPosts(userIDs) {
    try {
        // check se userIDs é um array de numeros ou apenas um numero (OBS: um array de não-números pode passar essa validação, mas vai dar erro mais pra frente)
        if (!Array.isArray(userIDs || typeof userIDs !== "number")) {
            throw new Error("Parâmetro userIDs deve ser um número ou um array números.")
        }

        if (typeof userIDs === "number") {
               userIDs = [userIDs]
        }
        
        const response = await axios.get("https://jsonplaceholder.typicode.com/posts/", { timeout: 5000 })
        const posts = response.data // é um array
        const postsByUserIDs = posts.filter(post => userIDs.includes(post.userId)) // nesta linha, aplicamos um filtro que apenas pega objetos (posts) que tem ID contido em userIDs

        return postsByUserIDs
    } catch(error) {
        console.error("Erro na requisição de posts via getPosts: ", error.message || error)
        return [] // parece tampa-buraco, mas a ideia é que nenhum post foi encontrado para o usuario
    }
}

/**
 * Calcula array com qtd de posts e tamanho médio dos posts de cada usuário
 *
 * @param {Array<Object>} posts - array de posts contendo as propriedades userId e body
 * @returns {Array<{userId: number, postCount: number, meanPostSize: number}>} array com qtd de posts e tamanho médio dos posts de cada usuário
 */
function meanPostSizeByUser(posts) {
    try {
        if (!Array.isArray(posts)) {
            throw new Error("O parâmetro posts deve ser um array.") // OBS: um array de não-posts pode passar essa validação, mas vai dar erro mais pra frente) 
        }

        let postsInfo = {}
    
        // loop para contar quantos posts cada usuário fez e qual tamanho de cada um deles 
        posts.forEach(post => {
            const size = post.body.length
            const userID = post.userId
    
            if (!postsInfo[userID]) {
                postsInfo[userID] = { totalPostsSize: size, postCount: 1 } // cria JSON com contagem começando em 1
            } else {
                postsInfo[userID].totalPostsSize += size
                postsInfo[userID].postCount += 1
            }
        })
    
        const result = []
    
        // loop para calcular a média de posts e gerar resultado final que vai pro relatório
        for (const userId in postsInfo) {
                const { totalPostsSize, postCount } = postsInfo[userId]
    
                result.push({
                    userId: Number(userId),
                    postCount : postCount,
                    meanPostSize: totalPostsSize / postCount
            })
        }
    
        return result
    } catch(error) {
        console.error("Erro no cálculo da média de caracteres dos posts em meanPostSizeByUser: ", error.message || error)
        return [] 
    }
}

function _generateUsersPostsReportExcel(reportData) {
    try {
        const formattedData = reportData.map(item => ({
            "ID do Usuário": item.userId,
            "Nome do Usuário": item.name,
            "Qtd. de Posts": item.postCount,
            "Média de Caracteres": item.meanPostSize.toFixed(2),
        }))

        const worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })
        fs.writeFileSync("./report.xlsx", excelBuffer)
    } catch (error) {
        console.error("Erro ao gerar relatório de posts dos usuários em generateUsersPostsReportExcel: ", error.message || error)
        throw new Error("Erro ao gerar relatório de posts dos usuários em generateUsersPostsReportExcel")
    }
}

// OBS: este PDF nao passa de 1 página
function _generateUsersPostsReportPDF(reportData) {
    try {
        const doc = new PDFDocument({ margin: 60 }) // margem maior no geral
        const filePath = './report.pdf'
        doc.pipe(fs.createWriteStream(filePath))

        doc.fontSize(18).font('Helvetica-Bold').text('Relatório de Usuários e Posts', {
            align: 'center',
        })
        doc.moveDown(2.5)

        const startY = 100
        const rowHeight = 32 // altura da "linha" do cabeçalho
        const colX = [60, 170, 370, 490]
        doc.fontSize(9.5).font('Helvetica-Bold')

        doc.text('ID do Usuário', colX[0], startY)
        doc.text('Nome do Usuário', colX[1], startY)
        doc.text('Qtd. de Posts', colX[2], startY)
        doc.text('Média de Caracteres', colX[3], startY)

        // Linha abaixo do cabeçalho — ajustada para ficar mais abaixo
        doc.moveTo(50, startY + rowHeight - 10).lineTo(550, startY + rowHeight - 10).stroke()

        reportData.forEach((item, index) => {
            const y = startY + 30 + index * rowHeight
            doc.text(item.userId.toString(), colX[0], y)
            doc.text(item.name, colX[1], y)
            doc.text(item.postCount.toString(), colX[2], y)
            doc.text(item.meanPostSize.toFixed(2), colX[3], y)
        })

        doc.end()
    } catch (error) {
        console.error("Erro no ao gerar relatório de posts dos usuários em generateUsersPostsReportPDF:", error.message || error)

        throw new Error("Erro no ao gerar relatório de posts dos usuários em generateUsersPostsReportPDF")
    }
}

function generateUsersPostsReport(reportData, reportType) {
    try {
        if (reportType == "Excel") {
            _generateUsersPostsReportExcel(reportData)
        }
        else if (reportType == "PDF") {
            _generateUsersPostsReportPDF(reportData)
        }
    } catch (error) {
        console.error("Erro no ao gerar relatório de posts dos usuários em generateUsersPostsReport: ", error.message || error)
    }
}

function isValidString(value) {
  return typeof value === "string" && value.trim() !== "" // esse value.trim() remove todos os espaços da string!!!!
}

// modularizando:
export { getAllUsers, getPosts, meanPostSizeByUser, generateUsersPostsReport, isValidString}