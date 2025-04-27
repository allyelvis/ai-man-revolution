"use server"

import { JsonRpcProvider, formatEther } from "ethers"

// Server action to get provider
export async function getProvider() {
  const infuraKey = process.env.INFURA_API_KEY
  if (!infuraKey) {
    throw new Error("Infura API key is not configured")
  }

  return `https://mainnet.infura.io/v3/${infuraKey}`
}

// Server action to fetch balance
export async function fetchBalance(address: string) {
  try {
    const infuraKey = process.env.INFURA_API_KEY
    if (!infuraKey) {
      throw new Error("Infura API key is not configured")
    }

    // Use the correct format for JsonRpcProvider in ethers v6
    const infuraUrl = `https://mainnet.infura.io/v3/${infuraKey}`

    // Create the provider with proper configuration
    const provider = new JsonRpcProvider(infuraUrl, undefined, {
      staticNetwork: true,
      polling: true,
      batchStallTime: 0,
    })

    // Test the connection first
    await provider.getBlockNumber()

    // Then get the balance
    const balance = await provider.getBalance(address)
    return formatEther(balance)
  } catch (error) {
    console.error("Error fetching balance:", error)
    // Return a default value instead of throwing
    return "0.0"
  }
}
