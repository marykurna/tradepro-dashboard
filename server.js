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

// --- ROUTE 2: REAL MARKET DATA (COINBASE) ---
app.get('/api/market-data', async (req, res) => {
    try {
        // Fetch 1-minute candles for BTC-USD from Coinbase
        const coinbaseResponse = await fetch('https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=60');
        const coinbaseData = await coinbaseResponse.json();

        // Coinbase returns data newest first. We need to reverse it.
        // Format: [time, low, high, open, close, volume]
        const formattedData = coinbaseData.reverse().map(candle => ({
            open: candle[3],
            high: candle[2],
            low: candle[1],
            close: candle[4]
        }));

        // Return only the last 50 candles
        res.json(formattedData.slice(-50));
    } catch (error) {
        console.error("Coinbase Error:", error);
        res.status(500).json({ error: "Failed to fetch market data." });
    }
});

app.listen(3000, () => console.log("Backend running on port 3000"));