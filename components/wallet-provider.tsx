"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { saveWalletData, loadWalletData, clearWalletData } from "@/lib/storage"
import { getProvider, fetchBalance } from "@/lib/actions"

type WalletContextType = {
  wallet: ethers.Wallet | null
  provider: ethers.providers.JsonRpcProvider | null
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
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null)
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null)
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
        const loadedWallet = new ethers.Wallet(savedData.privateKey)
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
    const newWallet = ethers.Wallet.createRandom()
    setWallet(newWallet)
    setBalances({ ETH: 0, USDT: 0, DAI: 0 })
    setHistory([])
    setProvider(null)
    setIsConnected(false)
  }

  const importWallet = (privateKey: string) => {
    try {
      const importedWallet = new ethers.Wallet(privateKey)
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
      const newProvider = new ethers.providers.JsonRpcProvider(infuraUrl)
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
        setBalances((prev) => ({
          ...prev,
          ETH: Number.parseFloat(balance),
        }))
      } catch (error) {
        console.error("Failed to fetch balance:", error)
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
      const signer = wallet.connect(provider)
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount.toString()),
      })

      await tx.wait()

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
