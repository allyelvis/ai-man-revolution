import { JsonRpcProvider, Network } from "ethers"

// Create a fallback provider that can try multiple networks
export async function createFallbackProvider(apiKey: string) {
  // Try to create a provider with multiple fallback options
  const urls = [
    `https://mainnet.infura.io/v3/${apiKey}`,
    `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, // Fallback to Alchemy if available
  ]

  // Try each URL until one works
  for (const url of urls) {
    try {
      const provider = new JsonRpcProvider(url, Network.from("mainnet"), {
        staticNetwork: true,
        polling: true,
        batchStallTime: 0,
      })

      // Test the connection
      await provider.getBlockNumber()
      console.log("Connected to provider:", url.split("/")[2])
      return provider
    } catch (error) {
      console.warn(`Failed to connect to ${url.split("/")[2]}:`, error)
      // Continue to the next URL
    }
  }

  // If all providers fail, throw an error
  throw new Error("Failed to connect to any Ethereum provider")
}

// Create a mock provider for testing when real providers fail
export function createMockProvider() {
  return {
    getBalance: async () => BigInt(0),
    getBlockNumber: async () => 0,
    // Add other methods as needed
  }
}
