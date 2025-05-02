"use server"

import { formatEther } from "ethers"

// Check if an RPC URL is valid by making a simple request
export async function checkRpcUrl(customUrl?: string) {
  try {
    let url: string

    if (customUrl) {
      url = customUrl
    } else {
      const infuraKey = process.env.INFURA_API_KEY
      if (!infuraKey) {
        return { valid: false, message: "Infura API key is not configured" }
      }
      url = `https://mainnet.infura.io/v3/${infuraKey}`
    }

    // Make a simple fetch request to check if the RPC URL is valid
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
    })

    if (!response.ok) {
      return { valid: false, message: `RPC endpoint returned status: ${response.status}` }
    }

    const data = await response.json()
    if (data.error) {
      return { valid: false, message: `RPC error: ${data.error.message}` }
    }

    return { valid: true, message: "RPC endpoint is valid" }
  } catch (error: any) {
    console.error("Error checking RPC URL:", error)
    return { valid: false, message: `Error checking RPC URL: ${error.message}` }
  }
}

// Server action to get provider URL
export async function getProviderUrl() {
  const infuraKey = process.env.INFURA_API_KEY
  if (!infuraKey) {
    throw new Error("Infura API key is not configured")
  }

  return `https://mainnet.infura.io/v3/${infuraKey}`
}

// Server action to fetch balance using direct fetch instead of ethers.js
export async function fetchBalance(address: string, customRpcUrl?: string) {
  try {
    let url: string

    if (customRpcUrl) {
      url = customRpcUrl
    } else {
      const infuraKey = process.env.INFURA_API_KEY
      if (!infuraKey) {
        return "0.0"
      }
      url = `https://mainnet.infura.io/v3/${infuraKey}`
    }

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
    })

    if (!response.ok) {
      console.error(`RPC endpoint returned status: ${response.status}`)
      return "0.0"
    }

    const data = await response.json()
    if (data.error) {
      console.error(`RPC error: ${data.error.message}`)
      return "0.0"
    }

    // Convert hex balance to ether
    const balanceHex = data.result
    const balanceWei = BigInt(balanceHex)
    const balanceEth = formatEther(balanceWei)

    return balanceEth
  } catch (error) {
    console.error("Error fetching balance:", error)
    return "0.0"
  }
}
