"use server"

import type { CryptoCurrency, Transaction, NetworkInfo } from "./types"
import { formatEther } from "ethers"

// Network configurations
export const NETWORKS: Record<string, NetworkInfo> = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/",
    blockExplorerUrl: "https://etherscan.io",
    currencySymbol: "ETH",
    logoUrl: "/networks/ethereum.svg",
    isTestnet: false,
  },
  goerli: {
    name: "Goerli Testnet",
    chainId: 5,
    rpcUrl: "https://goerli.infura.io/v3/",
    blockExplorerUrl: "https://goerli.etherscan.io",
    currencySymbol: "ETH",
    logoUrl: "/networks/ethereum.svg",
    isTestnet: true,
  },
  polygon: {
    name: "Polygon Mainnet",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    blockExplorerUrl: "https://polygonscan.com",
    currencySymbol: "MATIC",
    logoUrl: "/networks/polygon.svg",
    isTestnet: false,
  },
  solana: {
    name: "Solana Mainnet",
    chainId: 101,
    rpcUrl: "https://api.mainnet-beta.solana.com",
    blockExplorerUrl: "https://explorer.solana.com",
    currencySymbol: "SOL",
    logoUrl: "/networks/solana.svg",
    isTestnet: false,
  },
  bitcoin: {
    name: "Bitcoin",
    chainId: 0,
    rpcUrl: "",
    blockExplorerUrl: "https://www.blockchain.com/explorer",
    currencySymbol: "BTC",
    logoUrl: "/networks/bitcoin.svg",
    isTestnet: false,
  },
}

// Check if an RPC URL is valid by making a simple request
export async function checkRpcUrl(customUrl?: string, network = "ethereum") {
  try {
    let url: string

    if (customUrl) {
      url = customUrl
    } else {
      const infuraKey = process.env.INFURA_API_KEY
      if (!infuraKey) {
        return { valid: false, message: "API key is not configured" }
      }

      const baseUrl = NETWORKS[network]?.rpcUrl || NETWORKS.ethereum.rpcUrl
      url = baseUrl.includes("infura") ? `${baseUrl}${infuraKey}` : baseUrl
    }

    // Make a simple fetch request to check if the RPC URL is valid
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_blockNumber",
          params: [],
        }),
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        if (response.status === 403) {
          return {
            valid: false,
            message: "Access denied. API key may be invalid or missing required permissions.",
          }
        }
        return { valid: false, message: `RPC endpoint returned status: ${response.status}` }
      }

      try {
        const data = await response.json()
        if (data.error) {
          return { valid: false, message: `RPC error: ${data.error.message}` }
        }
        return { valid: true, message: "RPC endpoint is valid" }
      } catch (jsonError) {
        return { valid: false, message: "Invalid JSON response from RPC endpoint" }
      }
    } catch (fetchError: any) {
      return {
        valid: false,
        message:
          fetchError.name === "TimeoutError"
            ? "RPC endpoint timed out"
            : `Error connecting to RPC endpoint: ${fetchError.message}`,
      }
    }
  } catch (error: any) {
    console.error("Error checking RPC URL:", error)
    return { valid: false, message: `Error checking RPC URL: ${error.message}` }
  }
}

// Server action to get provider URL
export async function getProviderUrl(network = "ethereum") {
  const infuraKey = process.env.INFURA_API_KEY
  if (!infuraKey) {
    throw new Error("API key is not configured")
  }

  const networkConfig = NETWORKS[network]
  if (!networkConfig) {
    throw new Error(`Network ${network} is not supported`)
  }

  const baseUrl = networkConfig.rpcUrl
  return baseUrl.includes("infura") ? `${baseUrl}${infuraKey}` : baseUrl
}

// Server action to fetch balance using direct fetch
export async function fetchBalance(
  address: string,
  currency: CryptoCurrency = "ETH",
  network = "ethereum",
  customRpcUrl?: string,
) {
  try {
    // For non-ETH currencies in this demo, return mock balances
    // In a real app, you would query the appropriate blockchain or token contract
    if (currency !== "ETH" && network === "ethereum") {
      // Return mock balances for demo purposes
      return await getMockBalance(currency)
    }

    // For networks other than Ethereum, return mock balances
    if (network !== "ethereum" && network !== "goerli") {
      return await getMockBalance(currency)
    }

    let url: string

    if (customRpcUrl) {
      url = customRpcUrl
    } else {
      const infuraKey = process.env.INFURA_API_KEY
      if (!infuraKey) {
        console.warn("No Infura API key found, using mock balance")
        return await getMockBalance(currency)
      }
      const baseUrl = NETWORKS[network]?.rpcUrl || NETWORKS.ethereum.rpcUrl
      url = baseUrl.includes("infura") ? `${baseUrl}${infuraKey}` : baseUrl
    }

    // For ERC20 tokens, we would need to call the token contract
    // This is a simplified example for native currencies only
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        console.error(`RPC endpoint returned status: ${response.status}`)
        if (response.status === 403) {
          console.warn("Access denied (403). Using mock balance instead.")
          return await getMockBalance(currency)
        }
        return await getMockBalance(currency)
      }

      const data = await response.json()
      if (data.error) {
        console.error(`RPC error: ${data.error.message}`)
        return await getMockBalance(currency)
      }

      // Convert hex balance to ether
      const balanceHex = data.result
      const balanceWei = BigInt(balanceHex)
      const balanceEth = formatEther(balanceWei)

      return balanceEth
    } catch (fetchError) {
      console.error("Error fetching balance:", fetchError)
      return await getMockBalance(currency)
    }
  } catch (error) {
    console.error("Error in fetchBalance:", error)
    return await getMockBalance(currency)
  }
}

// Helper function to get mock balances for demo purposes
export async function getMockBalance(currency: CryptoCurrency): Promise<string> {
  const mockBalances: Record<CryptoCurrency, string> = {
    ETH: "1.5",
    BTC: "0.05",
    USDT: "1000",
    USDC: "1000",
    DAI: "1000",
    SOL: "20",
    MATIC: "500",
  }

  return mockBalances[currency] || "0"
}

// Server action to execute a transaction
export async function executeTransaction(
  transaction: Omit<Transaction, "id" | "status" | "timestamp" | "hash">,
  privateKey: string,
  rpcUrl: string,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  // In a real implementation, this would connect to the blockchain and execute the transaction
  // For demo purposes, we'll simulate a successful transaction
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a fake transaction hash
    const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    return {
      success: true,
      hash,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Transaction failed",
    }
  }
}
