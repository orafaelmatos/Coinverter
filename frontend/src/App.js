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
  Snackbar,
  Alert,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_URL = "https://coinverter-backend-ni0v.onrender.com/rates";
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
    case "JPY":
      return "ja-JP";
    case "CAD":
      return "en-CA";
    case "ARS":
      return "es-AR";
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
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setRates(response.data);
    } catch (e) {
      setError("Failed to fetch exchange rates.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (currency) => {
    setLoadingHistory(true);
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

        const data = Object.entries(response.data).map(([date, rateObj]) => {
          return {
            date,
            rate: parseFloat(rateObj["BRL"]),
          };
        });

        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setHistory(data);
      }
    } catch (e) {
      setError("Failed to fetch historical data.");
      setSnackbarOpen(true);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

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

  const selectedRate = rates?.[selectedCurrency];

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
          <MenuItem value="JPY">JPY (Peso Japonês)</MenuItem>
          <MenuItem value="CAD">CAD (Dólar Canadense)</MenuItem>
          <MenuItem value="ARS">ARS (Peso Argentino)</MenuItem>
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
      ) : error ? (
        <Typography color="error" align="center">
          {error}
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
      ) : (
        <Typography>No historical data available.</Typography>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
