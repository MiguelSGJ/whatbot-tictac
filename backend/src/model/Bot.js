const FrameOption = require("./FrameOption");
const FrameForm = require("./FrameForm");
const FrameInfo = require("./FrameInfo");
const InputForm = require("./InputForm");
const Page = require("./Page");
//const db = require("../config/database")
const Oracle = require("../model/Oracle");
const ObjectControl = require("./ObjectControl");

const oracle = new Oracle(process.env.BACKEND_ORACLE_HOST);

const oc = new ObjectControl();
class Bot {
  constructor(name, oracle) {
    this.listOpenSupport = [];
    this.name = name;
    this.oracle = oracle;
    this.listAdmin = [];
    this.page = {};
  }

  async loadPage(page_id) {
    let page = await oc.getDocByKey("WhatTacToe", page_id);

    this.page = new Page(page);
  }
  addAdmin(contact) {
    this.listAdmin.push(contact);
  }

  getSupport(contact) {
    this.listOpenSupport.find((s) => {
      return s.contact.number == contact.number;
    });
  }

  getName() {
    return this.name;
  }

  getWelcome() {
    return this.welcome;
  }

  start() {
    return this.welcome;
  }

  addMessageBlackList(contact) {
    contact.addMessage(
      "*Foi atingido o número máximo de tentativas. Entraremos em contato em breve por este canal.*",
      this.name,
      "",
      "BLACKLIST"
    );

    const listAdmin = this.listAdmin;
    listAdmin.forEach((c) => {
      c.addMessage(
        `*O contato a seguir foi inativado.*\n`,
        this.name,
        "",
        "BLACKLIST"
      );
    });
    if (contact.isOpenSupport()) {
      contact.closeSupport();
    }
  }

  getWecomeMessage() {
    return { text: this.welcome, type: "WELCOME", id: "" };
  }

  getContact(number) {
    return this.poolContact.getContact(number);
  }

  async optionResolver(contact, choice, dynamicJump = null) {
    console.log("optionResolver");

    const option = contact.support.currentFrame.getOption(choice);

    if (!option) {
      let last = contact.support.getCurrentMessage();
      contact.support.resetListMessageToDelivery();
      contact.support.addCurrentMessage({
        text: `*A opção ${choice} é inválida.*\n\n`,
        format: "TEXT",
        type: "ERROR/NOSHOWOPTION",
      });
      contact.support.addCurrentMessage(last);
      return;
    }

    if (option.id === "start") {
      contact.opeSupport(this.page);
    }

    if (option.content) {
      contact.support.addAttInSubmitData(
        option.content.id.name,
        option.content.id.value
      );
    }

    // Resolve qual jump usar:
    const jumpToUse =
      dynamicJump ||
      (option.onSelect && option.onSelect.jump) ||
      contact.support.currentFrame.dynamicJump ||
      null;

    if (jumpToUse) {
      await this.jumpResolver(contact, jumpToUse);
    } else {
      console.warn("Nenhum jump definido para essa opção.");
    }
  }

