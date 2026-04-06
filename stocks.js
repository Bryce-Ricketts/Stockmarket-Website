const apiKey = "";
const apiURL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`;

const searchInput = document.querySelector("#stock-search");
const searchButton = document.querySelector("#search-button");
const resultDiv = document.querySelector("#result");

searchButton.addEventListener("click", handleSearch);

async function handleSearch() {
  const symbol = searchInput.value.trim();
  localStorage.setItem("lastStock", symbol);

  if (!symbol) {
    resultDiv.textContent = "Please enter a stock symbol";
    return;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const quote = data["Global Quote"];

    localStorage.setItem("lastTradingDay", quote["07. latest trading day"]);

    if (!quote || !quote["05. price"]) {
      resultDiv.textContent =
        "Stock data is currently unavailable. Try again later.";
      return;
    }

    resultDiv.innerHTML = `
            <h2>${symbol.toUpperCase()}</h2>
            <p>Price: ${quote["05. price"]}</p>
            <p>Open: ${quote["02. open"]}</p>
            <p>High: ${quote["03. high"]}</p>
            <p>Low: ${quote["04. low"]}</p>
            <button id="add-to-watchlist">Watch this stock</button>
        `;

    document
      .getElementById("add-to-watchlist")
      .addEventListener("click", () =>
        addToWatchlist(symbol, quote["05. price"]),
      );
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }

  lastDateUpdated();
}

function searchStock(symbol) {
  searchInput.value = symbol;
  handleSearch();
}

function addToWatchlist(symbol, price) {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (!watchlist.find((item) => item.symbol === symbol)) {
    watchlist.push({ symbol, price });
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert(symbol + " added to watchlist");
    loadWatchlist();
  } else {
    alert("Already in watchlist");
  }
}

function loadWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  const watchlistDiv = document.getElementById("watchlist-section");

  watchlistDiv.innerHTML = "<h3>Watchlist</h3>";

  watchlist.forEach((stock) => {
    watchlistDiv.innerHTML += `<div class="watchlist-item">
        <span class="stock-name" onclick="searchStock('${stock.symbol}')">
            ${stock.symbol}
        </span>
        <p>$${stock.price}</p>
           <input class="count-bar"  
      type="number" 
      min="1" 
      value="1"
      id="shares-${stock.symbol}"
    />

    <button class="addPort" onclick="addToPortfolio('${stock.symbol}', ${stock.price})">
      +
    </button>
        <button class="remove-btn" onclick="removeFromWatchlist('${stock.symbol}')">
            -
        </button>
    </div>`;
  });
}

window.addEventListener("load", () => {
  loadWatchlist();
  loadPortfolio();
  updatePortfolioValue();
  updateStockCount();
  lastDateUpdated();
});

function removeFromWatchlist(symbol) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((item) => item.symbol !== symbol);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  loadWatchlist();
}

function lastDateUpdated() {
  const dateSearched = localStorage.getItem("lastTradingDay");
  const displayDiv = document.getElementById("last-date");

  if (!dateSearched) {
    displayDiv.textContent = "N/A"
    return;
  };

  const date = new Date(dateSearched);

  displayDiv.textContent = date.toLocaleDateString();
}

function addToPortfolio(symbol, price) {
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];

  const sharesInput = document.getElementById(`shares-${symbol}`);
  const shares = Number(sharesInput.value);

  if (!shares || shares <= 0) {
    alert("Enter valid number of shares");
    return;
  }

  const existing = portfolio.find((item) => item.symbol === symbol);

  if (existing) {
    existing.shares += shares;
  } else {
    portfolio.push({ symbol, shares, price });
  }

  localStorage.setItem("portfolio", JSON.stringify(portfolio));
  loadPortfolio();
  updatePortfolioValue();
  updateStockCount();
}

function loadPortfolio() {
  const portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  const portfolioDiv = document.getElementById("summary-section");

  portfolioDiv.innerHTML = "<h3>Portfolio</h3>";

  portfolio.forEach((stock) => {
    portfolioDiv.innerHTML += `
      <div class="portfolio-item">
        <span>${stock.symbol}</span>
        <span>Shares: ${stock.shares}</span>
        <span>Buy Price: $${stock.price}</span>
        <span>Total: $${(stock.shares * stock.price).toFixed(2)}</span>

        <button class="remove-btn" onclick="removeFromPortfolio('${stock.symbol}')">
          Sell
        </button>
      </div>
    `;
  });
}

function removeFromPortfolio(symbol) {
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  portfolio = portfolio.filter((item) => item.symbol !== symbol);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
  loadPortfolio();
  updatePortfolioValue();
  updateStockCount();
}

function updatePortfolioValue() {
  const portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  const valueDiv = document.getElementById("dynamic-value");

  let total = 0;

  portfolio.forEach((stock) => {
    total += stock.shares * stock.price;
  });

  valueDiv.textContent = `$${total.toFixed(2)}`;
}

updatePortfolioValue();

function updateStockCount () {
  const portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  const valueDiv = document.getElementById("dynamic-stocks");

  let totalShares = 0;

  portfolio.forEach((stock) => {
    totalShares += stock.shares;
  });

  valueDiv.innerHTML = `${totalShares}`;
}

updateStockCount();