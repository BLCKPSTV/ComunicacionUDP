#ifndef ESP_UDP_H
#define ESP_UDP_H

#include "SoftwareSerial.h"

//SoftwareSerial ss(14,17);

#define COMUNICACION Serial1

uint8_t N_ACTUADORES = 0;
uint8_t N_SENSORES = 0;

uint8_t* actuadores;
uint8_t* sensores;
uint8_t setUpdate = false;


void waitOKESP(){
  bool r = false;
  while(!r){
    if(COMUNICACION.available()){
      char e = COMUNICACION.read();
      if(e=='Y'){
        r = true;
      }
    }
  }
}

void flushESP(){
  while(COMUNICACION.available()){
    COMUNICACION.read();
    delay(1);
  }
}

void initESP(uint8_t acts,uint8_t sens){
  COMUNICACION.begin(19200);
  N_ACTUADORES = acts;
  N_SENSORES = sens;
  actuadores = new uint8_t[N_ACTUADORES*2];
  sensores = new uint8_t[N_SENSORES*2];
  waitOKESP();
  COMUNICACION.write(N_ACTUADORES*2);
  COMUNICACION.write(N_SENSORES*2);
  waitOKESP();
}


void updateESP(){
  if(setUpdate){
    COMUNICACION.write('W');
    while(!COMUNICACION.available());
    if(COMUNICACION.read()=='W'){
      setUpdate = false;
      for(int i=0;i<N_SENSORES*2;++i){
        COMUNICACION.write(sensores[i]);
      }
    }else{
      flushESP();   
    }
    delay(50);
  }
  COMUNICACION.write('R');
  while(!COMUNICACION.available());
  if(COMUNICACION.read()=='R'){
    delay(1);
    for(int i=0;i<N_ACTUADORES*2;++i){
      actuadores[i] = COMUNICACION.read();
      delay(2);
    }
  }else{
    flushESP();
  }
  delay(25);
}


int getESP(uint8_t actuador){
  return actuadores[actuador*2] | actuadores[(actuador*2)+1]<<8;
}

void setESP(uint8_t sensor, int16_t valor){
  sensores[sensor*2] = valor;
  sensores[(sensor*2)+1] = valor>>8;
  setUpdate = true;
}

#endif