  async jumpResolver(contact, path) {
    console.log("jumpResolver");
    const frame = this.page.getFrame(path);
    let text = ``;

    if (frame.type === "INFO") {
      console.log("INFO");
      contact.support.currentFrame = new FrameInfo(frame);

      let dynamicJump = null; // <-- AQUI: inicia a variável

      // 1) obtém mídia se houver
      if (contact.support.currentFrame.mediaRoute) {
        try {
          const payloadMedia = {};
          const resultMedia = await this.oracle.sendData(
            contact.support.currentFrame.mediaRoute,
            payloadMedia
          );
          if (resultMedia.isReturnData && resultMedia.data.media) {
            contact.support.currentFrame.setMedia(resultMedia.data.media);
            if (resultMedia.data.list) {
              contact.support.addReturnData({ list: resultMedia.data.list });
            }
            if (resultMedia.data.jump) {
              // <-- CAPTURA jump dinâmico vindo da mídia
              dynamicJump = resultMedia.data.jump;
            }
          }
        } catch (error) {
          console.error("Erro ao buscar mídia da rota INFO:", error);
          contact.support.addCurrentMessage({
            text: "Erro ao carregar a mídia.",
            format: "ERROR",
          });
          return;
        }
      }

      // 2) executa prepare se existir, usando extractAttData
      const prepare = contact.support.currentFrame.prepare;
      if (prepare) {
        const dataToSubmit = contact.support.currentFrame.extractAttData(
          contact.support.submitData || {}
        );
        const r = await this.oracle.sendData(prepare.route, dataToSubmit);
        if (r.isReturnData) {
          contact.support.resetReturnData();
          contact.support.addReturnData(r.data);

          if (r.data.jump) {
            // <-- SE prepare também mandar jump, sobrescreve
            dynamicJump = r.data.jump;
          }
        }
      }

      // 3) envia o texto/resume do INFO
      const resume = contact.support.currentFrame.getResume(
        contact.support.submitData || {}
      );
      contact.support.addCurrentMessage(resume);

      // 4) prioriza qualquer jump vindo da API (mídia ou prepare)
      if (dynamicJump) {
        await this.jumpResolver(contact, dynamicJump);
        return;
      }

      // 5) se não veio jump dinâmico, respeita o jump estático do frame
      if (contact.support.currentFrame.jump) {
        await this.jumpResolver(contact, contact.support.currentFrame.jump);
        return;
      }

      // 6) por fim, se for exit, encerra o suporte
      if (contact.support.currentFrame.exit) {
        contact.closeSupport();
        return;
      }
    } else if (frame.type == "FORM") {
      contact.support.currentFrame = new FrameForm(frame);

      contact.support.currentInput = new InputForm(
        contact.support.currentFrame.nextInput()
      );

      contact.support.addCurrentMessage({
        text: contact.support.currentInput.text,
        type: "TEXT",
      });
    } else if (frame.type === "OPTION") {
    console.log("Iniciando OPTION frame");

    contact.support.currentFrame = new FrameOption(frame);
    const prepare = contact.support.currentFrame.prepare;

    console.log("Prepare:");
    console.log(JSON.stringify(prepare, null, 2));

    let dynamicJump = null;

    if (prepare) {
      console.log("Dados submitData antes do processMedia:");
      console.log(JSON.stringify(contact.support.submitData, null, 2));

      if (
        contact.support.submitData &&
        contact.support.submitData.mediaType &&
        contact.support.submitData.mediaData
      ) {
        let mediaInfo = await this.processMedia(contact.support.submitData);
        contact.support.submitData.media = mediaInfo;
      }

      console.log("Dados submitData após possível inclusão de mídia:");
      console.log(JSON.stringify(contact.support.submitData, null, 2));

      const route =
        prepare.media && prepare.media.route
          ? prepare.media.route
          : prepare.route;

      console.log("Rota que será usada para sendData:");
      console.log(route);

      let r;
      try {
        r = await this.oracle.sendData(route, contact.support.submitData);
      } catch (error) {
        console.error("Erro ao enviar dados (OPTION):", error);
        contact.support.addCurrentMessage({
          text: "Erro ao processar sua solicitação.",
          format: "ERROR",
        });
        return;
      }

      console.log("Resposta recebida de sendData:");
      console.log(JSON.stringify(r, null, 2));

      // preenche a lista de opções
      contact.support.currentFrame.fillList(r.data);
      text = contact.support.currentFrame.getResume();

      const messageData = {
        text,
        format: "TEXT",
      };
      if (r.data.media && Array.isArray(r.data.media)) {
        messageData.media = r.data.media;
      }
      contact.support.addCurrentMessage(messageData);

      // captura jump dinâmico, se veio
      if (r.data.jump) {
        console.log("Jump dinâmico detectado:");
        console.log(JSON.stringify(r.data.jump, null, 2));
        contact.support.currentFrame.dynamicJump = r.data.jump;
      }

      // **se a lista de opções estiver vazia, faz jump automático**
      if (contact.support.currentFrame.list.length === 0) {
        const dj =
          contact.support.currentFrame.dynamicJump ||
          contact.support.currentFrame.jump;
        if (dj) {
          console.log("Lista vazia: jump automático para", dj);
          await this.jumpResolver(contact, dj);
          return;
        }
      }

    } else {
      // fluxo sem prepare
      text = contact.support.currentFrame.getResume();
      contact.support.addCurrentMessage({ text, format: "TEXT" });
    }

    // prioriza o jump dinâmico
    if (dynamicJump) {
      console.log("Executando jump dinâmico...");
      await this.jumpResolver(contact, dynamicJump);
      return;
    }

    // caso não tenha jump dinâmico, verifica o jump estático
    if (contact.support.currentFrame.jump) {
      console.log("Executando jump estático...");
      await this.jumpResolver(
        contact,
        contact.support.currentFrame.jump
      );
      return;
    }

    // encerra se for exit
    if (contact.support.currentFrame.exit) {
      console.log("Encerrando atendimento via exit.");
      contact.closeSupport();
      return;
    }
  }
}

  getListAdmin() {
    return this.listAdmin;
  }

