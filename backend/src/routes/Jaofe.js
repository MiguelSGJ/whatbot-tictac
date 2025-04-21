const router = require('express').Router()
//const db = require('../config/database');
const Oracle = require('../model/Oracle');
const fss = require("fs");
const path = require("path");
//const moment = require('moment')
//const fs = require('fs/promises');
//const { console } = require('inspector');
//const { log } = require('console');

//require('moment/locale/pt-br');

const oracle = new Oracle(process.env.BACKEND_ORACLE_HOST);

//moment.locale('pt-br');
/*
(async ()=>{
  user = await oracle.sendData("/user/login",{"user_name":process.env.BOT_USER_NAME,"password":process.env.BOT_USER_PASS})        

  oracle.setToken(user.token);

})()
*/

router.put('/cadPessoa', async (req, res) => {
  console.log("/cadPessoa");

  console.log("esse é o texto",req.body)

  user = await oracle.sendData("/jaofe/person",req.body)        
  res.send(req.body)
/*  let {num_days, service_key} = req.body;

  const data = {
    num_days,
    service_key
  }

  const result = await oracle.sendData("/bot/days",data,"PUT")

*/
  //const result = [
  
  //]

  
  //res.send({ "isReturnData": true, "data": result });

})

router.put('/exames', async (req, res) => {
  console.log("/exames");

/*  let {num_days, service_key} = req.body;

  const data = {
    num_days,
    service_key
  }

  const result = await oracle.sendData("/bot/exames",data,"PUT")

*/
const result = [
  {id: "Hemograma", value: "Hemograma\n"},
  {id: "Urina", value: "Urina\n"},
  {id: "Ultrassonografia", value: "Ultrassonografia\n"},
  {id: "Ressonância Magnética", value: "Ressonância Magnética\n"},
  {id: "Tomografia", value: "Tomografia\n"},
  {id: "Raio-X", value: "Raio-X\n"},
  {id: "Eletrocardiograma", value: "Eletrocardiograma\n"},
  {id: "Ecocardiograma", value: "Ecocardiograma\n"},
  {id: "Mamografia", value: "Mamografia\n"},
];

  res.send({ "isReturnData": true, "data": result });

})

router.put("/imageAssessment", async (req, res) => {
  console.log("/imageAssessment");

  const result = [
    { id: "Banana", value: "Banana\n" },
    { id: "Uva", value: "Uva\n" },
    { id: "Maçã", value: "Maçã\n" },
    { id: "Laranja", value: "Laranja\n" },
  ];

  const mediaPath = path.join(__dirname, "../media/teste.jpeg");
  const base64Media = fss.readFileSync(mediaPath, { encoding: "base64" });

  const media = [
    {
      type: "IMAGE",
      mimeType: "image/jpg",
      data: base64Media,
    },
  ];

  res.send({
    isReturnData: true,
    data: {
      media: media,
      list: result,
    },
  });
});

router.put('/consultas', async (req, res) => {
  console.log("/consultas");


  const result = [
    {id:"Dermatológica",value:"Dermatológica\n"},
    {id:"Pediátrica",value:"Pediátrica\n"},
    {id:"Oftalmológica",value:"Oftalmológica\n"},
    {id:"Cardiológica",value:"Cardiológica\n"},
    {id:"Neurológica",value:"Neurológica\n"},
    {id:"Ortopédica",value:"Ortopédica\n"},
    {id:"Psiquiátrica",value:"Psiquiátrica\n"},
    {id:"Urológica",value:"Urológica\n"},
    {id:"Oncológica",value:"Oncológica\n"},
    {id:"Reumatológica",value:"Reumatológica\n"},
  ];  

  res.send({ "isReturnData": true, "data": result });

})

router.put('/buscarDiasExame', async (req, res) => {
  const data = {
    currentDate: moment().format('YYYY-MM-DD')
  };
  console.log(data);
  

  const result = await oracle.sendData("/whatbot/buscarDiasExame", data, "PUT");

  const formattedResult = result.map((day) => {
    const date = moment(day.date);
    const dayOfWeek = date.format('dddd');
    const formattedDate = date.format('DD [de] MMMM [de] YYYY');

    return {
        id: day.date, 
        value: `${dayOfWeek}, ${formattedDate}\n` 
    };
});

  res.send({ "isReturnData": true, "data": formattedResult });
});

