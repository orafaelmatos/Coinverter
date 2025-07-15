import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CircularProgress,
  Button,
  Box,
  TextField,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_BASE = "http://localhost:8000";

const currencies = [
  { code: "USD", label: "USD (Dólar Americano)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "BTC", label: "BTC (Bitcoin)" },
  { code: "GBP", label: "GBP (Libra)" },
  { code: "BRL", label: "BRL (Real Brasileiro)" },
];

const getLocaleFromCurrency = (currency) => {
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
};

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  // Exchange Rate (to BRL)
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState(1);

  const [rate, setRate] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Currency Converter (any to any)
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BRL");
  const [convertAmount, setConvertAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState(null);

  // Fetch exchange rate (selectedCurrency → BRL)
  const fetchRate = useCallback(async (currency) => {
    setLoadingRate(true);
    setRateError(null);
    setRate(null);

    try {
      const res = await axios.get(`${API_BASE}/rate/${currency}`);
      const value = res.data[currency];
      setRate(value);
    } catch {
      setRateError("Falha ao obter taxa de câmbio.");
    } finally {
      setLoadingRate(false);
    }
  }, []);

  // Fetch history for selectedCurrency → BRL
  const fetchHistory = useCallback(async (currency) => {
    setLoadingHistory(true);
    setHistoryError(null);
    setHistory([]);

    try {
      if (currency === "BTC") {
        const res = await axios.get("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart", {
          params: { vs_currency: "brl", days: 30 },
        });

        const data = res.data.prices.map(([timestamp, price]) => ({
          date: new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp)),
          rate: price,
        }));

        setHistory(data);
      } else {
        const res = await axios.get(`${API_BASE}/history`, {
          params: { base: currency, days: 30 },
        });

        const data = Object.entries(res.data)
          .map(([date, obj]) => ({
            date,
            rate: parseFloat(obj.BRL),
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setHistory(data);
      }
    } catch {
      setHistoryError("Falha ao obter dados históricos.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRate(selectedCurrency);
    fetchHistory(selectedCurrency);
  }, [selectedCurrency, fetchRate, fetchHistory]);

  const handleConvert = async () => {
    if (!convertAmount || convertAmount <= 0) {
      setConvertError("Por favor, insira um valor válido.");
      return;
    }
    if (fromCurrency === toCurrency) {
      setConvertError("As moedas de origem e destino não podem ser iguais.");
      return;
    }

    setConvertLoading(true);
    setConvertError(null);
    setConvertedAmount(null);

    try {
      const res = await axios.get(`${API_BASE}/convert`, {
        params: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount: convertAmount,
        },
      });
      setConvertedAmount(res.data.converted_amount);
    } catch {
      setConvertError("Falha na conversão. Tente novamente.");
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          p: 3,
        }}
      >
        {/* LEFT COLUMN */}
        <Box display="flex" flexDirection="column" gap={3} sx={{ overflow: "hidden" }}>
          {/* Card: Exchange Rate */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Taxas de câmbio (para BRL)
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="selected-currency-label">Selecionar moeda</InputLabel>
              <Select
                labelId="selected-currency-label"
                id="selected-currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                label="Selecionar moeda"
              >
                {currencies
                  .filter((c) => c.code !== "BRL")
                  .map(({ code, label }) => (
                    <MenuItem key={code} value={code}>
                      {label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantidade"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              helperText={`Converter ${amount} ${selectedCurrency} para BRL`}
            />

            {loadingRate ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : rateError ? (
              <Typography color="error" align="center">
                {rateError}
              </Typography>
            ) : (
              rate !== null && (
                <Box textAlign="center" my={2}>
                  <Typography variant="h6">
                    {amount} {selectedCurrency} ={" "}
                    <Box component="span" color="primary.main" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      {formatBRL(amount * rate)}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1 {selectedCurrency} = {formatBRL(rate)}
                  </Typography>
                </Box>
              )
            )}

            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                onClick={() => {
                  fetchRate(selectedCurrency);
                  fetchHistory(selectedCurrency);
                }}
              >
                Atualizar taxas
              </Button>
            </Box>
          </Card>

          {/* Card: History */}
          <Card sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Histórico (30 dias)
            </Typography>
            {loadingHistory ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : historyError ? (
              <Typography color="error">{historyError}</Typography>
            ) : history.length > 0 ? (
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                    <YAxis />
                    <Tooltip
                      formatter={(val) =>
                        new Intl.NumberFormat(getLocaleFromCurrency(selectedCurrency), {
                          style: "currency",
                          currency: selectedCurrency,
                        }).format(val)
                      }
                    />
                    <Line type="monotone" dataKey="rate" stroke="#1b8eecff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography align="center" color="text.secondary">
                Nenhum dado histórico disponível.
              </Typography>
            )}
          </Card>
        </Box>

        {/* RIGHT COLUMN */}
        <Card sx={{ display: "flex", flexDirection: "column", justifyContent: "center", p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Conversor de moedas
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
            <FormControl sx={{ flexGrow: 1, minWidth: 140 }}>
              <InputLabel id="from_label" >De</InputLabel>
              <Select id="from_label" label="De" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                {currencies.map(({ code, label }) => (
                  <MenuItem key={code} value={code}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flexGrow: 1, minWidth: 140 }}>
              <InputLabel id="to_label">Para</InputLabel>
              <Select id="to_label" label="Para" value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                {currencies.map(({ code, label }) => (
                  <MenuItem key={code} value={code}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Quantidade"
            type="number"
            value={convertAmount}
            onChange={(e) => setConvertAmount(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            helperText={`Converter de ${fromCurrency} para ${toCurrency}`}
          />

          <Button variant="contained" onClick={handleConvert} disabled={convertLoading} sx={{ mb: 3 }}>
            Converter
          </Button>

          {convertLoading && (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          )}

          {convertedAmount !== null && !convertLoading && (
            <Card sx={{ textAlign: "center", p: 3, backgroundColor: "primary.dark", color: "#fff" }}>
              <Typography variant="h6">
                {convertAmount} {fromCurrency}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                {new Intl.NumberFormat(getLocaleFromCurrency(toCurrency), {
                  style: "currency",
                  currency: toCurrency,
                }).format(convertedAmount)}
              </Typography>
            </Card>
          )}

          {convertError && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {convertError}
            </Typography>
          )}
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default App;
