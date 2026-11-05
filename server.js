const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const OPENROUTER_KEY = process.env.OPENROUTER_KEY; 

// --- ROUTE 1: AI CHAT ---
app.post('/api/chat', async (req, res) => {
    if (!OPENROUTER_KEY) return res.status(500).json({ error: "API Key missing on server." });
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [{ role: "user", content: req.body.message }]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (e) { 
        res.status(500).json({ error: "Backend failed to connect to AI." }); 
    }
});

// --- ROUTE 2: REAL MARKET DATA (BINANCE) ---
app.get('/api/market-data', async (req, res) => {
    try {
        // Fetch 1-minute candles for BTC/USDT (limit 50)
        const binanceResponse = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50');
        const binanceData = await binanceResponse.json();

        // Format Binance data to match what our frontend chart expects
        const formattedData = binanceData.map(candle => ({
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4])
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch market data." });
    }
});

app.listen(3000, () => console.log("Backend running on port 3000"));