// ========================================
// TradePro Dashboard — Final Script
// ========================================
const btnCall = document.getElementById("btnCall");
const btnPut = document.getElementById("btnPut");
const tradesBody = document.getElementById("tradesBody");
const amountInput = document.querySelector(".trade-controls .input-group input");
const priceMarker = document.querySelector(".price-marker");
const tableHead = document.getElementById("tableHead");
const balanceEl = document.getElementById("accountBalance");
const depositBtn = document.getElementById("btnDeposit");
const resetBtn = document.getElementById("btnReset");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatLog = document.getElementById("chatLog");
const tabButtons = document.querySelectorAll(".tabs-header .tab-btn");
const chartContainer = document.getElementById("tvChart");

let savedData = localStorage.getItem("tradeproState");
let parsedData = savedData ? JSON.parse(savedData) : null;
let currentBalance = parsedData ? parsedData.balance : 1000.00;
let chart, candlestickSeries, lastCandle;

const state = {
    currentAsset: "EUR/USD",
    currentFlag: "https://flagcdn.com/w20/eu.png",
    currentPrice: 1.09732,
    currentPayout: 82
};

const DEFAULT_OPEN_TRADES = `
    <tr><td><img src="https://flagcdn.com/w20/eu.png" style="width:14px; margin-right:5px; vertical-align:middle;"> EUR/USD</td><td class="up"><i class="fa-solid fa-arrow-up"></i> Call</td><td>$50</td><td>1.09732</td><td>1.09765</td><td>82%</td><td><span class="status">In Progress</span></td></tr>
    <tr><td><img src="https://flagcdn.com/w20/gb.png" style="width:14px; margin-right:5px; vertical-align:middle;"> GBP/USD</td><td class="down"><i class="fa-solid fa-arrow-down"></i> Put</td><td>$30</td><td>1.27210</td><td>1.27180</td><td>82%</td><td><span class="status">In Progress</span></td></tr>
`;

function saveState() {
    localStorage.setItem("tradeproState", JSON.stringify({ balance: currentBalance, trades: tradesBody.innerHTML }));
}

// CHART SETUP
function initChart() {
    if (!chartContainer) return;
    chart = LightweightCharts.createChart(chartContainer, {
        layout: { background: { type: 'solid', color: '#131823' }, textColor: '#8B94A7' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.03)' }, horzLines: { color: 'rgba(255, 255, 255, 0.03)' } },
        rightPriceScale: { borderColor: '#232A3B' },
        timeScale: { borderColor: '#232A3B', timeVisible: true },
    });
    candlestickSeries = chart.addCandlestickSeries({ upColor: '#00C076', downColor: '#FF3B30', borderDownColor: '#FF3B30', borderUpColor: '#00C076', wickDownColor: '#FF3B30', wickUpColor: '#00C076' });
    updateChartData();
    
              // Force redraw after paint (Delayed to ensure flexbox is fully rendered)
        setTimeout(() => {
            chart.resize(chartContainer.clientWidth, chartContainer.clientHeight);
            if (candlestickSeries) {
                // This forces the canvas to draw the data immediately
                candlestickSeries.applyOptions({}); 
            }
        }, 500);
        window.addEventListener('resize', () => chart.resize(chartContainer.clientWidth, chartContainer.clientHeight));
}

function updateChartData() {
    if (!candlestickSeries) return;
    const data = [];
    let basePrice = state.currentPrice;
    let time = Math.floor(Date.now() / 1000) - (50 * 60);
    for (let i = 0; i < 50; i++) {
        const open = basePrice;
        const volatility = state.currentAsset === "BTC/USD" ? 50 : 0.002;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * (volatility / 2);
        const low = Math.min(open, close) - Math.random() * (volatility / 2);
        data.push({ time: time, open, high, low, close });
        basePrice = close; time += 60;
    }
    candlestickSeries.setData(data);
    lastCandle = { ...data[data.length - 1] };
}

// BALANCE & TRADES
function updateBalance(amount) {
    currentBalance += amount;
    if (balanceEl) {
        balanceEl.textContent = "$" + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        balanceEl.classList.remove("balance-flash"); void balanceEl.offsetWidth; balanceEl.classList.add("balance-flash");
    }
    saveState();
}

