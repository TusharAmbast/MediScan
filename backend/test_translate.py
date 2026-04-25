import httpx
import asyncio

async def test():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                'https://translate.googleapis.com/translate_a/single',
                params={
                    'client': 'gtx',
                    'sl': 'en',
                    'tl': 'hi',
                    'dt': 't',
                    'q': 'hello'
                }
            )
            print(f"Status: {r.status_code}")
            data = r.json()
            translated = data[0][0][0]
            print("Translated:", translated.encode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
