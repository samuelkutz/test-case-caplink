# Test Case: Automação de Processos e Dados

## 1. Introdução

Este projeto tem como objetivo apresentar um sistema capaz de realizar consultas à uma API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com/) e processar ps dados de forma a gerar um relatório em Excel ou PDF, com possibilidade de envio destes relatórios por e-mail. Mais especificamente, gerar um relatório contendo userIDs, nome do usuário, quantidade de posts e média do tamanho dos posts para cada usuário.

---

## 2. Detalhes das Operações

### Endpoint

* **URL:** `/send-email`
* **Método:** `POST`
* **Payload esperado:**

```json
{
  "to": "email@teste.com",
  "subject": "Assunto do e-mail",
  "reportType": "PDF" | "Excel",
  "body": "Texto do corpo do e-mail"
}
```

> **OBS:** o campo `reportType` deve obrigatoriamente ser **"PDF"** ou **"Excel"** (case sensitive). O uso de minúsculas (`"pdf"`) causará erro 400.

### Requisição válida

**Exemplo:**

```json
{
  "to": "email@teste.com",
  "subject": "Relatório",
  "reportType": "PDF",
  "body": "Segue em anexo o relatório solicitado."
}
```

**Resposta esperada:**

```json
{
  "message": "Email enviado com sucesso (simulado)"
}
```

**Status HTTP:** `200 OK`

### Requisições inválidas

Casos tratados explicitamente:

* Campos ausentes
* Campos nulos
* Campos com tipos incorretos (ex: número ou objeto em vez de string)
* Campos string contendo apenas espaços em branco
* `reportType` inválido

**Exemplo inválido:**

```json
{
  "to": "",
  "subject": "Relatório",
  "reportType": "Excel",
  "body": "Teste"
}
```

**Resposta esperada:**

```json
{
  "message": "Dados incompletos ou incorretos"
}
```

**Status HTTP:** `400 Bad Request`

---

## 3. Ferramentas e Configurações

* **Linguagem:** JavaScript
* **Ambiente de execução:** Node.js
* **Framework:** [Express.js](https://expressjs.com/)
* **Requisições HTTP (externas):** [Axios](https://axios-http.com/)
* **Geração de PDF:** [PDFKit](https://pdfkit.org/)
* **Geração de Excel:** [xlsx](https://www.npmjs.com/package/xlsx)
* **Package Manager:** [NPM](https://www.npmjs.com/)
* ***A execução de testes foi manual com JavaScript***

### Instalação do projeto

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na versão LTS mais recente.

### Passos para instalação e execução local

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/samuelkutz/test-case-caplink.git
   cd test-case-caplink
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Inicie o servidor:**

   ```bash
   npm start
   ```

4. O servidor estará rodando em:

   ```
   http://localhost:3000
   ```

---

## 4. Problemas e Soluções

### Alguns comentários e decisões técnicas:

> **OBS:** O código contém comentários sobre algumas decisões técnicas tomadas que, em parte, estão descritas abaixo.

* **Utilização de :**

  * Deliberadamente sensível a maiúsculas/minúsculas para enfatizar validações rígidas. Um teste específico cobre `"pdf"` em minúsculo, retornando erro como esperado.

* **Sensibilidade de `reportType`:**

  * Deliberadamente sensível a maiúsculas/minúsculas para enfatizar validações rígidas. Um teste específico cobre `"pdf"` em minúsculo, retornando erro como esperado.

* **Observação sobre APIs reais:**

  * Apesar de `https://jsonplaceholder.typicode.com` não suportar filtros de campos, a implementação simula uma boa prática desejável com `GET /users?fields=id,name`, evitando payloads muito grandes.

* **PDF com layout fixo:**

  * O PDF foi limitado a 1 página, com cabeçalho e estrutura de tabela desenhada manualmente, pois a API não contém tantos dados. Caso o volume fosse maior, seria preciso mais cuidado com a paginação do relatório PDF.

* **Validações insuficientes:**

  * A validação de entrada é rigorosa e cobre múltiplos cenários de falha, mas não é completa. Uma das considerações a ser feita é a mudança para linguagens tipadas, como TypeScript, isso reduziria a quantidade de validações consideravelmente, na minha visão.

* **Envio de e-mail:**

  * Como foi solicitado, o envio de e-mails é simulado, apenas. Isso nos força a salvar os arquivos na nossa máquina para ter acesso, o que não é uma boa ideia, pois ocuparia espaço no disco rígido rapidamente.
---

## 5. Conclusão

* Pessoalmente, estava um tempo sem ter uma oportunidade que me faça programar Node.js. Neste projeto, pude revisar com fervor minhas origens de Web Dev.

* O sistema foi projetado com intenções de escalabilidade, porém algumas questões sobre sobre envio do relatório prevalece: salvar no disco rígido não deve ser mantido.

* O uso de testes foi visto como uma necessidade diante da complexidade, apenas testes de "console.log" não estavam ajudando.
