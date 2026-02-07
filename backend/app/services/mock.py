import random
import time


async def fakeData(payload):
    payload["data"]["temperature"] = f"{random.uniform(20.0, 30.0):.2f}"
    payload["data"]["humidity"] = f"{random.uniform(30.0, 60.0):.2f}"
    payload["isLive"] = False
    payload["timestamp"] = int(time.time())
