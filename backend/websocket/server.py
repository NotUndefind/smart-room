import asyncio
import json

import aiomqtt
from websockets.asyncio.server import serve

clients = set()

topic = "chambre/esp32-01/sensor/state"
data = {
    "topic": topic,
    "payload": "",
}


# Server Websocket
async def wss():
    async with serve(hello, "localhost", 8080) as server:
        await server.serve_forever()


# Subscribe
async def reciveMqtt():
    async with aiomqtt.Client("192.168.1.2") as client:
        await client.subscribe(topic)
        async for message in client.messages:
            print(message.payload)
            data["payload"] = message.payload.decode()
            data["topic"] = str(message.topic)
            for ws in clients:
                try:
                    await ws.send(json.dumps(data))
                except Exception as e:
                    print(f"Erreur : {e}")


async def hello(websocket):
    print("WebSocket connection established")
    clients.add(websocket)
    try:
        while True:
            message = await websocket.recv()
            print(f"< {message}")  # Log the received name
            await websocket.send(message)
    finally:
        clients.remove(websocket)


# Lanch Websocket
async def main():
    task1 = asyncio.create_task(wss())

    task2 = asyncio.create_task(reciveMqtt())
    await asyncio.gather(task1, task2)


if __name__ == "__main__":
    asyncio.run(main())
