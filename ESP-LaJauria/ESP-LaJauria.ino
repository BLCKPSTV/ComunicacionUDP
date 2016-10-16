#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

const char* ssid = "La Jauria";
const char* password = "juguetessonoros";


const unsigned int localUdpPort = 2266;
IPAddress ip(192, 168, 1, 255);

WiFiUDP Udp;

uint8_t entradas[256];
uint8_t salidas[256];

uint8_t nEntradas;
uint8_t nSalidas;

char readed[256];


void setup(){
  Serial.begin(19200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED){
    delay(500);
  }
  Udp.begin(localUdpPort);

  Serial.print('Y');  
  while(!Serial.available());
  int i = 0;
  String data = "";
  delay(50);
  nEntradas = Serial.read(); // ACTUADORES
  data += nEntradas;
  data += ',';
  nSalidas = Serial.read(); // SENSORES
  data += nSalidas;

  data.toCharArray(readed,512);
  
  Udp.beginPacket(ip,2266);
  Udp.write(readed);
  Udp.endPacket();
  Serial.print('Y');
  delay(50);
  
}


void loop(){
  if(Serial.available()){
    if(Serial.read()=='W'){
      Serial.write('W');
      int i = 0;
      delay(1);
      while(Serial.available() && i<nSalidas){
        delay(1);
        salidas[i++] = Serial.read();
      }
      Udp.beginPacket(ip,2266);
      Udp.write(salidas,nSalidas);
      Udp.endPacket();
    }else{
      Serial.write('R');
      for(int i=0;i<nEntradas;++i){
        Serial.write(entradas[i]);
      }
    }
  }
  
  if (Udp.parsePacket()){
    int len = Udp.read(readed,256);
    for(int i=0;i<nEntradas;++i){
      entradas[i] = readed[i];
    }
    Udp.beginPacket(Udp.remoteIP(),2266);
    Udp.write('Y');
    Udp.endPacket();  
  }
}
