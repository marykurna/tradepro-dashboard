// ========================================
// TradePro Dashboard — Custom Canvas Chart
// ========================================

const state = { asset: "EUR/USD", price:1.09732, payout: 82 };
let canvas, ctx, chartData = [];

// 1. Generate initial chart data
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

// 2. Draw the chart on the HTML5 Canvas
function drawChart() {
    if (!canvas || !ctx) return;

    // Handle high-DPI screens (Retina)
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
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Find min/max for scaling
    let min = Infinity, max = -Infinity;
    chartData.forEach(c => {
        if (c.high > max) max = c.high;
        if (c.low < min) min = c.low;
    });
    
    const padding = (max - min) * 0.1;
    min -= padding;
    max += padding;
    
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

        // Draw Wick
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Draw Body
        const bodyWidth = candleWidth * 0.6;
        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);
        ctx.fillRect(x - bodyWidth / 2, Math.min(yOpen, yClose), bodyWidth, bodyHeight);
    });
}

// 3. Initialize and handle resizing
function initCustomChart() {
    canvas = document.getElementById('tvChart');
    // Create canvas element inside the container
    canvas.innerHTML = '<canvas style="width: 100%; height: 100%;"></canvas>';
    ctx = canvas.querySelector('canvas').getContext('2d');
    
    generateChartData();
    drawChart();
    
    window.addEventListener('resize', drawChart);
}

// 4. Live tick simulation
function tick() {
    if (chartData.length === 0) return;
    
    // Update the last candle
    state.price = Math.max(1.0, state.price + (Math.random() - 0.5) * 0.0001);
    const last = chartData[chartData.length - 1];
    last.close = state.price;
    if (state.price > last.high) last.high = state.price;
    if (state.price < last.low) last.low = state.price;
    
    // Update the price marker text
    const marker = document.querySelector('.price-marker');
    if (marker) marker.textContent = state.price.toFixed(2);
    
    drawChart();
}

// 5. Trade Buttons & Deposit
document.getElementById('btnDeposit')?.addEventListener('click', () => {
    const bal = document.getElementById('accountBalance');
    if (bal) bal.textContent = "$1,500.00";
});

document.getElementById('btnCall')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td>EUR/USD</td><td style="color:#00C076">Call</td><td>$50</td><td>${state.price.toFixed(4)}</td><td class="live-price">${state.price.toFixed(4)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
    }
});

document.getElementById('btnPut')?.addEventListener('click', () => {
    const tbody = document.getElementById('tradesBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td>EUR/USD</td><td style="color:#FF3B30">Put</td><td>$50</td><td>${state.price.toFixed(4)}</td><td class="live-price">${state.price.toFixed(4)}</td><td><span style="color:#00C076">In Progress</span></td></tr>` + tbody.innerHTML;
    }
});

// 6. Initialize on load
window.addEventListener('load', () => {
    setTimeout(initCustomChart, 200);
    setInterval(tick, 2000);
});