var App = require("./bin/app.js");

var instancia = new App();

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

function send(menssage,ip,errroCB){
  var client = dgram.createSocket('udp4');
  client.send(menssage,0,menssage.length,instancia.puerto,ip,(err)=>{
    if(errroCB) errroCB(err);
    client.close();
  })
}

instancia.setSendFunction(send);

server.on('error', (err) => {
  instancia.onError(err);
  server.close();
});

server.on('message', (msg, rinfo) => {
  instancia.onMessage(msg,rinfo);
});

server.on('listening', () => {
  var address = server.address();
  instancia.onListening(address.address,address.port);
});

server.on('close',()=>{
  instancia.onClose();
});



server.bind(instancia.puerto);
