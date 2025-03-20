const History = require("./History");
const Page = require("./Page");
const Support = require("./Support")
//const db = require('../config/database')
const ObjectControl = require("./ObjectControl")
const oc = new ObjectControl();
class Contact {

    constructor(contact) {
        this.name = contact.name;
        this.number = contact.number;  
        this.phoneNumber = this.number.split("@")[0]      
        this.active = contact.active
        this.support
    }


    openSupport(page) {
        console.log("openSupport");

        this.support = new Support(this, new Page({...page}), 2)
    }

    async closeSupport() {
        console.log("closeSupport");

        console.log(this.isOpenSupport());
        if(this.isOpenSupport()) {
            
            this.support.finish = new Date()
            await oc.save("Support",this.support.json())
         //   await db.bot.collection("Support").save(this.support.json())

            this.support = null
        }
    }
    isOpenSupport() {
        console.log("isOpenSupport");

        return !!this.support && this.support.isOpen()
    }

    getSupport() {

        return this.support
    }

    addMessageFile(file,text,from,id,type) { 

        this.history.addMessage({file:file,from:from,id:id,type:type,text:text})
    }

    getPendingToDelivery() {
        console.log("getPendingToDelivery");

        console.log(this.support.currentMessage);

        const result = this.support.listMessageToDelivery;

        this.support.resetListMessageToDelivery()

        return result;

    }
    
    resetHistory() {
        this.history = new History(this.history.expirationTime);
    }

    isActive() {
        return this.active
    }

    turnActive() {
        this.active = !this.active;
    }



}

module.exports = Contact;