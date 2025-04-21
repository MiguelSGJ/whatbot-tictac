class FrameInfo {
    constructor(frame) {
        this.frame = { ...frame };
        this.text = frame.text;
        this.mediaRoute = frame.media?.route || null;
        this.acceptedTypes = frame.media?.acceptedTypes || [];
        this.exit = frame.exit || false;
    }

    parserText(data) {
        let text = this.text;
        for (let att in data) {
            text = text.replace(att, data[att]);
        }
        return text.replace(/@/g, "");
    }

    extractAttData(dataToSubmit) {
        let result = {};
        if (this.prepare && this.prepare.listAtt) {
          for (let att of this.prepare.listAtt) {
            result[att] = dataToSubmit[att];
          }
        }
        return result;
      }
      
    getResume(data) {
        console.log("FrameInfo.getResume");

        const text = this.parserText(data);

        return { text, media: this.media || [] };
    }

    setMedia(media) {
        this.media = media;
    }
}

module.exports = FrameInfo;
