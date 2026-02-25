console.log("crypto hacker loaded");

const form = document.getElementById("searchForm");
const input = document.getElementById("queryInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

const LAST_COIN_KEY = "lastCoinQuery";

function setStatus(message) {
    statusEl.textContent - message;
}

function formatGBP(value) {
    if (typeof value !== "number") return "-";
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2,
    }).format(value);
}

function formatNumber(value) {
    if (typeof value !== "number") return"-";
    return new Intl.NumberFormat("en-GBP").format(value);
}

function renderCoin(coin) {
    const price = coin.market_data?.current_price?.gbp;
    const change24h = coin.market_data?.price_change_percentage_24h;
    const marketCap = coin.market_data?.market_cap?.gbp;

    resultEl.innerHTML = `
        <div class="card">
          <h2>${coin.name} (${coin.symbol.toUpperCase()})</h2>

          <div class="row">
            <div class="label">Current price (GBP)</div>
            <div>${formatGBP(price)}</div>
        </div>

        <div class="row">
          <div class="label">24h change</div>
          <div>${typeof change24h === "number" ? change24h.toFixed(2) + "%" : "-"}</div>
        </div>

        <div class="row">
          <div class="label">Homepage</div>
          <div>${
            coin.links?.homepage?.[0]
            ? `<a href="${coin.links.homepage[0]}" target="_blank" rel="noreferrer">Open</a>`
            : "-"
          }</div>
        </div>
     </div>
 `;
}

async function fetchCoinById(id) {
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id
    )}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Coin fetch failed (${res.status})`);
    }
    return await res.json();
}

async function searchCoin(query) {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url);
  if(!res.ok) throw new Error(`search failed(${res.status})`);
  const data = await res.json();

  const first = data.coins?.[0];
  if (!first) return null;

  return first.id;
}

async function runSearch(query) {
    resultEl.innerHTML = "";
    setStatus("searching...");

    try {
        const id = await searchCoin(query);

        if (!id) {
            setStatus("No results found. Try 'bitcoin' or 'ethereum'.");
            return;      
        }

        setStatus("Loading coin data...");
        const coin = await fetchCoinById(id);

        localStorage.setItem(LAST_COIN_KEY, query);

        setStatus("");
        renderCoin(coin);
    }   catch (err) {
        console.error(err);
        setStatus("Something went wrong. Check the console and try again.");
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    runSearch(q);
});

//  Load last searched coin on startup
const last = localStorage.getItem(LAST_COIN_KEY);
if (last) {
    input.value = last;
    runSearch(last);
}