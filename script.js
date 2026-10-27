// ========================================
// TradePro Dashboard — Main Script
// ========================================

// ================================
// 1. DOM ELEMENTS
// ================================
const btnCall = document.getElementById("btnCall");
const btnPut = document.getElementById("btnPut");
const tradesBody = document.getElementById("tradesBody");
const amountInput = document.querySelector(".trade-controls .input-group input");
const priceMarker = document.querySelector(".price-marker");
const tableHead = document.getElementById("tableHead");

// ================================
// 2. STATE & STORAGE
// ================================
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

// ================================
// 3. DEFAULT TRADES DATA
// ================================
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

// ================================
// 4. REAL TRADINGVIEW CHART
// ================================
const chartContainer = document.getElementById("tvChart");
let chart, candlestickSeries, lastCandle;

function initChart() {
    if (!chartContainer) return;

    const width = chartContainer.clientWidth || 600;
    const height = chartContainer.clientHeight || 450;

    chart = LightweightCharts.createChart(chartContainer, {
        width: width,
        height: height,
        layout: { 
            background: { type: 'solid', color: '#131823' }, // Solid background!
            textColor: '#8B94A7' 
        },
        grid: { 
            vertLines: { color: 'rgba(255, 255, 255, 0.03)' }, 
            horzLines: { color: 'rgba(255, 255, 255, 0.03)' } 
        },
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

// ================================
// 5. BALANCE & RESET
// ================================
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

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset your balance and clear all trades?")) {
            localStorage.removeItem("tradeproState");
            location.reload(); 
        }
    });
}

// ================================
// 6. TRADE BUTTONS
// ================================
function addTrade(type) {
    if (!tradesBody) return;

    let amountText = amountInput ? amountInput.value : "$ 50";
    let amount = parseFloat(amountText.replace(/[^0-9.]/g, "")) || 50;

    const isCall = type === "call";
    const typeClass = isCall ? "up" : "down";
    const typeIcon = isCall ? "fa-arrow-up" : "fa-arrow-down";
    const typeLabel = isCall ? "Call" : "Put";

    const currentPrice = state.currentPrice;
    const openPrice = state.currentAsset === "BTC/USD" 
        ? (currentPrice - 10).toFixed(2) 
        : (currentPrice - 0.00015).toFixed(5);

    const row = document.createElement("tr");
    row.className = "trade-row-new";
    
    let assetIcon = `<img src="${state.currentFlag}" style="width:14px; margin-right:5px; vertical-align:middle;">`;
    if (state.currentAsset === "BTC/USD") assetIcon = `<i class="fa-brands fa-bitcoin" style="color:#F7931A; margin-right:5px;"></i>`;
    if (state.currentAsset === "XAU/USD") assetIcon = `<i class="fa-solid fa-coins" style="color:#FFD700; margin-right:5px;"></i>`;

    row.innerHTML = `
        <td>${assetIcon} ${state.currentAsset}</td>
        <td class="${typeClass}"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</td>
        <td>$${amount}</td>
        <td>${openPrice}</td>
        <td class="live-price">${currentPrice.toFixed(2)}</td>
        <td>${state.currentPayout}%</td>
        <td><span class="status">In Progress</span></td>
    `;
    tradesBody.insertBefore(row, tradesBody.firstChild);
    setTimeout(() => row.classList.remove("trade-row-new"), 800);
    
    updateBalance(-amount);
}

if (btnCall) btnCall.addEventListener("click", () => addTrade("call"));
if (btnPut) btnPut.addEventListener("click", () => addTrade("put"));

