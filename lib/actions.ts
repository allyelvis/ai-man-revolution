"use server"

import { JsonRpcProvider, formatEther } from "ethers"

// Server action to get provider
export async function getProvider() {
  const infuraKey = process.env.INFURA_API_KEY
  if (!infuraKey) {
    throw new Error("Infura API key is not configured")
  }

  const infuraUrl = `https://mainnet.infura.io/v3/${infuraKey}`
  return infuraUrl
}

// Server action to fetch balance
export async function fetchBalance(address: string) {
  const infuraKey = process.env.INFURA_API_KEY
  if (!infuraKey) {
    throw new Error("Infura API key is not configured")
  }

  const infuraUrl = `https://mainnet.infura.io/v3/${infuraKey}`
  const provider = new JsonRpcProvider(infuraUrl)

  try {
    const balance = await provider.getBalance(address)
    return formatEther(balance)
  } catch (error) {
    console.error("Error fetching balance:", error)
    throw new Error("Failed to fetch balance")
  }
}
