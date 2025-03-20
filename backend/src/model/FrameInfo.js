
class FrameInfo {

    constructor(frame) {
        this.frame = { ...frame };
        this.prepare = frame.prepare;
        this.list = frame.list;
        this.text = frame.text
        this.exit = frame.exit || false
    }

    parserText(data) {
        console.log("parserText");

        let text = this.frame.text;
        for (let att in data) {
            text = text.replace(att, data[att]);
        }

        text = text.replace(/@/g, "");

        return text;
    }

    extractAttData(dataToSubmit) {
        console.log("extractAttData");
        let result = {}
        for(let i=0;i<this.prepare.listAtt.length;i++) {
            let att = this.prepare.listAtt[i]
            result[att] = dataToSubmit[att];
        }
        return result;
    }    

    getResume(data) {
        console.log("FrameInfo.getResume");

        let text = this.parserText(data);

        return text;
    }

}

module.exports = FrameInfo