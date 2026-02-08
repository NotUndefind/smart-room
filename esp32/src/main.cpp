#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <ArduinoJson.h>

// DHT Sensor
#define DHTPIN 15
#define DHTTYPE DHT11
DHT_Unified dht(DHTPIN, DHTTYPE);
DynamicJsonDocument doc(1024);

// WiFi
const char *WIFI_SSID = "Freebox-319539";
const char *WIFI_PASS = "vzthkqhdbvqkhfxsq99k2v";

// MQTT
const char* MQTT_BROKER = "192.168.1.2";
const int MQTT_PORT = 1883;
const char* MQTT_ID = "ESP32Client";

// MQTT Topic
const char* MQTT_TOPIC = "chambre/sensor/esp32-01/state";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Function prototypes
// MQTT/WiFi setup and connection
void setupMqtt() {mqttClient.setServer(MQTT_BROKER, MQTT_PORT);}

void connectMqtt(){
  while(!mqttClient.connected()){
    Serial.println("Connecting to MQTT...");
    if(mqttClient.connect(MQTT_ID)){
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT. State=");
      Serial.print(mqttClient.state());
      delay(500);
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

//DHT Sensor setup
void setupDHT() {
  // Initialize device.
  dht.begin();
  Serial.println(F("DHTxx Unified Sensor Example"));
  // Print temperature sensor details.
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  Serial.println(F("------------------------------------"));
  Serial.println(F("Temperature Sensor"));
  Serial.print  (F("Sensor Type: ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:  ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:   ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:   ")); Serial.print(sensor.max_value); Serial.println(F("°C"));
  Serial.print  (F("Min Value:   ")); Serial.print(sensor.min_value); Serial.println(F("°C"));
  Serial.print  (F("Resolution:  ")); Serial.print(sensor.resolution); Serial.println(F("°C"));
  Serial.println(F("------------------------------------"));
  // Print humidity sensor details.
  dht.humidity().getSensor(&sensor);
  Serial.println(F("Humidity Sensor"));
  Serial.print  (F("Sensor Type: ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:  ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:   ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:   ")); Serial.print(sensor.max_value); Serial.println(F("%"));
  Serial.print  (F("Min Value:   ")); Serial.print(sensor.min_value); Serial.println(F("%"));
  Serial.print  (F("Resolution:  ")); Serial.print(sensor.resolution); Serial.println(F("%"));
  Serial.println(F("------------------------------------"));

}

void readDHT() {
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    doc["temperature"] = nullptr;
    Serial.println(F("Error reading temperature!"));
  }
  else {
    doc["temperature"] = event.temperature;
    Serial.print(F("Temperature: "));
    Serial.print(event.temperature);
    Serial.println(F("°C"));
  }

  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    doc["humidity"] = nullptr;
    Serial.println(F("Error reading humidity!"));
  }
  else {
    doc["humidity"] = event.relative_humidity;
    Serial.print(F("Humidity: "));
    Serial.print(event.relative_humidity);
    Serial.println(F("%"));
  }
}
void setup() {
  Serial.begin(115200);
  connectWiFi();
  setupMqtt();
  connectMqtt();
  setupDHT();

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
  readDHT();
  mqttClient.publish(MQTT_TOPIC,  doc.as<String>().c_str());
  delay(1000);

}

