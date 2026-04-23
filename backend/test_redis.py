import asyncio
import redis.asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()
print(f"URL from .env: '{os.getenv('REDIS_URL')}'")

REDIS_URL = "rediss://default:gQAAAAAAATV_AAIncDI3ZTk2OGRkOTk0M2U0OGY4OWE5NWY0ZGI5ZmFmM2M0MXAyNzkyMzE@fresh-shepherd-79231.upstash.io:6379"

async def test():
    try:
        client = aioredis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_timeout=5.0
        )
        result = await client.ping()
        print(f"✅ Redis connected! PING response: {result}")
        await client.close()
    except Exception as e:
        print(f"❌ Redis failed: {type(e).__name__}: {e}")

asyncio.run(test())