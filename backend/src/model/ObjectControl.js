const DataControl = require("../database/DataControl")

const obj_map = {
}
    
class ObjectControl {

    constructor() {
        
        this.dc = new DataControl()
    }

    async getDocAsObj(_class,key) {

        const doc = this.dc.getDocByKey(_class,key)

        return new obj_map[_class](doc);
    }
    async save(_class,doc) {

        return await this.dc.save(_class,doc);
    }

    async reset(listClass) {

        this.dc.reset(listClass)        
    }

    async getListDoc(_class) {

        return await this.dc.getListDoc(_class)
    }

    async getDocByKey(_class,_key,level=0) {

        return await this.dc.getDocByKey(_class,_key,level)
    }
}

module.exports = ObjectControl