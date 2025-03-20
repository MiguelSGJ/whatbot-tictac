require('dotenv').config()
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

const Bot = require("./src/routes/Bot")
const Jaofe = require("./src/routes/Jaofe")

const middleware = express()
//oracle.use(bodyParser.json({ limit: '50mb' }));
middleware.use(express.json());
middleware.use(cors({}));

middleware.use("/jaofe",Jaofe);

const middleware_port = process.env.MIDDLEWARE_PORT || 5006

middleware.listen(middleware_port, () => {
  console.log(`Bot oracle port ${middleware_port}`);
});

const app = express()

app.use(cors({}));
//app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());

app.use("/bot/v1",Bot)

const port = process.env.SERVER_PORT || 4006; 
// Inicia o servidor Express.js
app.listen(port, () => {
  console.log(`Bot backend port ${port}`);
});
