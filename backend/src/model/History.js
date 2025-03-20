class History {
    constructor() {
        
        this.listMessage = []
    }

    isEmpty() {

        return this.listMessage.length == 0;
    }

    json() {

        return this.listMessage;
    }

    addMessage(msg) {
        msg.timestamp = new Date()
        msg.pendingToDelivery = true;
        this.listMessage.push(msg)
    }

    getLastMessage() {
        if (this.listMessage.length == 0) {
            return null;
        }
        return this.listMessage[this.listMessage.length - 1];
    }

    getPendingToDelivery() {
        return this.listMessage.filter((m) => m.pendingToDelivery)
    }


    getDiffInMinutes(startDate, endDate) {
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        const diffInMs = endTimestamp - startTimestamp;

        // Converte milissegundos para minutos
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        return diffInMinutes;
    }

    init() {
//        setInterval(() => {
//            console.log(this.isExpirationTime())
//        }, 5000)
    }

}

module.exports = History;

const h = new History("1", 1);

h.init()
h.addMessage({});