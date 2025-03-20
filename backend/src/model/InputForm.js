class InputForm {
    constructor(input) {
        this.id = input.id
        this.text = input.text
        this.type = input.type
        this.submit = input.submit
        this.validates = input.validates
        console.log("VERIFICANDO O INPUTFORM", input)
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

module.exports = InputForm