// ========================================
// TradePro Dashboard — Final Verified Script
// ========================================

// 1. DOM ELEMENTS
const btnCall = document.getElementById("btnCall");
const btnPut = document.getElementById("btnPut");
const tradesBody = document.getElementById("tradesBody");
const amountInput = document.querySelector(".trade-controls .input-group input");
const priceMarker = document.querySelector(".price-marker");
const tableHead = document.getElementById("tableHead");

// 2. STATE & STORAGE
let savedData = localStorage.getItem("tradeproState");
let parsedData = savedData ? JSON.parse(savedData) : null;
let currentBalance = parsedData ? parsedData.balance : 1000.00;

const state = {
    currentAsset: "EUR/USD",
    currentFlag: "https://flagcdn.com/w20/eu.png",
    currentPrice: 1.09732,
    currentPayout: 82
};

const balanceEl = document.getElementById("accountBalance");
const depositBtn = document.getElementById("btnDeposit");
const resetBtn = document.getElementById("btnReset");

function saveState() {
    const tradesHTML = tradesBody ? tradesBody.innerHTML : "";
    localStorage.setItem("tradeproState", JSON.stringify({
        balance: currentBalance,
        trades: tradesHTML
    }));
}

// 3. DEFAULT TRADES
const DEFAULT_OPEN_TRADES = `
    <tr>
        <td><img src="https://flagcdn.com/w20/eu.png" style="width:14px; margin-right:5px; vertical-align:middle;"> EUR/USD</td>
        <td class="up"><i class="fa-solid fa-arrow-up"></i> Call</td>
        <td>$50</td>
        <td>1.09732</td>
        <td>1.09765</td>
        <td>82%</td>
        <td><span class="status">In Progress</span></td>
    </tr>
    <tr>
        <td><img src="https://flagcdn.com/w20/gb.png" style="width:14px; margin-right:5px; vertical-align:middle;"> GBP/USD</td>
        <td class="down"><i class="fa-solid fa-arrow-down"></i> Put</td>
        <td>$30</td>
        <td>1.27210</td>
        <td>1.27180</td>
        <td>82%</td>
        <td><span class="status">In Progress</span></td>
    </tr>
    <tr>
        <td><i class="fa-brands fa-bitcoin" style="color:#F7931A; margin-right:5px;"></i> BTC/USD</td>
        <td class="up"><i class="fa-solid fa-arrow-up"></i> Call</td>
        <td>$20</td>
        <td>67,450.00</td>
        <td>67,812.50</td>
        <td>78%</td>
        <td><span class="status">In Progress</span></td>
    </tr>
`;

// 4. CHART SETUP
const chartContainer = document.getElementById("tvChart");
let chart, candlestickSeries, lastCandle;

function initChart() {
    if (!chartContainer) return;
    
    // Ensure container has size before drawing
    const width = chartContainer.clientWidth || 500;
    const height = chartContainer.clientHeight || 400;

    chart = LightweightCharts.createChart(chartContainer, {
        width: width,
        height: height,
        layout: { background: { type: 'solid', color: '#131823' }, textColor: '#8B94A7' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.03)' }, horzLines: { color: 'rgba(255, 255, 255, 0.03)' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor: '#232A3B' },
        timeScale: { borderColor: '#232A3B', timeVisible: true },
    });

    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00C076', downColor: '#FF3B30', borderDownColor: '#FF3B30',
        borderUpColor: '#00C076', wickDownColor: '#FF3B30', wickUpColor: '#00C076',
    });

    updateChartData();
    
    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth, height: chartContainer.clientHeight });
    });
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
        data.push({ time: time, open: open, high: high, low: low, close: close });
        basePrice = close;
        time += 60; 
    }
    candlestickSeries.setData(data);
    lastCandle = { ...data[data.length - 1] };
}

// 5. BALANCE & RESET
function updateBalance(amount) {
    currentBalance += amount;
    if (balanceEl) {
        balanceEl.textContent = "$" + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        balanceEl.classList.remove("balance-flash");
        void balanceEl.offsetWidth; 
        balanceEl.classList.add("balance-flash");
    }
    saveState();
}

if (depositBtn) depositBtn.addEventListener("click", () => updateBalance(500));
if (resetBtn) resetBtn.addEventListener("click", () => {
    if (confirm("Reset balance and clear trades?")) {
        localStorage.removeItem("tradeproState");
        location.reload(); 
    }
});

// 6. TRADES
function addTrade(type) {
    if (!tradesBody) return;
    let amountText = amountInput ? amountInput.value : "$ 50";
    let amount = parseFloat(amountText.replace(/[^0-9.]/g, "")) || 50;
    const isCall = type === "call";
    
    const row = document.createElement("tr");
    row.className = "trade-row-new";
    
    let assetIcon = state.currentAsset === "BTC/USD" 
        ? `<i class="fa-brands fa-bitcoin" style="color:#F7931A; margin-right:5px;"></i>` 
        : `<img src="${state.currentFlag}" style="width:14px; margin-right:5px; vertical-align:middle;">`;

    row.innerHTML = `
        <td>${assetIcon} ${state.currentAsset}</td>
        <td class="${isCall ? 'up' : 'down'}"><i class="fa-solid fa-arrow-${isCall ? 'up' : 'down'}"></i> ${isCall ? 'Call' : 'Put'}</td>
        <td>$${amount}</td>
        <td>${(state.currentPrice - 0.0001).toFixed(4)}</td>
        <td class="live-price">${state.currentPrice.toFixed(2)}</td>
        <td>${state.currentPayout}%</td>
        <td><span class="status">In Progress</span></td>
    `;
    tradesBody.insertBefore(row, tradesBody.firstChild);
    setTimeout(() => row.classList.remove("trade-row-new"), 800);
    updateBalance(-amount);
}

