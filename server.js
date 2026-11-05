const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const OPENROUTER_KEY = process.env.OPENROUTER_KEY; 

app.post('/api/chat', async (req, res) => {
    if (!OPENROUTER_KEY) return res.status(500).json({ error: "API Key missing on server." });
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${OPENROUTER_KEY}`, 
                "Content-Type": "application/json" 
            },
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

app.listen(3000, () => console.log("Backend running on port 3000"));