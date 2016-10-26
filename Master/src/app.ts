"use strict";
var sendFunction: any;

function send(data: Buffer, ip: any) {
  sendFunction(data, ip);
}
class Main {

 public puerto: number = 2266;



 private dispositivos: Array<any>;
 private sensores: Array<any>;

 constructor() {
   this.dispositivos = new Array();
   this.sensores = new Array();
 }


 toInt(f: number, s: number) {
   let v: number;
   if (s > 127) {
     v = 0xFFFF0000;
     v |= (s << 8) | f ;
   } else {
     v = (s << 8) | f;
   }
   return v;
 }

 //funciones utilizadas por comunicacion
 setSendFunction(cb: Function) {
   sendFunction = cb;
 }
 onMessage(data: Buffer, info: any) {
   switch (String.fromCharCode(data[0])) {
     case "W":
      console.log("Actualizando sensores de " + info.address);
      for (let i = 0; i < this.dispositivos[info.address].sensores; i++) {
        let valor = this.toInt(data[1 + i * 2], data[ 2 + i * 2]);
        this.sensores[info.address.toString()][i].data = valor;
        console.log(i + ":" + valor);

          for (let ipDest in this.sensores[info.address][i].updates) {
            if (this.sensores[info.address][i].updates[ipDest]) {
              let d = this.sensores[info.address][i].updates[ipDest]; //array
              for (let j = 0; j < d.length; ++j) {
                console.log("   Actualizando " + ipDest + " en " +  d[j]);
                let data: Uint8Array = new Uint8Array(4);
                data[0] = "s".charCodeAt(0);
                data[1] = d[j];
                data[2] = valor;
                data[3] = valor >> 8;
                (function(data: Buffer, dest: any) {
                    send(data, dest);
                })(new Buffer(data), ipDest);
              }
            }
          }

      }
      break;

     case "r":
      console.log("Registrando dispositivo: " + info.address + " actuadores:" + data[1] / 2 + " sensores:" + data[2] / 2 );
      this.dispositivos[info.address] =  { actuadores: data[1] / 2, sensores: data[2] / 2 } ;
      this.sensores[info.address] = {};
      for (let i = 0; i < this.dispositivos[info.address].sensores; ++i) {
        this.sensores[info.address][i] = {dato: 0, updates: {}};
      }
      break;

     case "A":
     //A-ipOrigen,sensor,ipDestino,actuador
      let sO: string = "";  //ip origen
      let sensor: number = 0;

      let sD: string = ""; //ip destino
      let actuador: number = 0;

      let i: number = 1 ;
      while (String.fromCharCode(data[i]) !== ",") {
        sD += String.fromCharCode(data[i]);
        ++i;
      }
      ++i; //saltar coma
      actuador = data[i];
      ++i;
      while (String.fromCharCode(data[i]) !== ",") {
        sO += String.fromCharCode(data[i]);
        ++i;
      }
      ++i ; //saltar coma
      sensor = data[i];
      if (this.dispositivos[sO].sensores > sensor) {
        if (!this.sensores[sO][sensor].updates[sD]) {
            this.sensores[sO][sensor].updates[sD] = new Array();
        }
        if (this.sensores[sO][sensor].updates[sD].indexOf(actuador) === -1) {
          this.sensores[sO][sensor].updates[sD].push(actuador);
        }
      }
      break;
     case "G":
      for(let i in this.dispositivos){
        let ip = i.split(",");
        let data: Uint8Array = new Uint8Array(7);
        data[0] = "I".charCodeAt(0);
        data[1] = parseInt( ip[0] );
        data[2] = parseInt( ip[1] );
        data[3] = parseInt( ip[2] );
        data[4] = parseInt( ip[3] );
        data[5] = this.dispositivos[i].actuadores;
        data[6] = this.dispositivos[i].sensores;

        (function(data: Buffer, dest: any) {
            send(data, dest);
        })(new Buffer(data), info.address);
      }

      break;
     default:
      console.log(String.fromCharCode(data[0]));
   }
 }
 onClose() {
   console.log("close");
 }
 onListening(ip: String, puerto: Number) {
   console.log("Escuchando en:" + ip + ":" + puerto);
 }
 onError(error: Error) {
   console.log(error);
 }
}

module.exports = Main;
