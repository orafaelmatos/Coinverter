# Currency Exchange Rates API
A modern web application that provides real-time currency exchange rates using data from trusted financial APIs.

This project demonstrates API integration, backend development with FastAPI, and frontend implementation with React, designed to simulate real-world scenarios of financial applications.

Live Demo
🌐 Open App - https://coinverter-cvtubq8yr-rafael-matos-projects.vercel.app/

## Features:
✅ Real-time exchange rates for multiple currencies (USD, EUR, GBP, BTC)
✅ Interactive interface with currency selection and amount conversion
✅ Historical chart for the last 30 days
✅ Backend caching to optimize API calls
✅ Responsive UI built with Material-UI
✅ Deployed on Vercel (Frontend) and Render (Backend) for easy access

## Architecture
 - Frontend: React (Vercel)
 - Backend: FastAPI (Render)
 - APIs Used:
   - BACEN API for fiat currencies (USD, EUR, GBP)
   - CoinGecko API for BTC (cached to prevent rate limit issues)

## Endpoints
GET /rate/{currency} → Get the latest exchange rate for a currency
GET /history?base=USD&days=30 → Get historical rates for the last N days


# How to Use
1. Open the frontend app (Vercel link above).
2. Select a currency (USD, EUR, GBP, BTC).
3. Enter the amount and see it converted to BRL.
4. View the last 30 days history in a chart.

# Local Development (Optional)
Clone the Repository
```
git clone https://github.com/your-username/currency-exchange-api.git
cd currency-exchange-api

(Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
Install dependencies
```
pip install -r requirements.txt
```

Run the FastAPI server
```
uvicorn backend.main:app --reload
```

Run the FastAPI server
```
cd frontend
npm install
npm start
```
