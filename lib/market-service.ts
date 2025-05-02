import type { CryptoCurrency, FiatCurrency, MarketData, ExchangeRate, FeeEstimate } from "./types"

// This would be replaced with actual API calls in a production environment
export async function getMarketData(currency: CryptoCurrency): Promise<MarketData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  const mockData: Record<CryptoCurrency, MarketData> = {
    BTC: {
      price: 68452.12,
      change24h: 2.34,
      volume24h: 32456789012,
      marketCap: 1345678901234,
      lastUpdated: new Date().toISOString(),
    },
    ETH: {
      price: 3245.67,
      change24h: 1.23,
      volume24h: 12345678901,
      marketCap: 345678901234,
      lastUpdated: new Date().toISOString(),
    },
    USDT: {
      price: 1.0,
      change24h: 0.01,
      volume24h: 45678901234,
      marketCap: 78901234567,
      lastUpdated: new Date().toISOString(),
    },
    USDC: {
      price: 1.0,
      change24h: 0.0,
      volume24h: 34567890123,
      marketCap: 67890123456,
      lastUpdated: new Date().toISOString(),
    },
    DAI: {
      price: 1.0,
      change24h: -0.01,
      volume24h: 2345678901,
      marketCap: 5678901234,
      lastUpdated: new Date().toISOString(),
    },
    SOL: {
      price: 145.23,
      change24h: 5.67,
      volume24h: 5678901234,
      marketCap: 56789012345,
      lastUpdated: new Date().toISOString(),
    },
    MATIC: {
      price: 0.67,
      change24h: -2.34,
      volume24h: 1234567890,
      marketCap: 6789012345,
      lastUpdated: new Date().toISOString(),
    },
  }

  return mockData[currency]
}

export async function getExchangeRate(
  from: CryptoCurrency | FiatCurrency,
  to: CryptoCurrency | FiatCurrency,
): Promise<ExchangeRate> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock exchange rates
  const rates: Record<string, number> = {
    "BTC-USD": 68452.12,
    "ETH-USD": 3245.67,
    "USDT-USD": 1.0,
    "USDC-USD": 1.0,
    "DAI-USD": 1.0,
    "SOL-USD": 145.23,
    "MATIC-USD": 0.67,
    "BTC-EUR": 63245.89,
    "ETH-EUR": 2987.45,
    "BTC-ETH": 21.09,
    "ETH-BTC": 0.047,
    "SOL-ETH": 0.045,
    "MATIC-ETH": 0.00021,
  }

  const key = `${from}-${to}`
  const reverseKey = `${to}-${from}`

  let rate: number

  if (rates[key]) {
    rate = rates[key]
  } else if (rates[reverseKey]) {
    rate = 1 / rates[reverseKey]
  } else if (from === to) {
    rate = 1
  } else {
    // If direct rate not found, convert through USD
    const fromUsd = rates[`${from}-USD`] || 1 / rates[`USD-${from}`]
    const toUsd = rates[`${to}-USD`] || 1 / rates[`USD-${to}`]
    rate = fromUsd / toUsd
  }

  return {
    from,
    to,
    rate,
    lastUpdated: new Date().toISOString(),
  }
}

export async function getNetworkFees(network: string): Promise<FeeEstimate> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Mock fee data
  const fees: Record<string, FeeEstimate> = {
    ethereum: {
      slow: 0.0012,
      average: 0.0025,
      fast: 0.0045,
      lastUpdated: new Date().toISOString(),
    },
    bitcoin: {
      slow: 0.00005,
      average: 0.0001,
      fast: 0.0002,
      lastUpdated: new Date().toISOString(),
    },
    solana: {
      slow: 0.000001,
      average: 0.000002,
      fast: 0.000005,
      lastUpdated: new Date().toISOString(),
    },
    polygon: {
      slow: 0.0001,
      average: 0.0002,
      fast: 0.0005,
      lastUpdated: new Date().toISOString(),
    },
  }

  return fees[network.toLowerCase()] || fees["ethereum"]
}