function addTrade(type) {
    if (!tradesBody) return;
    const amount = parseFloat((amountInput?.value || "50").replace(/[^0-9.]/g, "")) || 50;
    const isCall = type === "call";
    const row = document.createElement("tr");
    row.className = "trade-row-new";
    row.innerHTML = `<td>${state.currentAsset}</td><td class="${isCall ? 'up' : 'down'}"><i class="fa-solid fa-arrow-${isCall ? 'up' : 'down'}"></i> ${isCall ? 'Call' : 'Put'}</td><td>$${amount}</td><td>${(state.currentPrice - 0.0001).toFixed(4)}</td><td class="live-price">${state.currentPrice.toFixed(2)}</td><td>${state.currentPayout}%</td><td><span class="status">In Progress</span></td>`;
    tradesBody.insertBefore(row, tradesBody.firstChild);
    setTimeout(() => row.classList.remove("trade-row-new"), 800);
    updateBalance(-amount);
}

if (depositBtn) depositBtn.addEventListener("click", () => updateBalance(500));
if (resetBtn) resetBtn.addEventListener("click", () => { if (confirm("Reset?")) { localStorage.removeItem("tradeproState"); location.reload(); } });
if (btnCall) btnCall.addEventListener("click", () => addTrade("call"));
if (btnPut) btnPut.addEventListener("click", () => addTrade("put"));

// LIVE TICK
setInterval(() => {
    state.currentPrice = Math.max(1.0, state.currentPrice + (Math.random() - 0.5) * (state.currentAsset === "BTC/USD" ? 10 : 0.0001));
    if (priceMarker) priceMarker.textContent = state.currentPrice.toFixed(2);
    document.querySelectorAll(".live-price").forEach(c => c.textContent = state.currentPrice.toFixed(2));
    if (candlestickSeries && lastCandle) {
        lastCandle.close = state.currentPrice;
        if (state.currentPrice > lastCandle.high) lastCandle.high = state.currentPrice;
        if (state.currentPrice < lastCandle.low) lastCandle.low = state.currentPrice;
        candlestickSeries.update(lastCandle);
    }
}, 2000);

// ASSET SWITCHING
const ASSET_DATA = {
    "EUR/USD": { flag: "https://flagcdn.com/w20/eu.png", winRate: "82%", signal: "CALL", signalIcon: "fa-arrow-up", basePrice: 1.09732, payout: 82 },
    "GBP/USD": { flag: "https://flagcdn.com/w20/gb.png", winRate: "82%", signal: "PUT", signalIcon: "fa-arrow-down", basePrice: 1.27210, payout: 82 },
    "BTC/USD": { flag: null, winRate: "78%", signal: "CALL", signalIcon: "fa-arrow-up", basePrice: 67450.00, payout: 78 }
};

document.querySelectorAll(".asset-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
        if (e.target.closest(".tab-close")) return;
        const asset = tab.dataset.asset; const data = ASSET_DATA[asset];
        if (!data) return;
        state.currentAsset = asset; state.currentPrice = data.basePrice; state.currentPayout = data.payout;
        document.querySelectorAll(".asset-tab").forEach(t => t.classList.toggle("active", t.dataset.asset === asset));
        document.querySelector(".chart-header h2").innerHTML = `${asset} <i class="fa-solid fa-chevron-down" style="font-size:12px;"></i>`;
        document.querySelector(".signal-direction").innerHTML = `<i class="fa-solid ${data.signalIcon}"></i> ${data.signal}`;
        updateChartData();
    });
});

// CHAT
function sendChat() {
    if (!chatInput || !chatInput.value.trim()) return;
    const text = chatInput.value.trim().toLowerCase();
    chatLog.innerHTML += `<div class="chat-message user"><span class="chat-avatar">👤</span><div class="chat-text">${chatInput.value}</div></div>`;
    chatInput.value = "";
    setTimeout(() => {
        let reply = "Try asking to analyze EUR/USD.";
        if (text.includes("eur")) reply = "📊 EUR/USD — Bullish. Win rate: 82%.";
        if (text.includes("help")) reply = "I can analyze pairs, give win rates, or suggest trades.";
        chatLog.innerHTML += `<div class="chat-message bot"><span class="chat-avatar">🤖</span><div class="chat-text">${reply}</div></div>`;
        chatLog.scrollTop = chatLog.scrollHeight;
    }, 800);
}
if (chatSend) chatSend.addEventListener("click", sendChat);
if (chatInput) chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(); });

// INIT
window.addEventListener("load", () => {
    if (balanceEl && currentBalance !== 1000.00) balanceEl.textContent = "$" + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    tradesBody.innerHTML = (parsedData && parsedData.trades) ? parsedData.trades : DEFAULT_OPEN_TRADES;
    setTimeout(() => { chatLog.innerHTML = `<div class="chat-message bot"><span class="chat-avatar">🤖</span><div class="chat-text">Hi! Ask me to <em>analyze EUR/USD</em>.</div></div>`; }, 400);
    setTimeout(initChart, 500);
});