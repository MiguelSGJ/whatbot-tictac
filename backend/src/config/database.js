const { Database } = require("arangojs")


const db = {
  base: new Database(
    {
      url: process.env.DB_HOST, // URL do servidor ArangoDB
      databaseName: process.env.DB_NAME,   // Nome do banco de dados que você deseja criar
      auth: { username: process.env.DB_USER, password: process.env.DB_PASS } // Credenciais de autenticação
    }
  ),
  process: new Database(
    {
      url: process.env.DB_PROCESS_HOST, // URL do servidor ArangoDB
      databaseName: process.env.DB_PROCESS_NAME,   // Nome do banco de dados que você deseja criar
      auth: { username: process.env.DB_PROCESS_USER, password: process.env.DB_PROCESS_PASS } // Credenciais de autenticação
    }
  ),
  bot: new Database(
    {
      url: process.env.DB_BOT_HOST, // URL do servidor ArangoDB
      databaseName: process.env.DB_BOT_NAME,   // Nome do banco de dados que você deseja criar
      auth: { username: process.env.DB_BOT_USER, password: process.env.DB_BOT_PASS } // Credenciais de autenticação
    }
  ),
}
module.exports = db;

