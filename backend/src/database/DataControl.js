const fs = require("fs")
const path = require("path")

class DataControl {
    constructor() { }

    async save(_class, doc) {
        console.log("save");

        const classPath = path.join(__dirname, `${_class}.json`);
        const headerPath = path.join(__dirname, `${_class}_header.json`);

        let list = []
        if (!fs.existsSync(classPath)) {

            const header = {
                counter:"1",
                _class:_class
            }

            doc._key = "1"
            list.push(doc)

            fs.writeFileSync(classPath, JSON.stringify(list));

            fs.writeFileSync(headerPath, JSON.stringify(header));

        } else {

            if(!doc._key) {

                doc = await this.createKey(_class,doc);
            }

            list = await this.loadJSON(classPath);
            
            const index = list.findIndex((d) => {return d._key == doc._key})
            
            if (index >= 0) {

                list[index] = doc;

            } else {

                list.push(doc)
            }

            fs.writeFileSync(classPath, JSON.stringify(list));

        }

        return doc;
    }

    async createKey(_class,doc) {

        const headerPath = path.join(__dirname, `${_class}_header.json`);

        const header = await this.loadJSON(headerPath)

        doc._key = (new Number(header.counter)+1).toString();

        header.counter = doc._key;

        fs.writeFileSync(headerPath, JSON.stringify(header)); 
        
        return doc;
    }

    async loadJSON(path) {

        const file = fs.readFileSync(path);

        return JSON.parse(file)
    }

    async getListDoc(_class) {

        const filePath = path.join(__dirname, `${_class}.json`);
        
        return await this.loadJSON(filePath)
    }

    async getDocByKey(_class,_key, level =0) {

        const list = await this.getListDoc(_class)

        const doc = list.find((d)=>{return d._key == _key})

        if(level > 0) {
            for(let att in doc) {
            
                if(att.indexOf(":")>0) {
                    const ref_att = att.split(":");
                    const ref_doc = await this.getDocByKey(ref_att[0],doc[att]);
                    doc[att] = ref_doc;
                }
            }
        }
        return doc;
    }

    async reset(listClass=[]) {

        for(let i =0;i<listClass.length;i++) {
            const _class = listClass[i];

            const classPath = path.join(__dirname, `${_class}.json`);
            const headerPath = path.join(__dirname, `${_class}_header.json`);

            fs.writeFileSync(classPath,JSON.stringify([]))
            fs.writeFileSync(headerPath,JSON.stringify({counter:"0",_class:_class}))
        }
    }
}
/*
(async ()=>{

    const dc = new DataControl()

    await dc.reset(["Person"])

    await dc.save("Person",{"name":"antonio"});

    let list = await dc.getListDoc("Person")

    console.log(list);

    await dc.save("Person",{"name":"antonio filho","_key":"1"});

    list = await dc.getListDoc("Person")

    console.log(list);

    let doc = await dc.getDocByKey("Person","1")

    console.log(doc);

    await dc.save("Person",{"name":"eunice"});

    list = await dc.getListDoc("Person")
    
    console.log(list);
})()
*/
module.exports = DataControl