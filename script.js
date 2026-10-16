// ========================================
// TradePro Dashboard — Main Script
// ========================================

console.log("✅ TradePro Dashboard loaded");

// ================================
// 1. State
// ================================
const state = {
    currentAsset: "EUR/USD",
    currentFlag: "https://flagcdn.com/w20/eu.png",
    currentPrice: 1.09732,
    currentAmount: 50,
    currentPayout: 82,
    currentType: "call",
};

// ================================
// 2. DOM elements
// ================================
const btnCall = document.getElementById("btnCall");
const btnPut = document.getElementById("btnPut");
const tradesBody = document.getElementById("tradesBody");
const amountInput = document.querySelector(".trade-controls .input-group input");
const priceMarker = document.querySelector(".price-marker");

// ================================
// 3. Add a trade row
// ================================
function addTrade(type) {
    if (!tradesBody) return;

    let amountText = amountInput ? amountInput.value : "$ 50";
    let amount = amountText.replace(/[^0-9.]/g, "");
    if (!amount) amount = "50";

    const isCall = type === "call";
    const typeClass = isCall ? "up" : "down";
    const typeIcon = isCall ? "fa-arrow-up" : "fa-arrow-down";
    const typeLabel = isCall ? "Call" : "Put";

    const currentPrice = state.currentPrice;
    const openPrice = (currentPrice - 0.00015).toFixed(5);

    const row = document.createElement("tr");
    row.className = "trade-row-new";
    row.innerHTML = `
        <td><img src="${state.currentFlag}" style="width:14px; margin-right:5px; vertical-align:middle;"> ${state.currentAsset}</td>
        <td class="${typeClass}"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</td>
        <td>$${amount}</td>
        <td>${openPrice}</td>
        <td class="live-price">${currentPrice.toFixed(5)}</td>
        <td>${state.currentPayout}%</td>
        <td><span class="status">In Progress</span></td>
    `;
    tradesBody.insertBefore(row, tradesBody.firstChild);
    setTimeout(() => row.classList.remove("trade-row-new"), 800);
    row.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

if (btnCall) btnCall.addEventListener("click", () => addTrade("call"));
if (btnPut) btnPut.addEventListener("click", () => addTrade("put"));

// ================================
// 4. Live price simulation
// ================================
function tickPrice() {
    const delta = (Math.random() - 0.5) * 0.0001;
    state.currentPrice = Math.max(1.0, state.currentPrice + delta);

    if (priceMarker) priceMarker.textContent = state.currentPrice.toFixed(5);

    document.querySelectorAll(".live-price").forEach((cell) => {
        cell.textContent = state.currentPrice.toFixed(5);
    });
}
setInterval(tickPrice, 2000);

// ================================
// 5. Amount +/- buttons
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

// ================================
// 6. Payout display
// ================================
function updatePayout() {
    if (!amountInput) return;
    const amount = parseInt(amountInput.value.replace(/[^0-9]/g, "")) || 0;
    const payout = (amount * state.currentPayout / 100).toFixed(2);
    const payoutAmount = document.querySelector(".payout-info .amount");
    if (payoutAmount) payoutAmount.textContent = "+$" + payout;
}
if (amountInput) amountInput.addEventListener("input", updatePayout);

// ================================
// 7. AI CHAT BOT
// ================================
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatLog = document.getElementById("chatLog");

function generateBotReply(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    if (/^(hi|hello|hey|yo)\b/.test(msg)) {
        return "Hello! I'm your AI trading assistant. Ask me to analyze EUR/USD, suggest a trade, or explain the current signal.";
    }
    if (msg.includes("eur")) {
        return "📊 <strong>EUR/USD (5m)</strong> — Bullish bias.<br>Entry: 1.09732<br>Target: 1.09810<br>Stop: 1.09670<br>Win rate: 82%.";
    }
    if (msg.includes("gbp")) {
        return "📊 <strong>GBP/USD (5m)</strong> — Bearish setup forming.<br>Entry: 1.27210<br>Target: 1.27050<br>Stop: 1.27320<br>Win rate: 82%.";
    }
    if (msg.includes("btc") || msg.includes("bitcoin")) {
        return "📊 <strong>BTC/USD (5m)</strong> — Consolidating near 67,450.<br>Target: 67,812<br>Win rate: 78%.";
    }
    if (msg.includes("xau") || msg.includes("gold")) {
        return "📊 <strong>XAU/USD (5m)</strong> — Weak momentum.<br>Target: 2,318.50<br>Win rate: 80%.";
    }
    if (msg.includes("jpy")) {
        return "📊 <strong>USD/JPY (5m)</strong> — Neutral-bullish.<br>Entry: 149.85<br>Target: 150.12<br>Win rate: 79%.";
    }
    if (msg.includes("call") || msg.includes("buy") || msg.includes("put") || msg.includes("sell")) {
        return "🤖 Recommendation: <strong>CALL</strong> on EUR/USD (5m).<br>Confidence: 82%.<br>Price above 50 EMA, RSI at 62.";
    }
    if (msg.includes("win")) {
        return "📈 Current win rate on EUR/USD (5m) is <strong>82%</strong> over the last 100 signals.";
    }
    if (msg.includes("time") || msg.includes("duration") || msg.includes("expiry")) {
        return "⏱ I recommend a <strong>5-minute expiry</strong> for EUR/USD.";
    }
    if (msg.includes("trend") || msg.includes("analyze") || msg.includes("analysis") || msg.includes("market")) {
        return "📉 <strong>Market:</strong><br>• EUR/USD: bullish (82%)<br>• GBP/USD: bearish (82%)<br>• BTC/USD: neutral (78%)<br>• XAU/USD: bearish (80%)<br>• USD/JPY: bullish (79%)";
    }
    if (msg.includes("risk")) {
        return "⚠️ Risk no more than <strong>2–3% of your balance</strong> per trade. With $1,000, that's $20–$30 per trade.";
    }
    if (msg.includes("help") || msg.includes("what can you")) {
        return "I can help with:<br>• <em>\"analyze EUR/USD\"</em><br>• <em>\"should I call or put?\"</em><br>• Win rates, expiry times, risk tips.";
    }
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
        if (e.key === "Enter") {
            e.preventDefault();
            sendChat();
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        appendMessage("Hi! I'm your AI trading assistant. Ask me to <em>analyze EUR/USD</em>, or type <em>help</em>.", "bot");
    }, 400);
});

console.log("🎯 Script initialized with all features");