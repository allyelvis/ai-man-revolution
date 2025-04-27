type WalletData = {
  privateKey: string
  balances: { ETH: number; USDT: number; DAI: number }
  history: Array<{
    type: string
    amount: number
    token: string
    to?: string
    timestamp?: number
  }>
}

export function saveWalletData(data: WalletData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("sandbox_wallet", JSON.stringify(data))
  }
}

export function loadWalletData(): WalletData | null {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sandbox_wallet")
    if (saved) {
      try {
        return JSON.parse(saved) as WalletData
      } catch (e) {
        console.error("Failed to parse wallet data:", e)
      }
    }
  }
  return null
}

export function clearWalletData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sandbox_wallet")
  }
}
