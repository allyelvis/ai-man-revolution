"use server"

import { ethers } from "ethers"

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
  const provider = new ethers.providers.JsonRpcProvider(infuraUrl)

  try {
    const balance = await provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  } catch (error) {
    console.error("Error fetching balance:", error)
    throw new Error("Failed to fetch balance")
  }
}
