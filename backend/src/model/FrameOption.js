
class FrameOption {
    constructor(option) {
        this.text = option.text
        this.id = option.id
        this.onSelect = option.onSelect
        this.prepare = option.prepare
        this.list = option.list
        this.type = option.type
        this.jump = option.jump
        this.dynamicJump = null; 
    }

    getOption(choice) {
        console.log("getOption");

        return this.list.find((s) => { 
            return s.id == choice })
    }


    fillList(dataList = []) {
        console.log("fillOptionList");
        console.log("Dados recebidos:", dataList);
    
        if (dataList && Array.isArray(dataList.list)) {
            dataList = dataList.list; // A lista está dentro de "list"
        } else if (!Array.isArray(dataList)) {
            console.log("dataList não é um array.");
            return;
        }
    
        if (!Array.isArray(dataList)) {
            console.log("dataList não é um array válido.");
            return;
        }
    
        if (dataList.media && Array.isArray(dataList.media)) {
            this.media = dataList.media[0] || null;
            console.log("Mídia recebida:", this.media);
        }
    
        this.list = [];
        dataList.forEach((d, i) => {
            let op = {
                id: (i + 1).toString(),
                text: d.value,  // Assumindo que d.value está correto
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
    
        console.log("Lista preenchida:", this.list); // Verifica o que foi adicionado à lista
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