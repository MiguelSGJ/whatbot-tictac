require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const Bot        = require("./src/routes/Bot");
const Jaofe      = require("./src/routes/Jaofe");
const WhatTacToe = require("./src/routes/WhatTacToe");

// Middleware para injetar o `from` global no req.body
let globalFrom = null;

const injectFrom = () => (req, res, next) => {
  if (req.body?.from) {
    globalFrom = req.body.from;
  }
  if (!req.body.from && globalFrom) {
    req.body.from = globalFrom;
  }
  next();
};

// ------------------- APP 1 — Middleware -------------------
const middleware = express();
middleware.use(cors());
middleware.use(express.json());
middleware.use(injectFrom()); // <- injeta o from aqui também

middleware.use("/jaofe", Jaofe);
middleware.use("/whatTacToe", WhatTacToe);

const middleware_port = process.env.MIDDLEWARE_PORT || 5006;
middleware.listen(middleware_port, () => {
  console.log(`Middleware rodando na porta ${middleware_port}`);
});

// ------------------- APP 2 — Backend do Bot -------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(injectFrom()); // <- injeta o from aqui também

app.use("/bot/v1", Bot);

const port = process.env.SERVER_PORT || 4006;
app.listen(port, () => {
  console.log(`Bot backend rodando na porta ${port}`);
});
