const state = { asset: "EUR/USD", price: 1.09732, payout: 82 };
let chart, candleSeries, lastCandle;

// Initialize Chart
function initChart() {
    const container = document.getElementById('tvChart');
    if (!container) return;
    
    chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: { background: { type: 'solid', color: '#131823' }, textColor: '#8B94A7' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        rightPriceScale: { borderColor: '#232A3B' },
        timeScale: { borderColor: '#232A3B', timeVisible: true },
    });
    
    candleSeries = chart.addCandlestickSeries({ upColor: '#00C076', downColor: '#FF3B30', borderDownColor: '#FF3B30', borderUpColor: '#00C076', wickDownColor: '#FF3B30', wickUpColor: '#00C076' });
    updateChart();
}

function updateChart() {
    if (!candleSeries) return;
    const data = [];
    let base = state.price;
    let time = Math.floor(Date.now() / 1000) - (50 * 60);
    
    for (let i = 0; i < 50; i++) {
        const open = base;
        const close = open + (Math.random() - 0.5) * 0.002;
        const high = Math.max(open, close) + Math.random() * 0.001;
        const low = Math.min(open, close) - Math.random() * 0.001;
        data.push({ time: time, open, high, low, close });
        base = close; time += 60;
    }
    candleSeries.setData(data);
    lastCandle = { ...data[data.length - 1] };
}

// Start Chart & Interval
window.onload = () => {
    setTimeout(initChart, 100);
    setInterval(() => {
        if (!candleSeries || !lastCandle) return;
        state.price = Math.max(1.0, state.price + (Math.random() - 0.5) * 0.0001);
        lastCandle.close = state.price;
        if (state.price > lastCandle.high) lastCandle.high = state.price;
        if (state.price < lastCandle.low) lastCandle.low = state.price;
        candleSeries.update(lastCandle);
    }, 2000);
};

// Basic Buttons
document.getElementById('btnDeposit')?.addEventListener('click', () => alert('Deposit clicked'));
document.getElementById('btnCall')?.addEventListener('click', () => alert('Call Trade Placed'));
document.getElementById('btnPut')?.addEventListener('click', () => alert('Put Trade Placed'));