// ================================
// 7. LIVE PRICE SIMULATION
// ================================
function tickPrice() {
    const volatility = state.currentAsset === "BTC/USD" ? 10 : 0.0001;
    const delta = (Math.random() - 0.5) * volatility;
    state.currentPrice = Math.max(1.0, state.currentPrice + delta);

    if (priceMarker) priceMarker.textContent = state.currentPrice.toFixed(2);

    document.querySelectorAll(".live-price").forEach((cell) => {
        cell.textContent = state.currentPrice.toFixed(2);
    });

    if (candlestickSeries && lastCandle) {
        lastCandle.close = state.currentPrice;
        if (state.currentPrice > lastCandle.high) lastCandle.high = state.currentPrice;
        if (state.currentPrice < lastCandle.low) lastCandle.low = state.currentPrice;
        candlestickSeries.update(lastCandle);
    }
}
setInterval(tickPrice, 2000);

// ================================
// 8. AMOUNT CONTROLS
// ================================
document.querySelectorAll(".trade-controls .input-group").forEach((group) => {
    const buttons = group.querySelectorAll("button");
    const input = group.querySelector("input");
    if (!input || buttons.length < 2) return;
    if (!input.value.includes("$")) return;

    buttons[0].addEventListener("click", () => {
        let val = parseInt(input.value.replace(/[^0-9]/g, "")) || 0;
        val = Math.max(10, val - 10);
        input.value = "$ " + val;
        updatePayout();
    });
    buttons[1].addEventListener("click", () => {
        let val = parseInt(input.value.replace(/[^0-9]/g, "")) || 0;
        val = Math.min(1000, val + 10);
        input.value = "$ " + val;
        updatePayout();
    });
});

function updatePayout() {
    if (!amountInput) return;
    const amount = parseInt(amountInput.value.replace(/[^0-9]/g, "")) || 0;
    const payout = (amount * state.currentPayout / 100).toFixed(2);
    const payoutAmount = document.querySelector(".payout-info .amount");
    if (payoutAmount) payoutAmount.textContent = "+$" + payout;
}
if (amountInput) amountInput.addEventListener("input", updatePayout);

// ================================
// 9. AI CHAT BOT
// ================================
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatLog = document.getElementById("chatLog");

function generateBotReply(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    if (/^(hi|hello|hey|yo)\b/.test(msg)) return "Hello! I'm your AI trading assistant. Ask me to analyze EUR/USD, suggest a trade, or explain the current signal.";
    if (msg.includes("eur")) return "📊 <strong>EUR/USD (5m)</strong> — Bullish bias.<br>Entry: 1.09732<br>Target: 1.09810<br>Stop: 1.09670<br>Win rate: 82%.";
    if (msg.includes("gbp")) return "📊 <strong>GBP/USD (5m)</strong> — Bearish setup forming.<br>Entry: 1.27210<br>Target: 1.27050<br>Stop: 1.27320<br>Win rate: 82%.";
    if (msg.includes("btc") || msg.includes("bitcoin")) return "📊 <strong>BTC/USD (5m)</strong> — Consolidating near 67,450.<br>Target: 67,812<br>Win rate: 78%.";
    if (msg.includes("xau") || msg.includes("gold")) return "📊 <strong>XAU/USD (5m)</strong> — Weak momentum.<br>Target: 2,318.50<br>Win rate: 80%.";
    if (msg.includes("jpy")) return "📊 <strong>USD/JPY (5m)</strong> — Neutral-bullish.<br>Entry: 149.85<br>Target: 150.12<br>Win rate: 79%.";
    if (msg.includes("call") || msg.includes("buy") || msg.includes("put") || msg.includes("sell")) return "🤖 Recommendation: <strong>CALL</strong> on EUR/USD (5m).<br>Confidence: 82%.<br>Price above 50 EMA, RSI at 62.";
    if (msg.includes("win")) return "📈 Current win rate on EUR/USD (5m) is <strong>82%</strong> over the last 100 signals.";
    if (msg.includes("time") || msg.includes("duration") || msg.includes("expiry")) return "⏱ I recommend a <strong>5-minute expiry</strong> for EUR/USD.";
    if (msg.includes("trend") || msg.includes("analyze") || msg.includes("analysis") || msg.includes("market")) return "📉 <strong>Market:</strong><br>• EUR/USD: bullish (82%)<br>• GBP/USD: bearish (82%)<br>• BTC/USD: neutral (78%)<br>• XAU/USD: bearish (80%)<br>• USD/JPY: bullish (79%)";
    if (msg.includes("risk")) return "⚠️ Risk no more than <strong>2–3% of your balance</strong> per trade. With $1,000, that's $20–$30 per trade.";
    if (msg.includes("help") || msg.includes("what can you")) return "I can help with:<br>• <em>\"analyze EUR/USD\"</em><br>• <em>\"should I call or put?\"</em><br>• Win rates, expiry times, risk tips.";
    return "I'm not sure. Try <em>analyze EUR/USD</em>, <em>suggest a trade</em>, or type <em>help</em>.";
}

