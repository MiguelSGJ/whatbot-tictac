const axios = require('axios');

const OracleConn = (method,data) => {

  return axios.create({
    //baseURL: process.env.BB_URL,
    baseURL: "https://api.hm.bb.com.br",
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

}


module.exports = OracleConn;