import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_DURATION = 300  # 5 minutes
cache = {}
cache_time = 0
cache_history = {}
cache_history_time = {}

EXCHANGE_API_KEY = "3d7ad800382825441510cafc"

CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "ARS"]


def fetch_fiat_rate(base):
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_API_KEY}/latest/{base}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if data['result'] != 'success':
            raise Exception(data.get('error-type', 'API error'))
        return data['conversion_rates']['BRL']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_btc_rate():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        return data['bitcoin']['brl']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_currency_info(code):
    url = f"https://restcountries.com/v3.1/currency/{code.lower()}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if data:
            return {
                "country": data[0].get("name", {}).get("common"),
                "symbol": data[0].get("currencies", {}).get(code.upper(), {}).get("symbol", "")
            }
    except:
        return None


@app.get("/")
def read_root():
    return {"status": "API is running"}

@app.get("/rates")
def get_rates():
    global cache, cache_time
    now = time.time()
    if cache and now - cache_time < CACHE_DURATION:
        return cache

    updated_rates = {}
    for currency in CURRENCIES:
        updated_rates[currency] = fetch_fiat_rate(currency)
    updated_rates["BTC"] = fetch_btc_rate()

    cache = updated_rates
    cache_time = now
    return cache

import logging

@app.get("/history")
def get_history(base: str = "USD", days: int = 30):
    global cache_history, cache_history_time
    base = base.upper()
    if base not in CURRENCIES:
        raise HTTPException(status_code=400, detail="Unsupported currency for history")

    if not (1 <= days <= 365):
        raise HTTPException(status_code=400, detail="Days must be between 1 and 365")

    key = f"{base}_{days}"
    now = time.time()
    # Check cache validity for this base+days combo
    if key in cache_history and (now - cache_history_time.get(key, 0) < CACHE_DURATION):
        return cache_history[key]

    end_date = datetime.today()
    start_date = end_date - timedelta(days=days)

    url = (
        f"https://www.alphavantage.co/query?"
        f"function=FX_DAILY&from_symbol={base}&to_symbol=BRL&apikey={EXCHANGE_API_KEY}"
    )

    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if not data.get("success"):
            logging.error(f"Timeseries API failed: {data}")
            raise Exception("Failed to fetch timeseries data")
        cache_history[key] = data["rates"]
        cache_history_time[key] = now
        
        return data["rates"]
    except Exception as e:
        logging.error(f"Error fetching timeseries data: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching timeseries data: {e}")



@app.get("/info/{code}")
def get_currency_info(code: str):
    info = fetch_currency_info(code.upper())
    if not info:
        raise HTTPException(status_code=404, detail="Currency information not found")
    return info
