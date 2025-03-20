const axios = require('axios');
const Page = require('./Page');

class Oracle {
    constructor(site, access_key = "") {
        this.site = site;
        this.access_key = access_key;
        this.token = ""
    }

    setToken(accessToken) {
        this.token = accessToken;
    }

    getSite() {
        return this.site;
    }

    getAccess_key() {
        return this.access_key;
    }

    async sendData(route, data, method = "PUT") {

        const conn = this.getConn();

        let r = {}
        if (method.toUpperCase() == "PUT") {

            r = await conn.put(route, data);

        } else {

            r = await conn.post(route, data);
        }

        const result = await r.data;

        return result
    }

    getConn() {

        let headers = {
            'Content-Type': 'application/json'
        }

        if (this.token != "") {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${global.user.token}`
            }
        }
        return axios.create({
            baseURL: this.site,

            headers: headers
        });
    }

}


module.exports = Oracle;