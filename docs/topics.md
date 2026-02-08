# Topics actifs

| Topic                            | Direction  | Description            |
| -------------------------------- | ---------- | ---------------------- |
| `chambre/esp32-01/sensor/state`  | ESP32 → Pi | Température & humidité |
| `chambre/esp32-01/led/state`     | ESP32 → Pi | État LED actuel        |
| `chambre/esp32-01/led/command`   | Pi → ESP32 | Commande LED           |
| `chambre/esp32-01/system/status` | ESP32 → Pi | Heartbeat              |

## WLED (Ruban LED)

| Topic              | Direction | Payload                     | Description   |
| ------------------ | --------- | --------------------------- | ------------- |
| `chambre/wled/api` | Pi → WLED | JSON WLED API               | Commandes LED |
| `chambre/wled/g`   | WLED → Pi | `{"on":true,"bri":128,...}` | État global   |
