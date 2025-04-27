"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Wallet, JsonRpcProvider, parseEther } from "ethers"
import { saveWalletData, loadWalletData, clearWalletData } from "@/lib/storage"
import { getProvider, fetchBalance } from "@/lib/actions"

type WalletContextType = {
  wallet: Wallet | null
  provider: JsonRpcProvider | null
  balances: { ETH: number; USDT: number; DAI: number }
  history: Transaction[]
  createWallet: () => void
  importWallet: (privateKey: string) => boolean
  connectToBlockchain: () => Promise<void>
  deposit: (amount: number, token: string) => void
  withdraw: (amount: number, token: string) => boolean
  transfer: (to: string, amount: number) => Promise<boolean>
  resetWallet: () => void
  fetchRealBalance: () => Promise<void>
  isConnected: boolean
}

export type Transaction = {
  type: string
  amount: number
  token: string
  to?: string
  timestamp?: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null)
  const [balances, setBalances] = useState<{ ETH: number; USDT: number; DAI: number }>({
    ETH: 0,
    USDT: 0,
    DAI: 0,
  })
  const [history, setHistory] = useState<Transaction[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Load saved wallet data on component mount
  useEffect(() => {
    const savedData = loadWalletData()
    if (savedData) {
      try {
        const loadedWallet = new Wallet(savedData.privateKey)
        setWallet(loadedWallet)
        setBalances(savedData.balances || { ETH: 0, USDT: 0, DAI: 0 })
        setHistory(savedData.history || [])
      } catch (e) {
        console.error("Failed to load wallet:", e)
      }
    }
  }, [])

  // Save wallet data whenever it changes
  useEffect(() => {
    if (wallet) {
      saveWalletData({
        privateKey: wallet.privateKey,
        balances,
        history,
      })
    }
  }, [wallet, balances, history])

  const createWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
    setBalances({ ETH: 0, USDT: 0, DAI: 0 })
    setHistory([])
    setProvider(null)
    setIsConnected(false)
  }

  const importWallet = (privateKey: string) => {
    try {
      const importedWallet = new Wallet(privateKey)
      setWallet(importedWallet)
      setBalances({ ETH: 0, USDT: 0, DAI: 0 })
      setHistory([])
      setProvider(null)
      setIsConnected(false)
      return true
    } catch (e) {
      console.error("Invalid private key:", e)
      return false
    }
  }

  async function connectToBlockchain() {
    if (!wallet) return

    try {
      const infuraUrl = await getProvider()

      // Create the provider with proper configuration for ethers v6
      const newProvider = new JsonRpcProvider(infuraUrl, undefined, {
        staticNetwork: true,
        polling: true,
        batchStallTime: 0,
      })

      // Test the connection
      await newProvider.getBlockNumber()

      setProvider(newProvider)
      setIsConnected(true)
      await fetchRealBalance()
    } catch (error) {
      console.error("Failed to connect to blockchain:", error)
      setIsConnected(false)
    }
  }

  async function fetchRealBalance() {
    if (wallet) {
      try {
        const balance = await fetchBalance(wallet.address)
        // Handle the case where balance might be a string now
        const numBalance = typeof balance === "string" ? Number.parseFloat(balance) : balance

        setBalances((prev) => ({
          ...prev,
          ETH: numBalance,
        }))
      } catch (error) {
        console.error("Failed to fetch balance:", error)
        // Don't update the balance on error
      }
    }
  }

  const deposit = (amount: number, token: string) => {
    if (amount <= 0) return

    setBalances((prev) => ({
      ...prev,
      [token]: (prev[token as keyof typeof prev] || 0) + amount,
    }))

    const newTransaction: Transaction = {
      type: "Deposit",
      amount,
      token,
      timestamp: Date.now(),
    }

    setHistory((prev) => [newTransaction, ...prev])
  }

  const withdraw = (amount: number, token: string) => {
    if (amount <= 0) return false

    const currentBalance = balances[token as keyof typeof balances] || 0

    if (currentBalance < amount) return false

    setBalances((prev) => ({
      ...prev,
      [token]: (prev[token as keyof typeof prev] || 0) - amount,
    }))

    const newTransaction: Transaction = {
      type: "Withdraw",
      amount,
      token,
      timestamp: Date.now(),
    }

    setHistory((prev) => [newTransaction, ...prev])
    return true
  }

  const transfer = async (to: string, amount: number) => {
    if (!wallet || !provider || amount <= 0) return false

    try {
      // In ethers v6, we connect the wallet to the provider differently
      const connectedWallet = wallet.connect(provider)

      const tx = await connectedWallet.sendTransaction({
        to,
        value: parseEther(amount.toString()),
      })

      // Wait for transaction with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Transaction timeout")), 60000)),
      ])

      const newTransaction: Transaction = {
        type: "Real Transfer",
        amount,
        token: "ETH",
        to,
        timestamp: Date.now(),
      }

      setHistory((prev) => [newTransaction, ...prev])
      await fetchRealBalance()
      return true
    } catch (error) {
      console.error("Failed to send transaction:", error)
      return false
    }
  }

  const resetWallet = () => {
    setWallet(null)
    setProvider(null)
    setBalances({ ETH: 0, USDT: 0, DAI: 0 })
    setHistory([])
    setIsConnected(false)
    clearWalletData()
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        provider,
        balances,
        history,
        createWallet,
        importWallet,
        connectToBlockchain,
        deposit,
        withdraw,
        transfer,
        resetWallet,
        fetchRealBalance,
        isConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
