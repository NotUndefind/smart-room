#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi
const char *WIFI_SSID = "Freebox-319539";
const char *WIFI_PASS = "vzthkqhdbvqkhfxsq99k2v";

// MQTT
const char* MQTT_BROKER = "192.168.1.2";
const int MQTT_PORT = 1883;
const char* MQTT_ID = "ESP32Client";

// MQTT Topic
const char* MQTT_TOPIC = "chambre/esp32-01/sensor/state";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setupMqtt() {mqttClient.setServer(MQTT_BROKER, MQTT_PORT);}

void connectMqtt(){
  while(!mqttClient.connected()){
    Serial.println("Connecting to MQTT...");
    if(mqttClient.connect(MQTT_ID)){
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT. State=");
      Serial.print(mqttClient.state());
      delay(1000);
    }
  }
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASS); // Connect to the WiFi network

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());


}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  setupMqtt();
  connectMqtt();

}

void loop() {

  // Reconnect if WiFi is disconnected
  if(WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Reconnect if MQTT is disconnected
  if(!mqttClient.connected()) {
    connectMqtt();
  }

  // Publish a message to the MQTT topic
  Serial.println("Publishing message to MQTT topic...");
  mqttClient.publish(MQTT_TOPIC, "Helle World from ESP32");
  delay(2000);
}

