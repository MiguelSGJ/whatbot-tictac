const router = require("express").Router();
const axios = require("axios");
const config = require("dotenv").config();

const GAME_API_URL = process.env.GAME_API_BACKEND;

//
// Inicia ou recupera um jogo, retornando imagem + gameId
//
router.put("/game", async (req, res) => {
  const { from } = req.body; // número de quem mandou a mensagem
  let gameId, imageBase64, board;

  try {
    // Tenta criar um jogo novo
    const resp = await axios.post(
      `${GAME_API_URL}/api/startgame/${encodeURIComponent(from)}`
    );
    gameId = resp.data.gameId;
    board = resp.data.board;
    imageBase64 = resp.data.gameBoardImage;
  } catch (err) {
    // Se o backend responder 400 com game já existente, extrai os dados
    if (err.response?.status === 400 && err.response.data.gameId) {
      gameId = err.response.data.gameId;
      board = err.response.data.board;
      imageBase64 = err.response.data.gameBoardImage;
    } else {
      console.error("Erro ao criar/recuperar jogo:", err.toString());
      return res
        .status(500)
        .json({ message: "Erro interno ao iniciar o jogo." });
    }
  }

  const media = imageBase64
    ? [{ type: "IMAGE", mimeType: "image/png", data: imageBase64 }]
    : [];

  // monta a lista de jogadas livres:
  const list = [];
  for (let n = 1; n <= 9; n++) {
    const row = Math.floor((n - 1) / 3);
    const col = (n - 1) % 3;
    if (board[row][col] === "") {
      const s = String(n);
      list.push({ id: String(n), text: String(n), value: s });
    }
  }

  return res.json({
    isReturnData: true,
    data: {
      gameId,
      list,
      media,
      jump: "option:/move",
    },
  });
});

// Handler unificado que funciona para GET e PUT
async function handleListagem(req, res) {
  // O Oracle prepara OPTION com PUT e passa no body; para curl usamos GET com query
  const from = req.body.from || req.query.from;
  const gameId = req.body.gameId || req.query.gameId;

  if (!from) {
    return res.status(400).json({ message: "from é obrigatório" });
  }

  try {
    // ATENÇÃO: aqui incluímos '/api' na rota para getgame, como você faz no startgame
    const respState = await axios.get(
      `${GAME_API_URL}/api/getgame/${encodeURIComponent(from)}`
    );
    const game = respState.data;

    if (!game || !Array.isArray(game.board)) {
      return res
        .status(500)
        .json({ message: "Estado do jogo inválido retornado pelo backend" });
    }

    // monta lista de casas livres
    const list = [];
    for (let n = 1; n <= 9; n++) {
      const row = Math.floor((n - 1) / 3),
        col = (n - 1) % 3;
      if (game.board[row][col] === "") {
        const s = String(n) + " ";
        list.push({ id: s, text: s, value: "casa: " + s + "\n" });
      }
    }

    return res.json({
      isReturnData: true,
      data: {
        gameId: gameId || from,
        list,
        jump: "option:/move",
      },
    });
  } catch (err) {
    console.error("Erro em listarJogadas:", err.toString());
    return res
      .status(500)
      .json({ message: "Erro ao listar jogadas disponíveis" });
  }
}

// responde tanto GET quanto PUT
router.get("/listarJogadas", handleListagem);
router.put("/listarJogadas", handleListagem);

//
// Recebe uma jogada, chama o backend e retorna imagem atualizada + lista + jump
//
router.put("/move", async (req, res) => {
  const { from, moveId, gameId } = req.body;

  if (!from) {
    return res.status(400).json({ message: "from é obrigatório" });
  }

  // 1) Se não veio moveId, só lista as casas livres
  if (moveId == null) {
    try {
      const respState = await axios.get(
        `${GAME_API_URL}/api/getgame/${encodeURIComponent(from)}`
      );
      const game = respState.data;

      const list = [];
      for (let n = 1; n <= 9; n++) {
        const row = Math.floor((n - 1) / 3),
          col = (n - 1) % 3;
        if (game.board[row][col] === "") {
          const s = String(n);
          list.push({ id: s, text: s, value: " casa: " + s + "\n" });
        }
      }

      return res.json({
        isReturnData: true,
        data: {
          gameId: gameId || from,
          list,
          jump: "option:/move",
        },
      });
    } catch (err) {
      console.error("Erro listando jogadas:", err);
      return res
        .status(500)
        .json({ message: "Erro ao listar jogadas disponíveis" });
    }
  }

  // 2) Se veio moveId, aplica a jogada normalmente
  try {
    const payload = {
      number: parseInt(moveId, 10),
      playerNumber: from,
    };
    const backendResponse = await axios.post(
      `${GAME_API_URL}/api/move`,
      payload
    );
    const { game } = backendResponse.data;

    // monta imagem
    const media = game.image
      ? [{ type: "IMAGE", mimeType: "image/png", data: game.image }]
      : [];

    // monta nova lista de livres
    const list = [];
    if (game.status !== "finished") {
      for (let n = 1; n <= 9; n++) {
        const row = Math.floor((n - 1) / 3),
          col = (n - 1) % 3;
        if (game.board[row][col] === "") {
          const s = String(n);
          list.push({ id: s, text: s, value: " casa: " + s + "\n" });
        }
      }
    }

    const jump =
      game.status === "finished"
        ? game.winner === "X"
          ? "info:/victory"
          : "info:/draw"
        : "option:/move";

    return res.json({
      isReturnData: true,
      data: {
        gameId: gameId || from,
        media,
        list,
        jump,
      },
    });
  } catch (err) {
    console.error("Erro aplicando jogada:", err.toString());
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || "Erro interno ao processar jogada";
    return res.status(status).json({ message });
  }
});

module.exports = router;