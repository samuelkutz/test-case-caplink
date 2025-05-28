import axios from "axios"

// OBS: sei que existem biblioteotecas exclusivas para testes, mas ainda não estou confortável em usá-las. Porém, confesso ter tido ajuda do GPT para gerar esta parte

async function testSendEmail(data, expectedStatus, testName) {
  try {
    const response = await axios.post("http://localhost:3000/send-email", data)
    if (response.status === expectedStatus) {
      console.log(`✅ ${testName}: passou (status ${response.status})`)
    } else {
      console.log(`❌ ${testName}: falhou (esperado ${expectedStatus}, recebeu ${response.status})`)
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === expectedStatus) {
        console.log(`✅ ${testName}: passou (status ${error.response.status})`)
      } else {
        console.log(`❌ ${testName}: falhou (esperado ${expectedStatus}, recebeu ${error.response.status})`)
      }
    } else {
      console.log(`❌ ${testName}: falhou com erro na requisição: ${error.message}`)
    }
  }
}


async function runTests() {
  // campos ausentes ou inválidos
  await testSendEmail({}, 400, 'Sem dados')
  await testSendEmail({ to: '', subject: 'x', reportType: 'PDF', body: 'x' }, 400, 'Campo "to" vazio')
  await testSendEmail({ to: 'email@teste.com', subject: '', reportType: 'PDF', body: 'x' }, 400, 'Campo "subject" vazio')
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: 'Invalid', body: 'x' }, 400, 'ReportType inválido')
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: 'PDF' }, 400, 'Falta campo "body"')
  await testSendEmail({ to: '   ', subject: 'x', reportType: 'PDF', body: 'x' }, 400, 'Campo "to" com espaços em branco')

  // campos nulos ou tipos errados
  await testSendEmail({ to: null, subject: 'x', reportType: 'PDF', body: 'x' }, 400, 'Campo "to" null')
  await testSendEmail({ to: 'email@teste.com', subject: null, reportType: 'Excel', body: 'x' }, 400, 'Campo "subject" null')
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: null, body: 'x' }, 400, 'Campo "reportType" null')
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: 'PDF', body: null }, 400, 'Campo "body" null')
  await testSendEmail({ to: 123, subject: 456, reportType: 'PDF', body: 789 }, 400, 'Campos numéricos no lugar de string')
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: 'PDF', body: { text: 'objeto' } }, 400, 'Campo "body" como objeto JSON')

  // censibilidade de maiúsculas/minúsculas
  await testSendEmail({ to: 'email@teste.com', subject: 'x', reportType: 'pdf', body: 'x' }, 400, 'ReportType em minúsculas')

  // casos válidos
  await testSendEmail({ to: 'email@teste.com', subject: 'Teste PDF', reportType: 'PDF', body: 'conteúdo' }, 200, 'Dados válidos PDF')
  await testSendEmail({ to: 'email@teste.com', subject: 'Teste Excel', reportType: 'Excel', body: 'conteúdo' }, 200, 'Dados válidos Excel')
}

runTests()
