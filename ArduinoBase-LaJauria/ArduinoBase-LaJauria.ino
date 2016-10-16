#include "ESP_UDP.h"

void setup() {
  
  Serial.begin(115200);
  Serial.println("OK1");
  initESP(5,1);
  Serial.println("OK");
}
int k=0;
void loop() {
  updateESP();
  for(int i=0;i<5;++i){
    Serial.print(i);
    Serial.print(": ");
    Serial.println(getESP(i));
  }
  delay(250);
  ++k;
  if(k>10){
    setESP(0,random(-32000,32000));
  }
}
