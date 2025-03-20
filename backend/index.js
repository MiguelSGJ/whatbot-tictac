const venom = require('venom-bot');

async function begin() {

  const client = venom.create({
    session: 'session-name'
  })

  console.log(client);

}
begin()

// Objeto para armazenar informações de coleta por rua
/*const infoColetaPorRua = {
  'Rafael Câncio de Sousa': {
    data: '10/03/2024',
    horario: '14:00 - 16:00',
    descricao: 'Coleta de resíduos recicláveis.'
  },
};

// Objeto para armazenar respostas às perguntas
const respostas = {};

function start(client) {
  client.onMessage((message) => {
    // Verifica se a mensagem começa com '/'
    if (message.body.startsWith('/')) {
      handleCommand(client, message);
    } else if (respostas[message.from]) {
      // Se houver uma pergunta pendente, trata a resposta
      handleResposta(client, message);
    }
  });
}

function handleCommand(client, message) {
  const command = message.body.split(' ')[0].toLowerCase();

  switch (command) {
    case '/ajuda':
      sendHelpMessage(client, message.from);
      break;
    case '/sobre':
      sendAboutMessage(client, message.from);
      break;
    case '/comandos':
      sendCommandsMessage(client, message.from);
      break;
    case '/info/coleta':
      askRua(client, message.from);
      break;
    default:
      sendUnknownCommandMessage(client, message.from);
  }
}

function handleResposta(client, message) {
  // Lógica para processar a resposta de uma pergunta pendente
  const respostaPendente = respostas[message.from];

  if (respostaPendente) {
    if (respostaPendente.pergunta === '/info/coleta' && respostaPendente.etapa === 'rua') {
      // Processar a resposta da rua
      processRuaAnswer(client, message.from, message.body);
    }
    // Adicione lógica para mais etapas, se necessário
  }
}

function askRua(client, chatId) {
  // Pergunta pela rua
  client.sendText(chatId, 'Informe a rua:');
  // Marca a resposta pendente
  respostas[chatId] = { pergunta: '/info/coleta', etapa: 'rua' };
}

function processRuaAnswer(client, chatId, rua) {
  // Lógica para processar a resposta da rua
  const infoColeta = infoColetaPorRua[rua];

  if (infoColeta) {
    // Envia informações de coleta
    const resposta = `Informações de coleta para ${rua}:\nData: ${infoColeta.data}\nHorário: ${infoColeta.horario}\nDescrição: ${infoColeta.descricao}`;
    client.sendText(chatId, resposta);
  } else {
    // Responde que não há informações para a rua
    client.sendText(chatId, `Desculpe, não há informações de coleta para a rua ${rua}.`);
  }

  // Limpa a resposta
  delete respostas[chatId];
}

function sendHelpMessage(client, chatId) {
  const helpMessage = 'Bem-vindo! Aqui estão alguns comandos disponíveis:\n' +
    '/ajuda - Mostra esta mensagem de ajuda.\n' +
    '/sobre - Informações sobre este bot.\n' +
    '/comandos - Lista de comandos disponíveis.\n' +
    '/info/coleta - Obtém informações de coleta por rua.';
  client.sendText(chatId, helpMessage);
}

function sendAboutMessage(client, chatId) {
  const aboutMessage = 'Este bot fornece informações de coleta de resíduos recicláveis por rua. Desenvolvido por [Seu Nome].';
  client.sendText(chatId, aboutMessage);
}

function sendCommandsMessage(client, chatId) {
  const commandsMessage = 'Aqui estão os comandos disponíveis:\n' +
    '/ajuda\n' +
    '/sobre\n' +
    '/comandos\n' +
    '/info/coleta';
  client.sendText(chatId, commandsMessage);
}

function sendUnknownCommandMessage(client, chatId) {
  const unknownCommandMessage = 'Desculpe, este comando não é reconhecido. Utilize /ajuda para ver a lista de comandos disponíveis.';
  client.sendText(chatId, unknownCommandMessage);
}
*/