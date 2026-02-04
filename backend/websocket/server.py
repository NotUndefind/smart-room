import paho.mqtt.subscribe as subscribe
import asyncio

from websockets.asyncio.server import serve

async def hello(websocket):
    print("WebSocket connection established")
    while True:
        name = await websocket.recv()
        print(f"< {name}") # Log the received name
        greeting = f"Hello {name}!" # Print a greeting message
        await websocket.send(greeting)
        print(f"> {greeting}") # Send the greeting back to the client

async def main():
    async with serve(hello, "localhost", 8080) as server:
        await server.serve_forever()

if __name__ == "__main__":
        asyncio.run(main())
