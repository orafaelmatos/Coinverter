import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_URL = "https://coinverter-backend-ni0v.onrender.com/rate";
const HISTORY_URL = "https://coinverter-backend-ni0v.onrender.com/history";

function getLocaleFromCurrency(currency) {
  switch (currency) {
    case "BRL":
      return "pt-BR";
    case "USD":
      return "en-US";
    case "EUR":
      return "de-DE";
    case "GBP":
      return "en-GB";
    case "BTC":
      return "en-US";
    default:
      return "en-US";
  }
}

function App() {
  const [rates, setRates] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchRates = async (currency) => {
    setLoading(true);
    setRateError(null);
    try {
      const response = await axios.get(`${API_URL}/${currency}`);
      setRates(response.data);
      const value = response.data[currency];
      setRates(value); 
    } catch (e) {
      setRateError("Failed to fetch exchange rates.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (currency) => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      if (currency === "BTC") {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart", {
          params: {
            vs_currency: "brl",
            days: 30,
          },
        });

        const data = response.data.prices.map(([timestamp, price]) => {
          const date = new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
          return {
            date,
            rate: price,
          };
        });

        setHistory(data);
      } else {
        const response = await axios.get(HISTORY_URL, {
          params: { base: currency, days: 30 },
        });

        const data = Object.entries(response.data).map(([date, obj]) => ({
          date,
          rate: parseFloat(obj.BRL),
        }));

        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setHistory(data);
      }
    } catch (e) {
      setHistoryError("Failed to fetch historical data.");
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedCurrency) {
      fetchRates(selectedCurrency);
      fetchHistory(selectedCurrency);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (selectedCurrency) {
      fetchHistory(selectedCurrency);
    }
  }, [selectedCurrency]);

  const formatBRL = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const handleRefresh = () => {
    fetchRates();
    fetchHistory(selectedCurrency);
  };

  const selectedRate = rates;

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Taxas de câmbio
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="currency-select-label">Selecionar moeda</InputLabel>
        <Select
          labelId="currency-select-label"
          value={selectedCurrency}
          label="Select Currency"
          onChange={handleChange}
        >
          <MenuItem value="USD">USD (Dólar Americano)</MenuItem>
          <MenuItem value="EUR">EUR (Euro)</MenuItem>
          <MenuItem value="BTC">BTC (Bitcoin)</MenuItem>
          <MenuItem value="GBP">GBP (Libra)</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Quantidade"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : rateError ? (
        <Typography color="error" align="center">
          {rateError}
        </Typography>
      ) : selectedRate ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {amount} {selectedCurrency} = <strong>{formatBRL(amount * selectedRate)}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              1 {selectedCurrency} = {formatBRL(selectedRate)}
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <Box display="flex" justifyContent="center" mb={4}>
        <Button variant="contained" onClick={handleRefresh} disabled={loading}>
          Taxas de atualização
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Histórico dos últimos 30 dias ({selectedCurrency} to BRL)
      </Typography>

      {loadingHistory ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : history.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip
              formatter={(value) => {
                return new Intl.NumberFormat(getLocaleFromCurrency(selectedCurrency), {
                  style: "currency",
                  currency: selectedCurrency,
                }).format(value);
              }}
            />
            <Line type="monotone" dataKey="rate" stroke="#1976d2" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : historyError ? (
        <Typography color="error">{historyError}</Typography>
      ) : (
        <Typography align="center" color="textSecondary">
          No historical data available for {selectedCurrency}. Try again later.
        </Typography>
      )}
    </Container>
  );
}

export default App;