if (btnCall) btnCall.addEventListener("click", () => addTrade("call"));
if (btnPut) btnPut.addEventListener("click", () => addTrade("put"));

// 7. LIVE PRICE
function tickPrice() {
    const volatility = state.currentAsset === "BTC/USD" ? 10 : 0.0001;
    state.currentPrice = Math.max(1.0, state.currentPrice + (Math.random() - 0.5) * volatility);

    if (priceMarker) priceMarker.textContent = state.currentPrice.toFixed(2);
    document.querySelectorAll(".live-price").forEach(c => c.textContent = state.currentPrice.toFixed(2));

    if (candlestickSeries && lastCandle) {
        lastCandle.close = state.currentPrice;
        if (state.currentPrice > lastCandle.high) lastCandle.high = state.currentPrice;
        if (state.currentPrice < lastCandle.low) lastCandle.low = state.currentPrice;
        candlestickSeries.update(lastCandle);
    }
}
setInterval(tickPrice, 2000);

// 8. AMOUNT CONTROLS
document.querySelectorAll(".trade-controls .input-group").forEach((group) => {
    const buttons = group.querySelectorAll("button");
    const input = group.querySelector("input");
    if (!input || buttons.length < 2 || !input.value.includes("$")) return;

    buttons[0].addEventListener("click", () => {
        let val = Math.max(10, (parseInt(input.value.replace(/[^0-9]/g, "")) || 0) - 10);
        input.value = "$ " + val;
        updatePayout();
    });
    buttons[1].addEventListener("click", () => {
        let val = Math.min(1000, (parseInt(input.value.replace(/[^0-9]/g, "")) || 0) + 10);
        input.value = "$ " + val;
        updatePayout();
    });
});

function updatePayout() {
    if (!amountInput) return;
    const amount = parseInt(amountInput.value.replace(/[^0-9]/g, "")) || 0;
    document.querySelector(".payout-info .amount").textContent = "+$" + (amount * state.currentPayout / 100).toFixed(2);
}
if (amountInput) amountInput.addEventListener("input", updatePayout);

// 9. CHAT & TABS (Condensed for speed)
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatLog = document.getElementById("chatLog");
const tabButtons = document.querySelectorAll(".tabs-header .tab-btn");

function sendChat() {
    if (!chatInput || !chatInput.value.trim()) return;
    const text = chatInput.value.trim().toLowerCase();
    
    // User bubble
    chatLog.innerHTML += `<div class="chat-message user"><span class="chat-avatar">👤</span><div class="chat-text">${chatInput.value}</div></div>`;
    chatInput.value = "";
    
    // Bot reply
    setTimeout(() => {
        let reply = "Try asking to analyze EUR/USD or type help.";
        if (text.includes("eur")) reply = "📊 EUR/USD — Bullish bias. Entry: 1.09732. Win rate: 82%.";
        if (text.includes("gbp")) reply = "📊 GBP/USD — Bearish setup. Entry: 1.27210. Win rate: 82%.";
        if (text.includes("help")) reply = "I can analyze pairs, give win rates, or suggest trades.";
        chatLog.innerHTML += `<div class="chat-message bot"><span class="chat-avatar">🤖</span><div class="chat-text">${reply}</div></div>`;
        chatLog.scrollTop = chatLog.scrollHeight;
    }, 800);
}
if (chatSend) chatSend.addEventListener("click", sendChat);
if (chatInput) chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(); });

// 10. ASSET SWITCHING
const ASSET_DATA = {
    "EUR/USD": { flag: "https://flagcdn.com/w20/eu.png", winRate: "82%", signal: "CALL", signalIcon: "fa-arrow-up", entry: "1.09732", basePrice: 1.09732, payout: 82 },
    "GBP/USD": { flag: "https://flagcdn.com/w20/gb.png", winRate: "82%", signal: "PUT", signalIcon: "fa-arrow-down", entry: "1.27210", basePrice: 1.27210, payout: 82 },
    "BTC/USD": { flag: null, winRate: "78%", signal: "CALL", signalIcon: "fa-arrow-up", entry: "67,450.00", basePrice: 67450.00, payout: 78 }
};

function switchAsset(assetName) {
    const data = ASSET_DATA[assetName];
    if (!data) return;
    state.currentAsset = assetName;
    state.currentPrice = data.basePrice;
    state.currentPayout = data.payout;
    
    document.querySelectorAll(".asset-tab").forEach(t => t.classList.toggle("active", t.dataset.asset === assetName));
    document.querySelector(".chart-header h2").innerHTML = `${assetName} <i class="fa-solid fa-chevron-down" style="font-size:12px;"></i>`;
    document.querySelector(".signal-direction").innerHTML = `<i class="fa-solid ${data.signalIcon}"></i> ${data.signal}`;
    
    updateChartData();
}

document.querySelectorAll(".asset-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
        if (e.target.closest(".tab-close")) return;
        if (tab.dataset.asset) switchAsset(tab.dataset.asset);
    });
});

// 11. INIT
window.addEventListener("load", () => {
    if (balanceEl && currentBalance !== 1000.00) balanceEl.textContent = "$" + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    tradesBody.innerHTML = (parsedData && parsedData.trades) ? parsedData.trades : DEFAULT_OPEN_TRADES;
    setTimeout(() => {
        chatLog.innerHTML = `<div class="chat-message bot"><span class="chat-avatar">🤖</span><div class="chat-text">Hi! Ask me to <em>analyze EUR/USD</em>.</div></div>`;
    }, 400);
    setTimeout(initChart, 250); // Give flexbox time to paint
});