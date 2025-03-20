
class Page {

    constructor(dataPage) {
        this.intro = dataPage.intro;
        this.forms = dataPage.forms
        this.exit = dataPage.exit
        this.options = dataPage.options
        this.info = dataPage.info
    }

    optionParser(dataPage) {

        dataPage.options.for((o)=>{
            let op = new Option(o)

            this.options.push(op);
        })
    }

    formParser(dataPage) {

        dataPage.forms.for((f)=>{
            let form = new Form(f)

            this.options.push(form);
        })
    }

    getFrame(path) {

        let result

        const p_slice = path.split(":");
        
        if(p_slice[0] == "option") {

            result = this.options.find((o)=>{
                return o.id == p_slice[1];
            });
        } else if(p_slice[0] == "form"){

            result = this.forms.find((o)=>{
                return o.id == p_slice[1];
            });

        } else if(p_slice[0] == "info"){

            result = this.info.find((i)=>{
                return i.id == p_slice[1];
            });

        } else if(p_slice[0] == "exit") {
            result = this.exit
        }

        return result;
    }

    

    getShowPage() {
        return this.showPage;
    }

    getListProperty() {

        if (this.listProperty.length > 0) {
            return this.listProperty;
        }

        for (let p in this.form) {
            this.listProperty.push(p)
        }
        return this.listProperty;
    }

    reset() {
        this.currentIndexAtt = -1;
        this.currentAtt = null;
    }

    getIntroResume() {
        let resume = this.showPage.text;
        this.showPage.choices.forEach((i) => {
            resume += i.id + "-" + i.text
        })
        return resume

    }

    getShowPageMessage() {
        return {"text":this.getChoicesResume(),type:"SHOWPAGE"}
    }
    getChoicesResume() {
        let result = "Escolha uma das opções:\n\n"
        this.choices.forEach((c) => {
            result += c.id + "-" + c.text + "\n";
        })

        return result;
    }

}

module.exports = Page