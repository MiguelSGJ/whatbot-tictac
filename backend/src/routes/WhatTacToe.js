const router = require('express').Router()
const Oracle = require('../model/Oracle');
const fss = require("fs");
const path = require("path");

const oracle = new Oracle(process.env.BACKEND_ORACLE_HOST);

const initializedGames = new Set();

router.put("/game", async (req, res) => {
  console.log("➡️  CHEGOU EM /game:", req.body);

  let { gameId, position, from } = req.body;
  let type;

  if (!gameId) {
    gameId = from;
    if (initializedGames.has(gameId)) {
      type = "move";
      console.log("🔄 GameId já existe, é MOVE:", gameId);
    } else {
      type = "newGame";
      console.log("🆕 Criando novo gameId a partir do número de celular:", gameId);
    }
  } else {
    if (initializedGames.has(gameId)) {
      type = "move";
      console.log("🔄 GameId EXISTENTE, é MOVE:", gameId);
    } else {
      type = "newGame";
      console.log("🆕 GameId NOVO recebido, registrando:", gameId);
    }
  }

  initializedGames.add(gameId);

  const payload = { type, gameId, isValid: true, res: null };
  if (type === "newGame") {
    payload.gameMode = "1";
  } else if (type === "move" && position != null) {
    payload.position = position;
  }

  try {
    console.log("🚀 Enviando para o motor C:", payload);
    const result = await oracle.sendData('/game', payload, 'PUT');

    console.log("✅ Retorno do motor:", JSON.stringify(result, null, 2));

    if (!result?.isReturnData) {
      console.error("❌ isReturnData faltando ou falso:", result);
      return res.status(502).json({ message: "'isReturnData' faltando ou falso", detail: result });
    }

    const mediaBase64 = result.data?.media?.[0]?.data;
    console.log("🖼️  Base64 da imagem:", mediaBase64 ? "✅ RECEBIDO" : "❌ NÃO RECEBIDO");

    const media = mediaBase64 ? [
      {
        type: "IMAGE",
        mimeType: "image/png",
        data: mediaBase64
      }
    ] : [];

    const jump = result.data.jump;
    const responseGameId = result.data.gameId || gameId;

    console.log("🦘 Jump recebido:", jump ?? "❌ Não veio jump");

    console.log("📦 Respondendo para o cliente:", {
      isReturnData: true,
      data: { media, jump, gameId: responseGameId }
    });

    return res.json({
      isReturnData: true,
      data: { media, jump, gameId: responseGameId }
    });

  } catch (err) {
    console.error("🔥 Erro interno em /game:", err);
    return res.status(500).json({ message: "Erro interno em /game", error: err.toString() });
  }
});

router.put('/move', async (req, res) => {
  console.log("CHEGOU EM /move (externa):", req.body);

  const { from, moveId } = req.body;
  const gameId = from;

  if (!gameId) {
    return res.status(400).json({ message: '"from" (número do celular) é obrigatório como gameId' });
  }

  const position = moveId != null ? parseInt(moveId, 10) : undefined;

  const payload = {
    type: 'move',
    gameId,
    isValid: true,
    res: null,
    ...(Number.isInteger(position) ? { position } : {})
  };

  try {
    console.log("Enviando para /move (interna):", payload);
    const result = await oracle.sendData('/move', payload, 'PUT');

    console.log("Resposta de /move (interna):", result);

    if (!result?.isReturnData) {
      return res.status(502).json({ message: 'isReturnData faltando ou falso', detail: result });
    }

    const media = result.data.media || [];
    const list  = result.data.list  || [];
    const jump  = result.data.jump;

    return res.json({
      isReturnData: true,
      data: { media, list, jump }
    });
  } catch (err) {
    console.error('Erro na rota /move (externa):', err);
    return res.status(500).json({ message: 'Erro interno ao processar jogada', error: err.toString() });
  }
});

module.exports = router