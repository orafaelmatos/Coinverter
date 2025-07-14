# Currency Exchange Rates API
A simple project designed to practice API implementation skills within software applications, fetching real-time currency rates from AwesomeAPI.

## Project Objective
The main goal of this project is to provide a lightweight tool to retrieve and display current exchange rates for popular currencies, simulating real-world use cases involving financial data integration.

## The system allows users to:
 - Select a currency (USD, EUR, BTC)
 - Retrieve the latest exchange rate for the selected currency
 - Display the exchange rate clearly to the user

## Technologies Used
 - Python 3.x
 - FastAPI
 - Requests (HTTP client)
 - React
   
## Features
 - Real-time currency exchange rate retrieval
 - User input for currency selection
 - Simple and clear output of exchange rates
 - Basic error handling for API requests

# Getting Started
Clone the Repository
```
bash
Copy code
git clone https://github.com/your-username/currency-exchange-api.git
cd currency-exchange-api
(Optional) Create and activate a virtual environment

bash
Copy code
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
Install dependencies
```
bash
Copy code
pip install -r requirements.txt
```

Run the FastAPI server
```
bash
Copy code
uvicorn backend.main:app --reload
```

# Notes
This project uses the alphavantage free service to retrieve currency data.

It is intended for educational and learning purposes.

You can extend it by adding support for more currencies or saving historical data.
