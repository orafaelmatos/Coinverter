# 💱 Currency Exchange Rates API

A **modern web application** that delivers real-time currency exchange rates, historical data visualization, and an intuitive interface for currency conversion.  
This project demonstrates **API integration**, **FastAPI backend development**, and a **React-based frontend**, designed to simulate a real-world financial application.  

**Live Demo:**  
🌐 [Open Application](https://coinverter-rafael-matos-projects.vercel.app/)  

---

## ✅ Features
- **Convert Any Currency**: Supports conversion between **any two currencies**.
- **Real-Time Exchange Rates**: Access up-to-date rates for multiple global currencies including USD, EUR, GBP, BTC, BRL, and more.
- **Interactive UI**: User-friendly interface to select currencies, enter amounts, and see instant conversion results.
- **Historical Charts**: Visualize exchange rate trends for the last 30 days.
- **API Caching**: Optimized backend with caching to reduce API calls and improve performance.
- **Responsive Design**: Built with Material-UI for seamless experience across devices.
- **Full Deployment**:
  - Frontend on **Vercel**
  - Backend on **Render**

---

## 🏗️ Architecture
- **Frontend**: React (deployed on Vercel)
- **Backend**: FastAPI (deployed on Render)
- **Data Sources**:
  - **BACEN API** – for fiat currencies (USD, EUR, GBP)
  - **CoinGecko API** – for BTC (with backend caching to avoid rate limits)

---

## 🔌 API Endpoints
- `GET /rate/{currency}` → Retrieve the latest exchange rate for a given currency.
- `GET /history?base=USD&days=30` → Fetch historical rates for the last N days.

---

## 🚀 How to Use
1. Access the [live app](https://currency-converter-flame-nu.vercel.app/).
2. Select a currency (USD, EUR, GBP, BTC).
3. Enter the amount and view the conversion to BRL.
4. Check the 30-day historical chart for trend analysis.

---

## 🛠️ Local Development
Follow the steps below to run the project locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/currency-exchange-api.git
cd currency-exchange-api
```

### 2️⃣ Backend Setup (FastAPI)
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```
Install dependencies:
```bash
pip install -r requirements.txt
```
Run the FastAPI server:
```bash
uvicorn backend.main:app --reload
```
### 3️⃣ Frontend Setup (React)
```bash
cd frontend
npm install
npm start
```

# 📊 Tech Stack
- **Backend**: FastAPI, Uvicorn
- **Frontend**: React, Material-UI
- **Deployment**: Vercel (frontend), Render (backend)
- **APIs**: BACEN, CoinGecko

## 📜 License
This project is licensed under the [MIT License](LICENSE).
