const PoolContact = require('./PoolContact')
const Support = require("./Support")
const Page = require("./Page")
const FrameOption = require('./FrameOption')
const FrameForm = require('./FrameForm')
const FrameInfo = require('./FrameInfo')

class Bot {
    constructor(name, page, oracle) {
        this.listOpenSupport = []
        this.name = name
        this.page = page
        this.oracle = oracle;
        this.listAdmin = []
    }

    addAdmin(contact) {
        this.listAdmin.push(contact)
    }

    getSupport(contact) {

        this.listOpenSupport.find((s) => { return s.contact.number == contact.number })
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

        contact.addMessage("*Foi atingido o número máximo de tentativas. Entraremos em contato em breve por este canal.*", this.name, "", "BLACKLIST")

        const listAdmin = this.listAdmin;
        listAdmin.forEach((c) => {
            c.addMessage(`*O contato a seguir foi inativado.*\n`, this.name, "", "BLACKLIST")
        })
        if (contact.isOpenSupport()) {
            contact.closeSupport()
        }
    }

    getWecomeMessage() {
        return { "text": this.welcome, type: "WELCOME", id: "" }
    }


    getContact(number) {
        return this.poolContact.getContact(number);
    }

    async optionResolver(contact, choice) {
        console.log("optionResolver");

        const option = contact.support.currentFrame.getOption(choice);

        console.log(option);


        if (!option) {

            let last = contact.support.getListCurrentMessage();
            contact.support.resetListCurrentMessage()
            contact.support.addCurrentMessage({ "text": `*A opção ${choice} é inválida.*\n\n`, format: "TEXT", type: "ERROR/NOSHOWOPTION" })
            contact.support.addCurrentMessage(last)

        } else {

            // contact.support.currentFrame = new FrameOption(option);

            if (option.id == "start") {

                contact.opeSupport(this.page)
            }

            if (!!option.content) {

                contact.support.addAttInSubmitData(option.content.id, option.content.value);
            }

            await this.jumpResolver(contact, option.onSelect.jump);
        }
    }

    async jumpResolver(contact, path) {
        console.log("jumpResolver");

        const frame = this.page.getFrame(path);

        if (frame.type == "EXIT") {

            contact.closeSupport(frame);

        } else {

            let text = ``;

            //contact.support.addCurrentMessage({"text":frame.text,type:"TEXT","wait":frame.wait})

            if (frame.type == "FORM") {
                contact.support.currentFrame = new FrameForm(frame);

                contact.support.currentInput = contact.support.currentFrame.nextInput();

                contact.support.addCurrentMessage({ text: contact.support.currentInput.text, type: "TEXT" })

            } else if (frame.type == "OPTION") {

                contact.support.currentFrame = new FrameOption(frame);

                const prepare = contact.support.currentFrame.prepare

                if (!!prepare) {

                    let r = await this.oracle.sendData(prepare.route, contact.support.submitData);

                    contact.support.currentFrame.fillList(r);
                }

                text = contact.support.currentFrame.getResume();

                contact.support.addCurrentMessage({ text: text, format: "TEXT" })

            } else if (frame.type == "INFO") {

                contact.support.currentFrame = new FrameInfo(frame);

                text = contact.support.currentFrame.parserText(contact.support.returnData);
                contact.support.addCurrentMessage({ text: text, format: "TEXT" })

            }

        }
    }

    getListAdmin() {

        return this.listAdmin;
    }

    async formResolver(contact, text) {
        console.log("formResolver");

        const last = contact.support.getLastCurrentMessage();

        contact.support.addAttInSubmitData(contact.support.currentInput.id, text);

        console.log("Submitdata");
        console.log(contact.support.submitData)

        let problem = false;
        const validates = contact.support.currentInput.validates;

        for (let i = 0; i < validates.length; i++) {

            let v = validates[i];

            let r = await this.oracle.sendData(v.route, contact.support.submitData)

            if (!!r.problem) {

                const p = v.problem.find((p) => { return p.type == r.problem })

                if (p.action.times == 0) {

                    contact.active = false;
                    this.addMessageBlackList(contact)

                } else if (p.action.type == "RELAUCH") {

                    contact.addMessage(
                        `${p.text} Você tem mais *${p.action.times}* ${p.action.times == 1 ? "tentativa" : "tentativas"}\n\n`,
                        this.name,
                        "",
                        "PROBLEM"
                    )
                    contact.support.addCurrentMessage(last)

                    p.action.times -= 1;

                }
                problem = true;

                break
            }
        }

        if (!problem) {


            if (contact.support.currentFrame.hasNextInput()) {

                contact.support.currentInput = contact.support.page.nextInput();

                contact.support.addCurrentMessage({
                    text: contact.support.currentInput.text,
                    type: contact.support.currentInput.type
                })
            } else {

                await this.jumpResolver(contact, contact.support.currentFrame.submit.jump)
            }
        }
    }

    inativeContactAccess(contact) {
        contact.addMessage("*Este número está inativo. Aguarde que entraremos em contato em breve por este mesmo canal.*", this.name, "", "BLACKLIST")

        const listAdmin = this.listAdmin;
        listAdmin.forEach((c) => {
            c.addMessage(`*O contato a seguir está inativo.*`, this.name, "", "BLACKLIST")
        })
    }

    prepareMessageToSend(listMessage) {


    }


    async receive(contact, content) {
        console.log("receive");

        if (!contact.isActive()) {

            this.inativeContactAccess(contact)

        } else if (!contact.getSupport()) {

            contact.openSupport(this.page);

            contact.support.addCurrentMessage({ "text": this.page.intro.text, format: "TEXT" });

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

        const sender = this.poolContact.getContact(from)

        const result = sender.getPendingToDelivery()

        return result;
    }

    getHistory() {
        return this.history;
    }
    getLastMessage(from) {
        const sender = this.history.find(s => s.id == from)

        if (!sender) {
            return null
        }
        return sender.listMessage[sender.listMessage.length - 1]
    }
}

async function f() {

    const Page = require('./Page');
    const Oracle = require('./Oracle')

    const oracle = new Oracle("http://localhost:3000")

    const page = Page

    const bot = new Bot("Atendente", "Atendimento virtual da Prefeitura de Upanema.\n", new Page(...dataPage), oracle)

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


