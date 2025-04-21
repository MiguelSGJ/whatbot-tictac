
class FrameOption {
    constructor(option) {
        this.text = option.text
        this.id = option.id
        this.onSelect = option.onSelect
        this.prepare = option.prepare
        this.list = option.list
        this.type = option.type
        this.jump = option.jump
    }

    getOption(choice) {
        console.log("getOption");

        return this.list.find((s) => { 
            return s.id == choice })
    }


    fillList(dataList = []) {
        console.log("fillOptionList");
        console.log(dataList);
    
        if (dataList && dataList.media && Array.isArray(dataList.list)) {
            this.media = dataList.media[0] || null; 
            dataList = dataList.list; 
        }
    
        if (!Array.isArray(dataList)) {
            console.log("Lista vazia ou inválida.");
            return;
        }
    
        dataList.forEach((d, i) => {
            let op = {
                id: (i + 1).toString(),
                text: d.value,
                content: {
                    id: {
                        name: this.prepare?.content?.id || "",
                        value: d.id,
                    },
                    value: d.value
                },
                onSelect: this.prepare?.onSelect || null
            };
            this.list.push(op);
        });
    }
    
    getResume() {
        let text = this.text;

        this.list.forEach((op)=>{
            text += `${op.id} - ${op.text}`
        })

        return text;
    }

}

module.exports = FrameOption