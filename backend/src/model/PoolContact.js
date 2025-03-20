const Contact = require("./Contact");
//const db = require('../config/database')
const ObjectControl = require('./ObjectControl')
const oc = new ObjectControl()
class PoolContact {

    constructor() {
        this.listContact = []
    }

    addContact(contact) {
        this.listContact.push(contact)
    }

    async newContact(name,number) {
        console.log("newContact");

        let contact = await oc.save("Contact",{name,number,active:true})
        //await db.bot.collection("Contact").save({name,number,active:true})

        //let contact = await db.bot.query(`for c in Contact filter c.number == @number return c`,{number})

        //contact = await contact.next();

        contact = new Contact(contact)

        this.listContact.push(contact)

        return contact 

    }

    isContact(number) {

        let contact = this.listContact.find((c)=>{return c.number == number});

        return !!contact
    }

    async getContact(number) {
        console.log("getContact");

        let contact = this.listContact.find((c)=>{return c.number == number});

        return contact;
    }

}

module.exports = PoolContact;