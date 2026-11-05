// ========================================
// TradePro Dashboard — Real Live Market Data
// ========================================

// Your Render Backend URL
const BACKEND_URL = "https://tradepro-backend-d4zt.onrender.com";

// State
const state = { price: 0 };
let canvas, ctx, chartData = [];

// ================================
// 1. Fetch Real Data from Backend
// ================================
async function fetchLiveData() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/market-data`);
        if (!response.ok) throw new Error("Backend not ready");
        
        const data = await response.json();
        chartData = data; // Update global data
        
        // Set state price to the latest close price
        if (chartData.length > 0) {
            state.price = chartData[chartData.length - 1].close;
            const marker = document.querySelector('.price-marker');
            if (marker) marker.textContent = state.price.toFixed(2);
        }
        
        drawChart();
    } catch (error) {
        console.error("Failed to load market data:", error);
        // If backend is asleep, generate temporary data so chart doesn't break
        if (chartData.length === 0) generateFallbackData();
    }
}

// Fallback in case backend is waking up
function generateFallbackData() {
    chartData = [];
    let base = 65000; // Approximate BTC price
    for (let i = 0; i < 40; i++) {
        const open = base;
        const close = open + (Math.random() - 0.5) * 100;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        chartData.push({ open, high, low, close });
        base = close;
    }
    drawChart();
}

// ================================
// 2. Draw Chart
// ================================
function drawChart() {
    if (!canvas || !ctx || chartData.length === 0) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for (let i = 0; i < height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

    let min = Infinity, max = -Infinity;
    chartData.forEach(c => { if (c.high > max) max = c.high; if (c.low < min) min = c.low; });
    const padding = (max - min) * 0.1;
    min -= padding; max += padding;
    const range = max - min;
    const candleWidth = (width - 40) / chartData.length;

    // Draw Candles
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
    
    // Fetch initial data
    fetchLiveData();
    
    window.addEventListener('resize', drawChart);
}

// ================================
// 3. AI Chat
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
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        
        const data = await response.json();
        document.getElementById(typingId)?.remove();
        
        if (data.error) appendBubble('❌ Error: ' + data.error, 'bot');
        else if (data.choices && data.choices[0]) appendBubble(data.choices[0].message.content, 'bot');
        else appendBubble('❌ Unexpected response from AI.', 'bot');
    } catch (error) {
        document.getElementById(typingId)?.remove();
        appendBubble('❌ Failed to connect. Backend may be waking up (wait 30s).', 'bot');
    }
}

if (chatSend) chatSend.addEventListener('click', sendChat);
if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });

// ================================
// 4. Trade Buttons
// ================================
document.getElementById('btnDeposit')?.addEventListener('click', () => {
    const bal = document.getElementById('accountBalance');
    if (bal) bal.textContent = "$1,500.00";
});
document.getElementById('btnCall')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) tbody.innerHTML = `<tr><td>BTC/USDT</td><td style="color:#00C076">Call</td><td>$50</td><td>${state.price.toFixed(2)}</td><td class="live-price">${state.price.toFixed(2)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
});
document.getElementById('btnPut')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) tbody.innerHTML = `<tr><td>BTC/USDT</td><td style="color:#FF3B30">Put</td><td>$50</td><td>${state.price.toFixed(2)}</td><td class="live-price">${state.price.toFixed(2)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
});

// ================================
// 5. Init
// ================================
window.addEventListener('load', () => {
    setTimeout(initCustomChart, 200);
    
    // Refresh data every 10 seconds to keep it live
    setInterval(fetchLiveData, 10000); 
    
    setTimeout(() => appendBubble('Hi! I\'m connected to real-time Binance data. Ask me anything!', 'bot'), 500);
});