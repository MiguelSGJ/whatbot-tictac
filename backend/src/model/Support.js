const History = require("./History")
//const db = require("../config/database")
const ObjectControl = require("./ObjectControl")
const oc = new ObjectControl();

class Support {
    constructor(contact,page,expirationAnswerTime) {
        this.page = page;
        this.contact = contact;
        this.start = new Date();
        this.expirationAnswerTime = expirationAnswerTime;
        this.currentFrame;
        this.finish
        this.submitData ={}
        this.returnData ={}

        this.currentMessage = ""
        this.listMessageToDelivery = []
        this.listMessage = []

    }

    json() {

        return {
            "contact":{
                id:this.contact.number,
                name:this.contact.name
            },
            history:this.listMessage
        }
    }

    async newDBSupport() {

        const token = new Date().getTime()

        //const result = await db.bot.collection("Support").save({"id":token})

        const result = await oc.save("Support",{"id":token})
        
        this.addAttInSubmitData("supportId",result._key);

    }

    getListMessageToDelivery() {
        console.log("getListCurrentMessage");

        return this.listMessageToDelivery;
    }

    getCurrentMessage() {

        return this.currentMessage;
    }

    resetListMessageToDelivery() {

        this.currentMessage = ""
        this.listMessageToDelivery = []
    }

    addCurrentMessage(message) {
        console.log("addMessage");

        this.currentMessage = message;
        this.listMessageToDelivery.push(message);
        this.listMessage.push(message);        
    }

    addReturnData(returnData) {
        console.log("addReturnData");

        for(let att in returnData) {
            this.addAttInReturnData(att,returnData[att])
        }
    }

    addAttInReturnData(name, value) {
        console.log("addAttInReturnData");

        this.returnData[name] = value;
    }

    resetReturnData() {
        
        this.returnData = {}
    }

    addAttInSubmitData(name, value) {

        this.submitData[name] = value;
    }

    isChoiceNoMatch() {
        console.log("isChoiceNoMatch");

        const choice = this.currentFrame.list.find((c) => { return c.id == choice })

        return !choice;
    }

    isExpirationTime() {
        const last = this.getLastMessage()
        if (!!last) {
            const diff = this.getDiffInMinutes(last.timestamp, new Date())

            if (diff >= this.expirationTime) {
                return true;
            }
        }

        return false
    }


    isOpen() {
        return !this.finish
    }

    isClose() {
        return !this.isOpen()
    }
    close() {
        this.finish = new Date()
    }
}

module.exports = Support