router.put('/buscarDiasConsulta', async (req, res) => {
  const data = {
    currentDate: moment().format('YYYY-MM-DD')
  };
  console.log(data);
  

  const result = await oracle.sendData("/whatbot/buscarDiasConsulta", data, "PUT");

  const formattedResult = result.map((day) => {
    const date = moment(day.date);
    const dayOfWeek = date.format('dddd');
    const formattedDate = date.format('DD [de] MMMM [de] YYYY');

    return {
        id: day.date, 
        value: `${dayOfWeek}, ${formattedDate}\n` 
    };
});

  res.send({ "isReturnData": true, "data": formattedResult });
});

router.put('/agendamento', async (req, res) => {
  let {buscarDiasConsultaId, buscarDiasExameId, inputDayConsulta, inputDayExame, cpf} = req.body

  const data = {buscarDiasConsultaId, buscarDiasExameId, inputDayConsulta, inputDayExame, cpf};

  const result = await oracle.sendData("/whatbot/agendamento", data, "PUT");

  res.send({ "isReturnData": true, "data": result });
});

router.put('/selectNeighborhood', async (req, res) => { 
  const data = {};  
  console.log(data);

  const result = await oracle.sendData("/whatbot/selectNeighborhood", data, "PUT");
  console.log("Resultado da Oracle:", result);

    const formattedResult = result.data.map((neighborhood) => {
      return {
          id: {
              name: neighborhood.name,  
              key: neighborhood.key                   // Key do bairro
          },
          value: `${neighborhood.name}\n`  // Nome do bairro mostrado ao cliente
      };
  });

  res.send({ 
    "isReturnData": true, 
    "data": formattedResult
});
});

router.put('/selectWay', async (req, res) => {
  let { inputWay, currentPage } = req.body;

  console.log("requisição:", req.body);

  const data = { inputWay };
  console.log('Dados a serem enviados:', data);

  const result = await oracle.sendData("/whatbot/selectWay", data, "PUT");
  console.log("esse é o result:", result);

  const streetsPerPage = 7;
  const totalStreets = result.length;
  const totalPages = Math.ceil(totalStreets / streetsPerPage);

  let current = currentPage || 1;

  if (inputWay === "PEDIR MAIS") {
      current += 1;
  }

  const startIndex = (current - 1) * streetsPerPage;
  const endIndex = Math.min(startIndex + streetsPerPage, totalStreets);

  const streetsForCurrentPage = result.slice(startIndex, endIndex);

  const formattedResult = streetsForCurrentPage.map((street) => {
      return {
          id: {
              name: street.name,
              key: street.key
          },
          value: `${street.name}\n`
      };
  }); 

  if (endIndex < totalStreets) {
      formattedResult.push({
          id: {
              name: "PEDIR MAIS",
              key: null
          },
          value: "PEDIR MAIS\n"
      });
  }

  formattedResult.push({
      id: {
          name: "SAIR",
          key: null
      },
      value: "SAIR"
  });

  res.send({ 
      "isReturnData": true, 
      "currentPage": current,  // Incluir a página atual
      "totalPages": totalPages,  // Número total de páginas
      "data": formattedResult  // As ruas paginadas com as opções
  });
});

router.put('/createPerson', async (req, res) => {
  let {name, cpf, selectNeighborhoodId, selectWayId, numberHouse} = req.body

  const data = {name, cpf, selectNeighborhoodId, selectWayId, numberHouse};
    console.log(data);

  const result = await oracle.sendData("/whatbot/createPerson", data, "PUT");

  res.send({ "isReturnData": true, "data": result });
});

router.put('/validate/dateFormat', async (req, res) => {
  console.log("/validate/dateFormat");

  const { inputDayExame } = req.body;
  
  console.log("o input é:", inputDayExame)
  let isValid = false
try{
  
  let d = new Date(inputDayExame)
  isValid = true
}catch{}

  let r = {
    success: true
  }
  if (!isValid) {
    r.success = false
    r.problem = "NOTFOUND";
  }

  res.send(r);
});

router.put('/nothing', async (req, res) => {
  console.log("/nothing");

  res.send({})
})

router.put('/validate/birthDate', async (req, res) => {
  console.log("/validate/birthDate");

  
  const { birthDate } = req.body;
  
  console.log("o birthDate é:", birthDate)
  let isValid = false
  
  let d = new Date(birthDate)
  isValid = true
  console.log(d);
  

  let r = {
    success: true    
  }
  if (!isValid) {
    r.success = false
    r.problem = "NOTFOUND";
  }

  res.send(r);
});

module.exports = router