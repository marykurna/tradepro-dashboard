// ========================================
// TradePro Dashboard — Real AI Chat
// ========================================

// ================================
// 1. AI Configuration (OpenRouter)
// ================================
const OPENAI_API_KEY = "YOUR_KEY_HERE"; // <--- PASTE YOUR KEY HERE
const OPENAI_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ================================
// 2. State
// ================================
const state = { asset: "EUR/USD", price: 1.09732, payout: 82 };
let canvas, ctx, chartData = [];

// ================================
// 3. Chart Data
// ================================
function generateChartData() {
    chartData = [];
    let base = state.price;
    for (let i = 0; i < 40; i++) {
        const open = base;
        const close = open + (Math.random() - 0.5) * 0.002;
        const high = Math.max(open, close) + Math.random() * 0.001;
        const low = Math.min(open, close) - Math.random() * 0.001;
        chartData.push({ open, high, low, close });
        base = close;
    }
}

// ================================
// 4. Draw Chart
// ================================
function drawChart() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for (let i = 0; i < height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

    let min = Infinity, max = -Infinity;
    chartData.forEach(c => { if (c.high > max) max = c.high; if (c.low < min) min = c.low; });
    const padding = (max - min) * 0.1;
    min -= padding; max += padding;
    const range = max - min;
    const candleWidth = (width - 40) / chartData.length;

    chartData.forEach((candle, index) => {
        const x = 20 + (index * candleWidth) + (candleWidth / 2);
        const yHigh = height - ((candle.high - min) / range) * height;
        const yLow = height - ((candle.low - min) / range) * height;
        const yOpen = height - ((candle.open - min) / range) * height;
        const yClose = height - ((candle.close - min) / range) * height;
        const isGreen = candle.close > candle.open;
        ctx.strokeStyle = isGreen ? '#00C076' : '#FF3B30';
        ctx.fillStyle = isGreen ? '#00C076' : '#FF3B30';
        ctx.beginPath(); ctx.moveTo(x, yHigh); ctx.lineTo(x, yLow); ctx.stroke();
        const bodyWidth = candleWidth * 0.6;
        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);
        ctx.fillRect(x - bodyWidth / 2, Math.min(yOpen, yClose), bodyWidth, bodyHeight);
    });
}

function initCustomChart() {
    canvas = document.getElementById('tvChart');
    if (!canvas) return;
    canvas.innerHTML = '<canvas style="width: 100%; height: 100%;"></canvas>';
    ctx = canvas.querySelector('canvas').getContext('2d');
    generateChartData();
    drawChart();
    window.addEventListener('resize', drawChart);
}

function tick() {
    if (chartData.length === 0) return;
    state.price = Math.max(1.0, state.price + (Math.random() - 0.5) * 0.0001);
    const last = chartData[chartData.length - 1];
    last.close = state.price;
    if (state.price > last.high) last.high = state.price;
    if (state.price < last.low) last.low = state.price;
    const marker = document.querySelector('.price-marker');
    if (marker) marker.textContent = state.price.toFixed(2);
    drawChart();
}

// ================================
// 5. REAL AI CHAT
// ================================
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatLog = document.getElementById('chatLog');

function appendBubble(text, sender) {
    const avatar = sender === 'user' ? '👤' : '🤖';
    const className = sender === 'user' ? 'chat-message user' : 'chat-message bot';
    chatLog.innerHTML += `<div class="${className}"><span class="chat-avatar">${avatar}</span><div class="chat-text">${text}</div></div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendChat() {
    if (!chatInput || !chatInput.value.trim()) return;
    const userText = chatInput.value.trim();
    chatInput.value = '';
    
    appendBubble(userText, 'user');
    
    const typingId = 'typing-' + Date.now();
    chatLog.innerHTML += `<div id="${typingId}" class="chat-message bot"><span class="chat-avatar">🤖</span><div class="chat-text">Thinking...</div></div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
    
    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
             model: 'openrouter/free',
                messages: [
                    { role: 'system', content: 'You are a helpful trading assistant for a platform called TradePro. Answer in under 3 sentences. Be friendly and use trading terminology.' },
                    { role: 'user', content: userText }
                ]
            })
        });
        
        const data = await response.json();
        document.getElementById(typingId)?.remove();
        
        if (data.error) {
            appendBubble('❌ Error: ' + data.error.message, 'bot');
        } else if (data.choices && data.choices[0]) {
            appendBubble(data.choices[0].message.content, 'bot');
        } else {
            appendBubble('❌ Unexpected response from AI.', 'bot');
        }
    } catch (error) {
        document.getElementById(typingId)?.remove();
        appendBubble('❌ Failed to connect. Check your API key and internet.', 'bot');
        console.error('Chat error:', error);
    }
}

if (chatSend) chatSend.addEventListener('click', sendChat);
if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });

// ================================
// 6. Trade Buttons
// ================================
document.getElementById('btnDeposit')?.addEventListener('click', () => {
    const bal = document.getElementById('accountBalance');
    if (bal) bal.textContent = "$1,500.00";
});
document.getElementById('btnCall')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) tbody.innerHTML = `<tr><td>EUR/USD</td><td style="color:#00C076">Call</td><td>$50</td><td>${state.price.toFixed(4)}</td><td class="live-price">${state.price.toFixed(4)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
});
document.getElementById('btnPut')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) tbody.innerHTML = `<tr><td>EUR/USD</td><td style="color:#FF3B30">Put</td><td>$50</td><td>${state.price.toFixed(4)}</td><td class="live-price">${state.price.toFixed(4)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
});

// ================================
// 7. Init
// ================================
window.addEventListener('load', () => {
    setTimeout(initCustomChart, 200);
    setInterval(tick, 2000);
    setTimeout(() => appendBubble('Hi! I\'m your real AI trading assistant. Ask me anything about trading, crypto, or markets!', 'bot'), 500);
});