  async formResolver(contact, text) {
    console.log("formResolver");

    const last = contact.support.getCurrentMessage();
    contact.support.addAttInSubmitData(contact.support.currentInput.id, text);
    console.log("VERIFICANDO O CURRENTINPUT", contact.support.currentInput);

    let problem = false;
    const validates = contact.support.currentInput.validates || [];
    // console.log(validates)

    for (let i = 0; i < validates.length; i++) {
      let v = validates[i];
      console.log("VERIFICANDO V", v);

      let r = await this.oracle.sendData(v.route, contact.support.submitData);
      console.log("VERIFICANDO R", r);

      if (!!r.problem) {
        const p = v.problem.find((p) => {
          return p.type == r.problem;
        });

        if (p.action.times == 0) {
          contact.active = false;
          this.addMessageBlackList(contact);
        } else if (p.action.type == "RELAUNCH") {
          contact.support.addCurrentMessage({
            text: `${p.text} Você tem mais *${p.action.times}* ${
              p.action.times == 1 ? "tentativa" : "tentativas"
            }\n\n`,
            format: "TEXT",
            type: "ERROR/NOSHOWOPTION",
          });
          contact.support.addCurrentMessage(last);
          p.action.times -= 1;
        }
        problem = true;
        break;
      }
    }

    if (!problem) {
      if (
        !!contact.support.currentInput &&
        !!contact.support.currentInput.submit
      ) {
        const dataToSubmit = contact.support.currentInput.extractAttData(
          contact.support.submitData
        );
        let r = await this.oracle.sendData(
          contact.support.currentInput.submit.route,
          dataToSubmit
        );

        if (r.isReturnData) {
          contact.support.addReturnData(r.data);
        }
      }

      if (contact.support.currentFrame.hasNextInput()) {
        contact.support.currentInput = new InputForm(
          contact.support.currentFrame.nextInput()
        );
        contact.support.addCurrentMessage({
          text: contact.support.currentInput.text,
          type: contact.support.currentInput.type,
        });
      } else {
        contact.support.currentInput = null;
        let r = "";

        if (!!contact.support.currentFrame.submit.route) {
          const dataToSubmit = contact.support.currentFrame.extractAttData(
            contact.support.submitData
          );
          r = await this.oracle.sendData(
            contact.support.currentFrame.submit.route,
            dataToSubmit
          );

          if (r.isReturnData) {
            contact.support.resetReturnData();
            contact.support.addReturnData(r.data);
          }
        }
        await this.jumpResolver(
          contact,
          contact.support.currentFrame.submit.jump
        );
      }
    }
  }

  inativeContactAccess(contact) {
    contact.addMessage(
      "*Este número está inativo. Aguarde que entraremos em contato em breve por este mesmo canal.*",
      this.name,
      "",
      "BLACKLIST"
    );

    const listAdmin = this.listAdmin;
    listAdmin.forEach((c) => {
      c.addMessage(
        `*O contato a seguir está inativo.*`,
        this.name,
        "",
        "BLACKLIST"
      );
    });
  }

  async processMedia(content) {
    if (!content.mediaType || !content.mediaData) {
      throw new Error("Conteúdo de mídia inválido.");
    }
    if (!this.page) {
      throw new Error("Página não carregada.");
    }
    const mediaObject = {
      type: content.mediaType,
      data: content.mediaData,
      timestamp: new Date(),
    };

    if (!this.page.media) {
      this.page.media = [];
    }
    this.page.media.push(mediaObject);

    await db.bot.query(
      `FOR p IN Page FILTER p._key == @pageKey UPDATE p WITH { media: @media } IN Page`,
      {
        pageKey: this.page.id,
        media: this.page.media,
      }
    );
    return mediaObject;
  }

  async receive(contact, content) {
    console.log("receive");

    if (!contact.isActive()) {
      console.log("isActive");

      this.inativeContactAccess(contact);
    } else if (!contact.getSupport()) {
      console.log("!Support");

      contact.openSupport(this.page);

      contact.support.addCurrentMessage({
        text: this.page.intro.text,
        format: "TEXT",
      });

      await this.jumpResolver(contact, this.page.intro.jump);
    } else if (contact.isOpenSupport()) {
      if (contact.support.currentFrame.type == "FORM") {
        await this.formResolver(contact, content);
      } else if (contact.support.currentFrame.type == "OPTION") {
        await this.optionResolver(contact, content);
      }
    }
  }

  getPendingToDelivery(from) {
    const sender = this.poolContact.getContact(from);

    const result = sender.getPendingToDelivery();

    return result;
  }

  getHistory() {
    return this.history;
  }
  getLastMessage(from) {
    const sender = this.history.find((s) => s.id == from);

    if (!sender) {
      return null;
    }
    return sender.listMessage[sender.listMessage.length - 1];
  }
}

async function f() {
  const Page = require("../model/Page");
  const Oracle = require("../model/Oracle");

  const oracle = new Oracle("http://localhost:3000");

  const page = Page;

  const bot = new Bot(
    "Atendente",
    "Atendimento virtual da Prefeitura de Upanema.\n",
    new Page(...dataPage),
    oracle
  );

  bot.receive("qualquer", "1");
  bot.receive("1", "1");
  bot.receive("01.01.038.0024.001", "1");
  bot.receive("05032766429", "1");
  bot.receive("1", "1");

  bot.getLastMessage("1");

  //    console.log("history");
  //    console.log(bot.history.forEach((m)=>{console.log(m.listMessage);}))

  //   console.log(bot.getLastMessage("1"));

  //bot.printHistory()
}

//f()

module.exports = Bot;
