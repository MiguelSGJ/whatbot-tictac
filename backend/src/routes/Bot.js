const router = require("express").Router();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const Bot = require("../model/Bot");
const Oracle = require("../model/Oracle");
const PoolContact = require("../model/PoolContact");

const poolContact = new PoolContact();
let client; 
let bot;
let isClientReady = false;

async function resetClient() {
  if (client) {
    console.log(`Finalizando instância do cliente ${client.authStrategy?.clientId}...`);
    try {
      await client.destroy(); 
    } catch (error) {
      console.error("Erro ao destruir o cliente:", error);
    }
  }
  client = null;
  isClientReady = false; 
  console.log("Cliente finalizado e pronto para uma nova inicialização.");
}

router.get("/init", async (req, res) => {
  const bot_name = "whatTacToe";
  bot = new Bot(bot_name, new Oracle(`http://localhost:${process.env.MIDDLEWARE_PORT}`));
  await bot.loadPage(bot_name);
  console.log("nome do bot:", bot_name);
  res.send({ bot: { name: bot.name, page: bot.page } });
  console.log("nome do bot dps do send:", bot.name);
});

router.get("/qrcode/:bot_name", async (req, res) => {
  const bot_name = req.params.bot_name;
  console.log("nome do bot qr:", bot_name, req.params.bot_name);
  if (isClientReady) {
    console.log("Cliente já está pronto. Operação de inicialização não necessária.");
    return res.status(400).send({ error: "Cliente já está pronto." });
  }

  try {
    await resetClient(); // cliente anterior foi finalizado
    client = new Client({
      authStrategy: new LocalAuth({ clientId: bot_name }),
      puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    });

    client.once("qr", async (qr) => {
      try {
        const base64Qr = await QRCode.toDataURL(qr);
        if (!isClientReady) { 
          res.send({ qrcode: base64Qr, name: bot_name });
        }
      } catch (error) {
        console.error("Erro ao gerar o QR code em Base64:", error);
        if (!isClientReady) {
          return res.status(500).send({ error: "Erro ao gerar o QR code" });
        }
      }
    });

    client.once("ready", () => {
      console.log("Pode usar!");
      isClientReady = true; 
    });

    client.on("authenticated", () => {
      console.log(`Bot ${bot_name} autenticado`);
    });

    client.on("disconnected", async (reason) => {
      console.log("Cliente desconectado:", reason);
      await resetClient(); 
    });

    await client.initialize(); 
    start(client);
  } catch (error) {
    console.error("Erro ao inicializar o cliente:", error);
    if (!isClientReady) { 
      return res.status(500).send({ error: "Erro ao inicializar o cliente" });
    }
  }
});

async function start(client) {
  client.on("message", async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

    const from = message.from;
    const text = message.body.toLowerCase();
    const name = message._data.notifyName;

    const allowedNumbers = [
      "558481671849@c.us",
      "558496914722@c.us",
      "558496245247@c.us",
      "558496531316@c.us",
      "558496345257@c.us",
      "558499076778@c.us",
      "558481553418@c.us",
    ];
    if (!allowedNumbers.includes(from) || from.includes("@g.us")) {
      return;
    }

    // ——— Fluxo HTTP: chama /bot/v1/message e usa a resposta ———
    let responseJson;
    try {
      const resp = await fetch(
        `http://localhost:${process.env.SERVER_PORT}/bot/v1/message`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from, name }),
        }
      );
      responseJson = await resp.json();
    } catch (err) {
      console.error("Erro ao chamar /message por HTTP:", err);
      return;
    }

    // ——— Extrai texto e mídia do JSON retornado ———
    const replyText = responseJson.text || "";
    const mediaList = Array.isArray(responseJson.media)
      ? responseJson.media
      : [];

    // ——— Envia mídias ———
    const mimeExtensionMap = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "audio/ogg": "ogg",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "video/mp4": "mp4",
    };
    for (const m of mediaList) {
      const extension = mimeExtensionMap[m.mimeType] || "bin";
      const fileName = `file.${extension}`;
      const messageMedia = new MessageMedia(m.mimeType, m.data, fileName);

      const options = {};
      if (m.mimeType === "video/mp4" && m.sendAsGif) {
        options.sendVideoAsGif = true;
      }
      if (m.mimeType === "audio/ogg") {
        options.sendAudioAsVoice = true;
      }
      await client.sendMessage(from, messageMedia, options);
    }

    // ——— Envia texto ———
    if (replyText) {
      await client.sendMessage(from, replyText);
    }
  });
}

router.get("/reset", async (req, res) => {
  await resetClient();
  res.send({ message: "Cliente reiniciado com sucesso." });
});

router.put("/message", async (req, res) => {
  const { text, from, name } = req.body;
  if (!from) {
    return res
      .status(400)
      .json({ message: "`from` (número do usuário) é obrigatório" });
  }

  // 1) Obtém ou cria o contato
  const contact = poolContact.isContact(from)
    ? await poolContact.getContact(from)
    : await poolContact.newContact(name, from);

  // 2) Executa o fluxo do bot
  await bot.receive(contact, text);

  // 3) Coleta pendências de entrega (texto + mídia)
  const pending = contact.getPendingToDelivery();
  let replyText = "";
  const media = [];

  for (const el of pending) {
    if (el.text) {
      replyText += el.text;
    }
    if (el.media) {
      media.push(...el.media);
    }
  }

  // 4) Devolve texto e mídia
  return res.json({
    from,
    text: replyText,
    media,
  });
});

module.exports = router;
