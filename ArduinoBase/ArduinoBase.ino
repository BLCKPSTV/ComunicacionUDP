#include "ESP_UDP.h"

void setup() {
  initESP(5,2);
  Serial.begin(115200);
}
void loop() {
  updateESP();
  for(int i=0;i<5;++i){
    Serial.println(getESP(i));
  }
  int k = random(-32000,32000);
  setESP(0,k);
  setESP(1,k);
  delay(1000);

}
