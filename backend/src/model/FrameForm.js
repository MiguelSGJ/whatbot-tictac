
class FrameForm {

    constructor(form) {
        this.list = form.list
        this.type = form.type;
        this.currentIndexInput = -1
        this.submit = form.submit
        this.prepare = form.prepare
    }
    

    nextInput() {

        this.currentIndexInput++;

        return this.list[this.currentIndexInput];
    }

    hasNextInput() {

        if (this.list.length == 0) {

            return false
        }
        if ((this.currentIndexInput + 1) < this.list.length) {

            return true
        }

        return false
    }

    extractAttData(dataToSubmit) {
        let result = {}
        for(let i=0;i<this.submit.listAtt.length;i++) {
            let att = this.submit.listAtt[i]
            result[att] = dataToSubmit[att];
        }
        return result;
    }    


}

module.exports = FrameForm