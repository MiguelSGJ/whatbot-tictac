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
  const bot_name = "jaofe";
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

function start(client) {
  client.on("message", async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

    const allowedNumbers = [
      "558481671849@c.us",
      "558496914722@c.us",
      "558496245247@c.us",
      "558496531316@c.us",
      "558496345257@c.us",
      "558499076778@c.us",
      "558481553418@c.us",
    ];

    if (allowedNumbers.includes(message.from) && !message.from.includes("@g.us")) {
      const from = message.from;
      const text = message.body.toLowerCase();
      const name = message._data.notifyName;

      let contact = poolContact.isContact(from)
        ? await poolContact.getContact(from)
        : await poolContact.newContact(name, from);

      await bot.receive(contact, text);

      const pendingToDelivery = contact.getPendingToDelivery();

      const mimeExtensionMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'audio/ogg': 'ogg',    
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'video/mp4': 'mp4',
      };
      
      for (const element of pendingToDelivery) {
        if (element.media) {
          for (const media of element.media) {
            const extension = mimeExtensionMap[media.mimeType] || 'bin';
            const fileName = `file.${extension}`;
            const messageMedia = new MessageMedia(media.mimeType, media.data, fileName);
      
            // Configura as opções de envio
            const options = {};
            if (media.mimeType === 'video/mp4' && media.sendAsGif) {
              options.sendVideoAsGif = true;
            }
            // Se for áudio e estiver em OGG, envia como voice note
            if (media.mimeType === 'audio/ogg') {
              options.sendAudioAsVoice = true;
            }
            await client.sendMessage(from, messageMedia, options);
          }
        }
        if (element.text) {
          await client.sendMessage(from, element.text);
        }
      }
    }
  });
}

router.get("/reset", async (req, res) => {
  await resetClient();
  res.send({ message: "Cliente reiniciado com sucesso." });
});

router.put("/message", async (req, res) => {
  let { text, from, name } = req.body;

  let contact;

  if (!poolContact.isContact(from)) {
    contact = await poolContact.newContact(name, from);
  } else {
    contact = await poolContact.getContact(from);
  }

  await bot.receive(contact, text);

  let pendingToDelivery = contact.getPendingToDelivery();
  let txt = pendingToDelivery.map(element => element.text).join("");

  res.send({ from: from, text: txt });
});

module.exports = router;