function appendMessage(text, sender = "bot") {
    if (!chatLog) return;
    const bubble = document.createElement("div");
    bubble.className = "chat-message " + sender;
    const avatar = sender === "user" ? "👤" : "🤖";
    bubble.innerHTML = `<span class="chat-avatar">${avatar}</span><div class="chat-text">${text}</div>`;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function showTyping() {
    if (!chatLog) return null;
    const typing = document.createElement("div");
    typing.className = "chat-message bot typing";
    typing.innerHTML = `<span class="chat-avatar">🤖</span><div class="chat-text"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    chatLog.appendChild(typing);
    chatLog.scrollTop = chatLog.scrollHeight;
    return typing;
}

function sendChat() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    chatInput.value = "";
    const typing = showTyping();
    setTimeout(() => {
        if (typing) typing.remove();
        appendMessage(generateBotReply(text), "bot");
    }, 1000);
}

if (chatSend) chatSend.addEventListener("click", sendChat);
if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); sendChat(); }
    });
}

// ================================
// 10. BOTTOM TABS
// ================================
const tabButtons = document.querySelectorAll(".tabs-header .tab-btn");

const TAB_CONTENT = {
    open: { headers: ["Asset", "Type", "Amount", "Open Price", "Current Price", "Payout", "Status"], rows: [] },
    history: {
        headers: ["Asset", "Type", "Amount", "Result", "P/L", "Date"],
        rows: [
            { asset: "EUR/USD", flag: "https://flagcdn.com/w20/eu.png", type: "Call", typeClass: "up", typeIcon: "fa-arrow-up", amount: "$50", result: "WIN", resultClass: "status status-win", pl: "+$41.00", plClass: "up", date: "Oct 16, 14:32" },
            { asset: "GBP/USD", flag: "https://flagcdn.com/w20/gb.png", type: "Put", typeClass: "down", typeIcon: "fa-arrow-down", amount: "$30", result: "LOSS", resultClass: "status status-loss", pl: "-$30.00", plClass: "down", date: "Oct 16, 14:18" },
            { asset: "BTC/USD", flag: "", icon: "fa-brands fa-bitcoin", iconColor: "#F7931A", type: "Call", typeClass: "up", typeIcon: "fa-arrow-up", amount: "$20", result: "WIN", resultClass: "status status-win", pl: "+$15.60", plClass: "up", date: "Oct 16, 13:55" },
            { asset: "XAU/USD", flag: "", icon: "fa-solid fa-coins", iconColor: "#FFD700", type: "Put", typeClass: "down", typeIcon: "fa-arrow-down", amount: "$25", result: "WIN", resultClass: "status status-win", pl: "+$20.00", plClass: "up", date: "Oct 16, 13:40" },
            { asset: "EUR/USD", flag: "https://flagcdn.com/w20/eu.png", type: "Put", typeClass: "down", typeIcon: "fa-arrow-down", amount: "$40", result: "LOSS", resultClass: "status status-loss", pl: "-$40.00", plClass: "down", date: "Oct 16, 13:12" }
        ]
    },
    signals: {
        headers: ["Asset", "Direction", "Win Rate", "Time", "Expiry"],
        rows: [
            { asset: "EUR/USD", flag: "https://flagcdn.com/w20/eu.png", direction: "CALL", dirClass: "up", typeIcon: "fa-arrow-up", payout: "82%", time: "16:32", status: "5 min" },
            { asset: "GBP/USD", flag: "https://flagcdn.com/w20/gb.png", direction: "PUT", dirClass: "down", typeIcon: "fa-arrow-down", payout: "82%", time: "16:21", status: "5 min" },
            { asset: "BTC/USD", flag: "", icon: "fa-brands fa-bitcoin", iconColor: "#F7931A", direction: "CALL", dirClass: "up", typeIcon: "fa-arrow-up", payout: "78%", time: "16:14", status: "5 min" },
            { asset: "XAU/USD", flag: "", icon: "fa-solid fa-coins", iconColor: "#FFD700", direction: "PUT", dirClass: "down", typeIcon: "fa-arrow-down", payout: "80%", time: "16:03", status: "5 min" }
        ]
    }
};

function assetCell(item) {
    if (item.flag) return `<img src="${item.flag}" style="width:14px; margin-right:5px; vertical-align:middle;"> ${item.asset}`;
    const color = item.iconColor || "#FFF";
    return `<i class="${item.icon}" style="color:${color}; margin-right:5px;"></i> ${item.asset}`;
}

function renderTab(tabName) {
    if (!tableHead || !tradesBody) return;
    tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabName));

    if (tabName === "open") {
        const headRow = tableHead.querySelector("tr");
        headRow.innerHTML = TAB_CONTENT.open.headers.map(h => `<th>${h}</th>`).join("");
        tradesBody.innerHTML = savedData && parsedData.trades ? parsedData.trades : DEFAULT_OPEN_TRADES;
        return;
    }

    const content = TAB_CONTENT[tabName];
    const headRow = tableHead.querySelector("tr");
    headRow.innerHTML = content.headers.map(h => `<th>${h}</th>`).join("");
    tradesBody.innerHTML = "";

    content.rows.forEach((r) => {
        let rowHtml = tabName === "history" 
            ? `<tr><td>${assetCell(r)}</td><td class="${r.typeClass}"><i class="fa-solid ${r.typeIcon}"></i> ${r.type}</td><td>${r.amount}</td><td><span class="${r.resultClass}">${r.result}</span></td><td class="${r.plClass}">${r.pl}</td><td>${r.date}</td></tr>`
            : `<tr><td>${assetCell(r)}</td><td class="${r.dirClass}"><i class="fa-solid ${r.typeIcon}"></i> ${r.direction}</td><td>${r.payout}</td><td>${r.time}</td><td>${r.status}</td></tr>`;
        
        const tr = document.createElement("tr");
        tr.innerHTML = rowHtml.trim();
        tradesBody.appendChild(tr);
    });
}
tabButtons.forEach((btn) => btn.addEventListener("click", () => renderTab(btn.dataset.tab)));

// ================================
// 11. ASSET TABS
// ================================
const ASSET_DATA = {
    "EUR/USD": { flag: "https://flagcdn.com/w20/eu.png", icon: null, winRate: "82%", signal: "CALL", signalIcon: "fa-arrow-up", entry: "1.09732", target: "1.09810", stop: "1.09670", basePrice: 1.09732, payout: 82 },
    "GBP/USD": { flag: "https://flagcdn.com/w20/gb.png", icon: null, winRate: "82%", signal: "PUT", signalIcon: "fa-arrow-down", entry: "1.27210", target: "1.27050", stop: "1.27320", basePrice: 1.27210, payout: 82 },
    "BTC/USD": { flag: null, icon: "fa-brands fa-bitcoin", iconColor: "#F7931A", winRate: "78%", signal: "CALL", signalIcon: "fa-arrow-up", entry: "67,450.00", target: "67,812.50", stop: "67,200.00", basePrice: 67450.00, payout: 78 },
    "XAU/USD": { flag: null, icon: "fa-solid fa-coins", iconColor: "#FFD700", winRate: "80%", signal: "PUT", signalIcon: "fa-arrow-down", entry: "2,318.50", target: "2,305.00", stop: "2,325.00", basePrice: 2318.50, payout: 80 },
    "USD/JPY": { flag: "https://flagcdn.com/w20/us.png", icon: null, winRate: "79%", signal: "CALL", signalIcon: "fa-arrow-up", entry: "149.85", target: "150.12", stop: "149.60", basePrice: 149.85, payout: 79 }
};

function switchAsset(assetName) {
    const data = ASSET_DATA[assetName];
    if (!data) return;

    state.currentAsset = assetName;
    state.currentFlag = data.flag || "";
    state.currentPrice = data.basePrice;
    state.currentPayout = data.payout;

    document.querySelectorAll(".asset-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.asset === assetName));

    const chartInfo = document.querySelector(".chart-header .chart-info");
    if (chartInfo) {
        const h2 = chartInfo.querySelector("h2");
        const badge = chartInfo.querySelector(".badge-green");
        const oldFlag = chartInfo.querySelector(".asset-flag");
        const oldIcon = chartInfo.querySelector(".fa-brands, .fa-solid.fa-coins");
        if (oldFlag) oldFlag.remove();
        if (oldIcon) oldIcon.remove();
        if (data.flag) {
            const img = document.createElement("img"); img.src = data.flag; img.className = "asset-flag"; img.alt = assetName;
            chartInfo.insertBefore(img, h2);
        } else if (data.icon) {
            const i = document.createElement("i"); i.className = data.icon; i.style.color = data.iconColor || "#FFF"; i.style.fontSize = "16px";
            chartInfo.insertBefore(i, h2);
        }
        if (h2) h2.innerHTML = `${assetName} <i class="fa-solid fa-chevron-down" style="font-size:12px;"></i>`;
        if (badge) badge.textContent = data.winRate;
    }

    const bubble = document.querySelector(".signal-bubble");
    if (bubble) bubble.innerHTML = `<i class="fa-solid fa-robot"></i> AI Signal<br>${data.signal}`;

    const signalDir = document.querySelector(".signal-direction");
    if (signalDir) {
        signalDir.style.color = data.signal === "CALL" ? "var(--accent-green)" : "var(--accent-red)";
        signalDir.innerHTML = `<i class="fa-solid ${data.signalIcon}"></i> ${data.signal}`;
    }

    const winBadge = document.querySelector(".signal-details .badge-green");
    if (winBadge) winBadge.textContent = `${data.winRate} Win Rate`;

    const metaValues = document.querySelectorAll(".signal-meta span:nth-child(2)");
    if (metaValues.length >= 3) {
        metaValues[0].textContent = data.entry;
        metaValues[1].textContent = data.target;
        metaValues[2].textContent = data.stop;
    }

    const payoutPercent = document.querySelector(".payout-info .percent");
    if (payoutPercent) payoutPercent.textContent = data.winRate;
    if (priceMarker) priceMarker.textContent = data.basePrice.toFixed(2);

    updateChartData();
}

document.querySelectorAll(".asset-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
        if (e.target.closest(".tab-close")) return;
        const asset = tab.dataset.asset;
        if (asset) switchAsset(asset);
    });
});

// ================================
// 12. INITIALIZATION
// ================================
window.addEventListener("load", () => {
    if (balanceEl && currentBalance !== 1000.00) {
        balanceEl.textContent = "$" + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if (parsedData && parsedData.trades && tradesBody) {
        tradesBody.innerHTML = parsedData.trades;
    } else if (tradesBody) {
        tradesBody.innerHTML = DEFAULT_OPEN_TRADES;
    }

    setTimeout(() => {
        appendMessage("Hi! I'm your AI trading assistant. Ask me to <em>analyze EUR/USD</em>, or type <em>help</em>.", "bot");
    }, 400);

    setTimeout(initChart, 200);
});