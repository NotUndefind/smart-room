import asyncio
import time

import aiomqtt
from services.mock import fakeData

topic = "chambre/esp32-01/sensor/state"
payload = {
    "type": "sensor",
    "device": "esp32-01",
    "isLive": True,
    "data": {"temperature": 22.5, "humidity": 45},
    "timestamp": int(time.time()),
}


async def detectTrueData():
    while True:
        try:
            async with aiomqtt.Client("192.168.1.2") as client:
                await client.subscribe(topic)
                print("Connecté au broker MQTT")
                while True:
                    try:
                        message = await asyncio.wait_for(
                            client.messages.__anext__(), timeout=10
                        )
                        print(message.payload)
                        payload["data"]["temperature"] = message.payload.decode()
                        payload["data"]["humidity"] = message.payload.decode()
                        payload["timestamp"] = int(time.time())
                        payload["isLive"] = True
                    except asyncio.TimeoutError:
                        print(
                            "Aucune donnée reçue depuis 10 secondes. Marquage comme non live."
                        )
                        payload["isLive"] = False
                        await fakeData(payload)
        except (aiomqtt.MqttError, OSError) as e:
            print(f"Connexion MQTT impossible : {e}")
            print("Mode mock activé. Nouvelle tentative dans 10 secondes...")
            payload["isLive"] = False
            await fakeData(payload)
            await asyncio.sleep(10)
