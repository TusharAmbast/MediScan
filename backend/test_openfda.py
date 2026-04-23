import httpx
import asyncio

async def test():
    url = "https://api.fda.gov/drug/label.json"
    
    # Test 1 - generic name
    params = {"search": 'openfda.generic_name:"Acetaminophen"', "limit": 1}
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params)
        print(f"Test 1 - Status: {r.status_code}")
        print(f"Response: {r.text[:400]}")
        print("---")
    
    # Test 2 - brand name
    params = {"search": 'openfda.brand_name:"Tylenol"', "limit": 1}
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params)
        print(f"Test 2 - Status: {r.status_code}")
        print(f"Response: {r.text[:400]}")

asyncio.run(test())