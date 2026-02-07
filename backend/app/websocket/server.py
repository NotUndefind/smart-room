import sys

sys.path.append("..")

import asyncio
import json

from services.detectTrueTempHum import detectTrueData, payload
from websockets.asyncio.server import serve

clients = set()


# Server Websocket
async def wss():
    async with serve(hello, "localhost", 8080) as server:
        await server.serve_forever()


async def hello(websocket):
    print("WebSocket connection established")
    clients.add(websocket)
    try:
        while True:
            await websocket.send(json.dumps(payload))
            await asyncio.sleep(5)
    finally:
        clients.remove(websocket)


# Lanch script
async def main():
    task1 = asyncio.create_task(wss())
    task2 = asyncio.create_task(detectTrueData())
    await asyncio.gather(task1, task2)


if __name__ == "__main__":
    asyncio.run(main())
