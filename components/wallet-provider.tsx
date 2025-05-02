"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Wallet, JsonRpcProvider, parseEther } from "ethers"
import { saveWalletData, loadWalletData, clearWalletData } from "@/lib/storage"
import { checkRpcUrl, getProviderUrl, fetchBalance, NETWORKS, getMockBalance } from "@/lib/blockchain-service"
import {
  buyCrypto,
  sellCrypto,
  swapCrypto,
  getPaymentMethods,
  getCashOutMethods,
  addPaymentMethod,
  addCashOutMethod,
} from "@/lib/payment-service"
import { getMarketData, getExchangeRate, getNetworkFees } from "@/lib/market-service"
import {
  checkVerificationStatus,
  submitVerification,
  getTransactionLimits,
  checkTransactionLimits,
  updateUsedLimits,
  generateRecoveryPhrase,
  verifyRecoveryPhrase,
  verifyWithRecoveryPhrase,
} from "@/lib/verification-service"
import type {
  CryptoCurrency,
  FiatCurrency,
  Transaction,
  CryptoAsset,
  FiatBalance,
  MarketData,
  ExchangeRate,
  FeeEstimate,
  PaymentMethod,
  CashOutMethod,
  NetworkInfo,
  UserProfile,
  VerificationStatus,
  DocumentType,
  TransactionLimits,
  PaymentProvider,
} from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

type WalletContextType = {
  // Core wallet state
  wallet: Wallet | null
  provider: JsonRpcProvider | null
  cryptoAssets: CryptoAsset[]
  fiatBalances: FiatBalance[]
  transactions: Transaction[]
  isConnected: boolean
  isSandboxMode: boolean
  selectedNetwork: string

  // User profile
  userProfile: UserProfile
  refreshUserProfile: () => Promise<void>
  submitUserVerification: (
    userData: {
      firstName: string
      lastName: string
      dateOfBirth: string
      address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
      }
      email: string
      phone: string
    },
    documentType: DocumentType,
    documentFile: File,
  ) => Promise<{ success: boolean; message: string }>
  getVerificationLimits: (status: VerificationStatus) => Promise<TransactionLimits>
  checkTransactionAllowed: (amount: number) => Promise<{ allowed: boolean; reason?: string }>

  // Recovery phrase methods
  generateRecoveryPhrase: () => Promise<string>
  verifyRecoveryPhrase: (phrase: string) => Promise<boolean>
  verifyWithRecoveryPhrase: (
    userId: string,
    phrase: string,
  ) => Promise<{ success: boolean; message: string; newStatus?: VerificationStatus }>

  // Market data
  marketData: Record<CryptoCurrency, MarketData>
  exchangeRates: ExchangeRate[]
  networkFees: Record<string, FeeEstimate>

  // Payment methods
  paymentMethods: PaymentMethod[]
  cashOutMethods: CashOutMethod[]
  addPaymentMethod: (
    type: string,
    provider: PaymentProvider,
    details: Record<string, string>,
  ) => Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }>
  addCashOutMethod: (
    type: string,
    provider: PaymentProvider,
    details: Record<string, string>,
  ) => Promise<{ success: boolean; cashOutMethod?: CashOutMethod; error?: string }>

  // Core wallet functions
  createWallet: () => void
  importWallet: (privateKey: string) => boolean
  connectToBlockchain: (customRpcUrl?: string, network?: string) => Promise<{ success: boolean; message: string }>
  resetWallet: () => void

  // Asset management
  fetchBalances: () => Promise<void>
  refreshMarketData: () => Promise<void>

  // Transaction functions
  deposit: (amount: number, currency: CryptoCurrency) => void
  withdraw: (amount: number, currency: CryptoCurrency) => boolean
  transfer: (to: string, amount: number, currency: CryptoCurrency) => Promise<boolean>

  // Advanced features
  buyCryptoWithFiat: (
    amount: number,
    fiatCurrency: FiatCurrency,
    cryptoCurrency: CryptoCurrency,
    paymentMethodId: string,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>

  sellCryptoForFiat: (
    amount: number,
    cryptoCurrency: CryptoCurrency,
    fiatCurrency: FiatCurrency,
    cashOutMethodId: string,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>

  swapCryptoAssets: (
    fromAmount: number,
    fromCurrency: CryptoCurrency,
    toCurrency: CryptoCurrency,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>

  // Network management
  setSelectedNetwork: (network: string) => void
  getNetworkInfo: (network: string) => NetworkInfo
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Initial crypto assets
const initialCryptoAssets: CryptoAsset[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 0,
    network: "ethereum",
    decimals: 18,
    logoUrl: "/crypto/eth.svg",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0,
    network: "bitcoin",
    decimals: 8,
    logoUrl: "/crypto/btc.svg",
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 0,
    network: "ethereum",
    decimals: 6,
    logoUrl: "/crypto/usdt.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 0,
    network: "ethereum",
    decimals: 6,
    logoUrl: "/crypto/usdc.svg",
  },
  {
    symbol: "DAI",
    name: "Dai",
    balance: 0,
    network: "ethereum",
    decimals: 18,
    logoUrl: "/crypto/dai.svg",
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: 0,
    network: "solana",
    decimals: 9,
    logoUrl: "/crypto/sol.svg",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    balance: 0,
    network: "polygon",
    decimals: 18,
    logoUrl: "/crypto/matic.svg",
  },
]

// Initial fiat balances
const initialFiatBalances: FiatBalance[] = [
  {
    currency: "USD",
    balance: 0,
    symbol: "$",
  },
  {
    currency: "EUR",
    balance: 0,
    symbol: "€",
  },
  {
    currency: "GBP",
    balance: 0,
    symbol: "£",
  },
]

export function WalletProvider({ children }: { children: ReactNode }) {
  // Core wallet state
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null)
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(initialCryptoAssets)
  const [fiatBalances, setFiatBalances] = useState<FiatBalance[]>(initialFiatBalances)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSandboxMode, setIsSandboxMode] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")

  // User profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    kycLevel: "none",
    dailyLimit: 1000,
    monthlyLimit: 5000,
    usedDailyLimit: 0,
    usedMonthlyLimit: 0,
    verificationDocuments: [],
  })

  // Market data
  const [marketData, setMarketData] = useState<Record<CryptoCurrency, MarketData>>(
    {} as Record<CryptoCurrency, MarketData>,
  )
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [networkFees, setNetworkFees] = useState<Record<string, FeeEstimate>>({})

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [cashOutMethods, setCashOutMethods] = useState<CashOutMethod[]>([])

  // Load saved wallet data on component mount
  useEffect(() => {
    const savedData = loadWalletData()
    if (savedData) {
      try {
        const loadedWallet = new Wallet(savedData.privateKey)
        setWallet(loadedWallet)

        // Convert old balances format to new crypto assets format
        if (savedData.balances) {
          setCryptoAssets((prev) =>
            prev.map((asset) => {
              if (asset.symbol === "ETH") {
                return { ...asset, balance: savedData.balances.ETH || 0 }
              }
              if (asset.symbol === "USDT") {
                return { ...asset, balance: savedData.balances.USDT || 0 }
              }
              if (asset.symbol === "DAI") {
                return { ...asset, balance: savedData.balances.DAI || 0 }
              }
              return asset
            }),
          )
        }

        // Load transactions
        if (savedData.history) {
          // Convert old history format to new transactions format
          const convertedTransactions = savedData.history.map((tx: any) => ({
            id: uuidv4(),
            type: tx.type as TransactionType,
            amount: tx.amount,
            currency: tx.token as CryptoCurrency,
            timestamp: tx.timestamp || Date.now(),
            status: "completed",
            to: tx.to,
            hash: tx.hash,
          }))
          setTransactions(convertedTransactions)
        }
      } catch (e) {
        console.error("Failed to load wallet:", e)
      }
    }

    // Load initial data
    loadInitialData()
  }, [])

  // Save wallet data whenever it changes
  useEffect(() => {
    if (wallet) {
      // Convert crypto assets to old balances format for backward compatibility
      const balances = {
        ETH: cryptoAssets.find((a) => a.symbol === "ETH")?.balance || 0,
        USDT: cryptoAssets.find((a) => a.symbol === "USDT")?.balance || 0,
        DAI: cryptoAssets.find((a) => a.symbol === "DAI")?.balance || 0,
      }

      saveWalletData({
        privateKey: wallet.privateKey,
        balances,
        history: transactions.map((tx) => ({
          type: tx.type,
          amount: tx.amount,
          token: tx.currency,
          to: tx.toAddress,
          timestamp: tx.timestamp,
          hash: tx.hash,
        })),
      })
    }
  }, [wallet, cryptoAssets, transactions])

  // Load initial market data and payment methods
  const loadInitialData = async () => {
    try {
      // Load market data for all supported cryptocurrencies
      const marketDataPromises = initialCryptoAssets.map((asset) =>
        getMarketData(asset.symbol).then((data) => [asset.symbol, data]),
      )

      const marketDataResults = await Promise.all(marketDataPromises)
      const marketDataMap = Object.fromEntries(marketDataResults) as Record<CryptoCurrency, MarketData>
      setMarketData(marketDataMap)

      // Load exchange rates for common pairs
      const exchangeRatePromises = [
        getExchangeRate("BTC", "USD"),
        getExchangeRate("ETH", "USD"),
        getExchangeRate("BTC", "ETH"),
        getExchangeRate("USDT", "USD"),
        getExchangeRate("USDC", "USD"),
      ]

      const exchangeRateResults = await Promise.all(exchangeRatePromises)
      setExchangeRates(exchangeRateResults)

      // Load network fees
      const networkFeePromises = [
        getNetworkFees("ethereum"),
        getNetworkFees("bitcoin"),
        getNetworkFees("solana"),
        getNetworkFees("polygon"),
      ]

      const networkFeeResults = await Promise.all(networkFeePromises)
      const networkFeeMap = {
        ethereum: networkFeeResults[0],
        bitcoin: networkFeeResults[1],
        solana: networkFeeResults[2],
        polygon: networkFeeResults[3],
      }
      setNetworkFees(networkFeeMap)

      // Load payment methods
      const paymentMethodsData = await getPaymentMethods()
      setPaymentMethods(paymentMethodsData)

      // Load cash out methods
      const cashOutMethodsData = await getCashOutMethods()
      setCashOutMethods(cashOutMethodsData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const createWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
    setCryptoAssets(initialCryptoAssets)
    setFiatBalances(initialFiatBalances)
    setTransactions([])
    setProvider(null)
    setIsConnected(false)
    setIsSandboxMode(true)
  }

  const importWallet = (privateKey: string) => {
    try {
      const importedWallet = new Wallet(privateKey)
      setWallet(importedWallet)
      setCryptoAssets(initialCryptoAssets)
      setFiatBalances(initialFiatBalances)
      setTransactions([])
      setProvider(null)
      setIsConnected(false)
      setIsSandboxMode(true)
      return true
    } catch (e) {
      console.error("Invalid private key:", e)
      return false
    }
  }

  const connectToBlockchain = async (customRpcUrl?: string, network?: string) => {
    if (!wallet) {
      return { success: false, message: "No wallet available" }
    }

    const targetNetwork = network || selectedNetwork

    try {
      let providerUrl: string

      if (customRpcUrl) {
        // Check if the custom RPC URL is valid
        const rpcCheck = await checkRpcUrl(customRpcUrl, targetNetwork)
        if (!rpcCheck.valid) {
          setIsSandboxMode(true)
          return { success: false, message: rpcCheck.message }
        }
        providerUrl = customRpcUrl
      } else {
        // Use the default provider URL
        const apiKeyCheck = await checkRpcUrl(undefined, targetNetwork)
        if (!apiKeyCheck.valid) {
          setIsSandboxMode(true)
          return { success: false, message: apiKeyCheck.message }
        }
        providerUrl = await getProviderUrl(targetNetwork)
      }

      // Create a new provider with better error handling
      try {
        // Add connection options to improve reliability
        const newProvider = new JsonRpcProvider(providerUrl, undefined, {
          polling: true,
          staticNetwork: true,
          batchStallTime: 0,
          cacheTimeout: -1, // Disable caching to avoid stale data
          timeout: 30000, // 30 second timeout
        })

        // Test the connection with a simple call and proper error handling
        try {
          await newProvider.getBlockNumber()

          setProvider(newProvider)
          setIsConnected(true)
          setIsSandboxMode(false)
          setSelectedNetwork(targetNetwork)

          // Fetch the real balances
          await fetchBalances()

          return {
            success: true,
            message: customRpcUrl
              ? `Connected to blockchain using custom RPC: ${customRpcUrl}`
              : `Connected to ${NETWORKS[targetNetwork]?.name || targetNetwork}`,
          }
        } catch (blockNumberError: any) {
          console.error("Failed to get block number:", blockNumberError)

          // If we get a 403 error, we'll still mark as connected but in sandbox mode
          if (blockNumberError.message && blockNumberError.message.includes("403")) {
            setIsConnected(true)
            setIsSandboxMode(true)
            setSelectedNetwork(targetNetwork)

            // Load mock balances
            await loadMockBalances()

            return {
              success: false,
              message: "API access denied. Running in sandbox mode with mock data.",
            }
          }

          setIsSandboxMode(true)
          return {
            success: false,
            message: `Failed to connect: ${blockNumberError.message || "Could not retrieve blockchain data"}`,
          }
        }
      } catch (providerError: any) {
        console.error("Provider error:", providerError)
        setIsSandboxMode(true)
        return {
          success: false,
          message: `Provider error: ${providerError.message || "Unknown error"}`,
        }
      }
    } catch (error: any) {
      console.error("Failed to connect to blockchain:", error)
      setIsSandboxMode(true)
      return {
        success: false,
        message: `Connection error: ${error.message || "Unknown error"}`,
      }
    }
  }

  // Load mock balances for sandbox mode
  const loadMockBalances = async () => {
    const updatedAssets = [...cryptoAssets]

    for (let i = 0; i < updatedAssets.length; i++) {
      const asset = updatedAssets[i]
      // Use predefined mock balances
      const mockBalance = await getMockBalance(asset.symbol)

      updatedAssets[i] = {
        ...asset,
        balance: Number(mockBalance),
      }
    }

    setCryptoAssets(updatedAssets)
  }

  async function fetchBalances() {
    if (!wallet) return

    try {
      // For each supported asset, fetch the balance
      const updatedAssets = [...cryptoAssets]

      for (let i = 0; i < updatedAssets.length; i++) {
        const asset = updatedAssets[i]

        try {
          // If in sandbox mode, use mock balances
          if (isSandboxMode) {
            const mockBalance = await getMockBalance(asset.symbol)

            updatedAssets[i] = {
              ...asset,
              balance: Number(mockBalance),
            }
            continue
          }

          // Only fetch balances for assets on the selected network
          if (asset.network === selectedNetwork || (asset.network === "ethereum" && selectedNetwork === "goerli")) {
            const balance = await fetchBalance(wallet.address, asset.symbol, asset.network)
            updatedAssets[i] = {
              ...asset,
              balance: typeof balance === "string" ? Number.parseFloat(balance) : balance,
            }
          }
        } catch (error) {
          console.error(`Failed to fetch balance for ${asset.symbol}:`, error)
          // If there's an error, use a mock balance
          const mockBalance = await getMockBalance(asset.symbol)

          updatedAssets[i] = {
            ...asset,
            balance: Number(mockBalance),
          }
        }
      }

      setCryptoAssets(updatedAssets)
    } catch (error) {
      console.error("Failed to fetch balances:", error)
      // If there's a general error, load mock balances
      await loadMockBalances()
    }
  }

  async function refreshMarketData() {
    try {
      // Refresh market data for all supported cryptocurrencies
      const marketDataPromises = cryptoAssets.map((asset) =>
        getMarketData(asset.symbol).then((data) => [asset.symbol, data]),
      )

      const marketDataResults = await Promise.all(marketDataPromises)
      const marketDataMap = Object.fromEntries(marketDataResults) as Record<CryptoCurrency, MarketData>
      setMarketData(marketDataMap)

      // Update crypto assets with market data
      setCryptoAssets((prev) =>
        prev.map((asset) => ({
          ...asset,
          marketData: marketDataMap[asset.symbol],
        })),
      )

      // Refresh exchange rates
      const exchangeRatePromises = [
        getExchangeRate("BTC", "USD"),
        getExchangeRate("ETH", "USD"),
        getExchangeRate("BTC", "ETH"),
        getExchangeRate("USDT", "USD"),
        getExchangeRate("USDC", "USD"),
      ]

      const exchangeRateResults = await Promise.all(exchangeRatePromises)
      setExchangeRates(exchangeRateResults)

      // Refresh network fees
      const networkFeePromises = [
        getNetworkFees("ethereum"),
        getNetworkFees("bitcoin"),
        getNetworkFees("solana"),
        getNetworkFees("polygon"),
      ]

      const networkFeeResults = await Promise.all(networkFeePromises)
      const networkFeeMap = {
        ethereum: networkFeeResults[0],
        bitcoin: networkFeeResults[1],
        solana: networkFeeResults[2],
        polygon: networkFeeResults[3],
      }
      setNetworkFees(networkFeeMap)
    } catch (error) {
      console.error("Failed to refresh market data:", error)
    }
  }

  const deposit = (amount: number, currency: CryptoCurrency) => {
    if (amount <= 0) return

    // Update the balance for the specified currency
    setCryptoAssets((prev) =>
      prev.map((asset) => (asset.symbol === currency ? { ...asset, balance: asset.balance + amount } : asset)),
    )

    // Add transaction record
    const newTransaction: Transaction = {
      id: uuidv4(),
      type: "Deposit",
      amount,
      currency,
      timestamp: Date.now(),
      status: "completed",
    }

    setTransactions((prev) => [newTransaction, ...prev])
  }

  const withdraw = (amount: number, currency: CryptoCurrency) => {
    if (amount <= 0) return false

    // Find the asset
    const asset = cryptoAssets.find((a) => a.symbol === currency)
    if (!asset || asset.balance < amount) return false

    // Update the balance
    setCryptoAssets((prev) => prev.map((a) => (a.symbol === currency ? { ...a, balance: a.balance - amount } : a)))

    // Add transaction record
    const newTransaction: Transaction = {
      id: uuidv4(),
      type: "Withdraw",
      amount,
      currency,
      timestamp: Date.now(),
      status: "completed",
    }

    setTransactions((prev) => [newTransaction, ...prev])
    return true
  }

  const transfer = async (to: string, amount: number, currency: CryptoCurrency = "ETH") => {
    if (!wallet || amount <= 0) return false

    // Find the asset
    const asset = cryptoAssets.find((a) => a.symbol === currency)
    if (!asset || asset.balance < amount) return false

    // Check transaction limits
    const usdValue = amount * (marketData[currency]?.price || 0)
    const limitCheck = await checkTransactionLimits(usdValue, userProfile)
    if (!limitCheck.allowed) {
      console.error("Transaction exceeds limits:", limitCheck.reason || "Transaction exceeds your limits")
      return false
    }

    // If we're in sandbox mode or not connected, simulate the transfer
    if (isSandboxMode || !provider) {
      // Update the balance
      setCryptoAssets((prev) => prev.map((a) => (a.symbol === currency ? { ...a, balance: a.balance - amount } : a)))

      // Add to history
      const newTransaction: Transaction = {
        id: uuidv4(),
        type: "Simulated",
        amount,
        currency,
        toAddress: to,
        timestamp: Date.now(),
        status: "completed",
      }

      setTransactions((prev) => [newTransaction, ...prev])

      // Update used limits
      const { usedDailyLimit, usedMonthlyLimit } = await updateUsedLimits(userProfile, usdValue)
      setUserProfile((prev) => ({
        ...prev,
        usedDailyLimit,
        usedMonthlyLimit,
      }))

      return true
    }

    // Otherwise, do a real transfer
    try {
      // For simplicity, we'll only implement ETH transfers in this demo
      if (currency !== "ETH") {
        throw new Error("Only ETH transfers are implemented in this demo")
      }

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
        id: uuidv4(),
        type: "Transfer",
        amount,
        currency,
        toAddress: to,
        timestamp: Date.now(),
        status: "completed",
        hash: tx.hash,
        network: selectedNetwork,
      }

      setTransactions((prev) => [newTransaction, ...prev])

      // Update the balance
      setCryptoAssets((prev) => prev.map((a) => (a.symbol === currency ? { ...a, balance: a.balance - amount } : a)))

      // Update used limits
      const { usedDailyLimit, usedMonthlyLimit } = await updateUsedLimits(userProfile, usdValue)
      setUserProfile((prev) => ({
        ...prev,
        usedDailyLimit,
        usedMonthlyLimit,
      }))

      return true
    } catch (error) {
      console.error("Failed to send transaction:", error)
      return false
    }
  }

  const refreshUserProfile = async () => {
    if (!wallet) return

    try {
      // In a real implementation, you would pass a user ID or token
      const result = await checkVerificationStatus(wallet.address)

      // Update the user profile with the latest verification status
      setUserProfile((prev) => ({
        ...prev,
        kycLevel: result.status,
        verificationDocuments: result.documents,
        verifiedAt: result.updatedAt,
        // Update limits based on verification status
        ...(await getTransactionLimits(result.status)),
      }))
    } catch (error) {
      console.error("Failed to refresh user profile:", error)
    }
  }

  const submitUserVerification = async (
    userData: {
      firstName: string
      lastName: string
      dateOfBirth: string
      address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
      }
      email: string
      phone: string
    },
    documentType: DocumentType,
    documentFile: File,
  ) => {
    if (!wallet) {
      return { success: false, message: "No wallet available" }
    }

    try {
      const result = await submitVerification(userData, documentType, documentFile)

      if (result.success) {
        // Update the user profile to pending status
        setUserProfile((prev) => ({
          ...prev,
          kycLevel: "pending",
          personalInfo: userData,
          email: userData.email,
          phone: userData.phone,
          verificationDocuments: [
            ...prev.verificationDocuments,
            {
              id: `doc_${Date.now()}`,
              type: documentType,
              status: "pending",
              submittedAt: Date.now(),
            },
          ],
        }))
      }

      return result
    } catch (error: any) {
      console.error("Failed to submit verification:", error)
      return { success: false, message: error.message || "Failed to submit verification" }
    }
  }

  const getVerificationLimits = async (status: VerificationStatus) => {
    return await getTransactionLimits(status)
  }

  const checkTransactionAllowed = async (amount: number) => {
    return await checkTransactionLimits(amount, userProfile)
  }

  // Recovery phrase methods
  const handleGenerateRecoveryPhrase = async () => {
    return await generateRecoveryPhrase()
  }

  const handleVerifyRecoveryPhrase = async (phrase: string) => {
    return await verifyRecoveryPhrase(phrase)
  }

  const handleVerifyWithRecoveryPhrase = async (userId: string, phrase: string) => {
    try {
      const result = await verifyWithRecoveryPhrase(userId, phrase)

      if (result.success && result.newStatus) {
        // Update the user profile with the new verification status
        setUserProfile((prev) => ({
          ...prev,
          kycLevel: result.newStatus,
          recoveryPhrase: phrase,
          recoveryPhraseVerified: true,
          // Update limits based on new verification status
          ...await getTransactionLimits(result.newStatus),
        }))
      }

      return result
    } catch (error: any) {
      console.error("Failed to verify with recovery phrase:", error)
      return {
        success: false,
        message: error.message || "Failed to verify with recovery phrase",
      }
    }
  }

  // Payment method management
  const handleAddPaymentMethod = async (type: string, provider: PaymentProvider, details: Record<string, string>) => {
    try {
      const result = await addPaymentMethod(type, provider, details)

      if (result.success && result.paymentMethod) {
        // Add the new payment method to the list
        setPaymentMethods((prev) => [...prev, result.paymentMethod!])
      }

      return result
    } catch (error: any) {
      console.error("Failed to add payment method:", error)
      return {
        success: false,
        error: error.message || "Failed to add payment method",
      }
    }
  }

  const handleAddCashOutMethod = async (type: string, provider: PaymentProvider, details: Record<string, string>) => {
    try {
      const result = await addCashOutMethod(type, provider, details)

      if (result.success && result.cashOutMethod) {
        // Add the new cash out method to the list
        setCashOutMethods((prev) => [...prev, result.cashOutMethod!])
      }

      return result
    } catch (error: any) {
      console.error("Failed to add cash out method:", error)
      return {
        success: false,
        error: error.message || "Failed to add cash out method",
      }
    }
  }

  const buyCryptoWithFiat = async (
    amount: number,
    fiatCurrency: FiatCurrency,
    cryptoCurrency: CryptoCurrency,
    paymentMethodId: string,
  ) => {
    try {
      // Check if the transaction is within limits
      const limitCheck = await checkTransactionAllowed(amount)
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason,
        }
      }

      // In a real implementation, this would call an exchange API
      const result = await buyCrypto(amount, fiatCurrency, cryptoCurrency, paymentMethodId)

      if (result.success) {
        // Update used limits
        const { usedDailyLimit, usedMonthlyLimit } = await updateUsedLimits(userProfile, amount)
        setUserProfile((prev) => ({
          ...prev,
          usedDailyLimit,
          usedMonthlyLimit,
        }))

        // Simulate the purchase by updating balances

        // Find the exchange rate
        const exchangeRate = exchangeRates.find((rate) => rate.from === fiatCurrency && rate.to === cryptoCurrency) || {
          rate: 1 / marketData[cryptoCurrency]?.price || 1,
        }

        // Calculate the amount of crypto to receive
        const cryptoAmount = amount * exchangeRate.rate

        // Update crypto balance
        setCryptoAssets((prev) =>
          prev.map((asset) =>
            asset.symbol === cryptoCurrency ? { ...asset, balance: asset.balance + cryptoAmount } : asset,
          ),
        )

        // Update fiat balance
        setFiatBalances((prev) =>
          prev.map((balance) =>
            balance.currency === fiatCurrency ? { ...balance, balance: balance.balance - amount } : balance,
          ),
        )

        // Add transaction record
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: "Buy",
          amount: cryptoAmount,
          currency: cryptoCurrency,
          toCurrency: cryptoCurrency,
          fromAddress: paymentMethodId,
          timestamp: Date.now(),
          status: "completed",
          fee: amount * 0.01, // Simulate 1% fee
        }

        setTransactions((prev) => [newTransaction, ...prev])
      }

      return result
    } catch (error: any) {
      console.error("Failed to buy crypto:", error)
      return {
        success: false,
        error: error.message || "Failed to process purchase",
      }
    }
  }

  const sellCryptoForFiat = async (
    amount: number,
    cryptoCurrency: CryptoCurrency,
    fiatCurrency: FiatCurrency,
    cashOutMethodId: string,
  ) => {
    try {
      // Calculate the USD value for limit checking
      const usdValue = amount * (marketData[cryptoCurrency]?.price || 0)

      // Check if the transaction is within limits
      const limitCheck = await checkTransactionAllowed(usdValue)
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason,
        }
      }

      // Find the asset
      const asset = cryptoAssets.find((a) => a.symbol === cryptoCurrency)
      if (!asset || asset.balance < amount) {
        return {
          success: false,
          error: "Insufficient balance",
        }
      }

      // In a real implementation, this would call an exchange API
      const result = await sellCrypto(amount, cryptoCurrency, fiatCurrency, cashOutMethodId)

      if (result.success) {
        // Update used limits
        const { usedDailyLimit, usedMonthlyLimit } = await updateUsedLimits(userProfile, usdValue)
        setUserProfile((prev) => ({
          ...prev,
          usedDailyLimit,
          usedMonthlyLimit,
        }))

        // Simulate the sale by updating balances

        // Find the exchange rate
        const exchangeRate = exchangeRates.find((rate) => rate.from === cryptoCurrency && rate.to === fiatCurrency) || {
          rate: marketData[cryptoCurrency]?.price || 1,
        }

        // Calculate the amount of fiat to receive
        const fiatAmount = amount * exchangeRate.rate

        // Update crypto balance
        setCryptoAssets((prev) =>
          prev.map((asset) =>
            asset.symbol === cryptoCurrency ? { ...asset, balance: asset.balance - amount } : asset,
          ),
        )

        // Update fiat balance
        setFiatBalances((prev) =>
          prev.map((balance) =>
            balance.currency === fiatCurrency ? { ...balance, balance: balance.balance + fiatAmount } : balance,
          ),
        )

        // Add transaction record
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: "Sell",
          amount,
          currency: cryptoCurrency,
          toCurrency: fiatCurrency,
          toAddress: cashOutMethodId,
          timestamp: Date.now(),
          status: "completed",
          fee: fiatAmount * 0.01, // Simulate 1% fee
        }

        setTransactions((prev) => [newTransaction, ...prev])
      }

      return result
    } catch (error: any) {
      console.error("Failed to sell crypto:", error)
      return {
        success: false,
        error: error.message || "Failed to process sale",
      }
    }
  }

  const swapCryptoAssets = async (fromAmount: number, fromCurrency: CryptoCurrency, toCurrency: CryptoCurrency) => {
    try {
      // Calculate the USD value for limit checking
      const usdValue = fromAmount * (marketData[fromCurrency]?.price || 0)

      // Check if the transaction is within limits
      const limitCheck = await checkTransactionAllowed(usdValue)
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason,
        }
      }

      // Find the asset
      const asset = cryptoAssets.find((a) => a.symbol === fromCurrency)
      if (!asset || asset.balance < fromAmount) {
        return {
          success: false,
          error: "Insufficient balance",
        }
      }

      // In a real implementation, this would call an exchange API
      const result = await swapCrypto(fromAmount, fromCurrency, toCurrency)

      if (result.success) {
        // Update used limits
        const { usedDailyLimit, usedMonthlyLimit } = await updateUsedLimits(userProfile, usdValue)
        setUserProfile((prev) => ({
          ...prev,
          usedDailyLimit,
          usedMonthlyLimit,
        }))

        // Simulate the swap by updating balances

        // Find the exchange rate
        const exchangeRate = exchangeRates.find((rate) => rate.from === fromCurrency && rate.to === toCurrency)

        // If direct rate not found, calculate through USD
        let rate: number
        if (exchangeRate) {
          rate = exchangeRate.rate
        } else {
          const fromUsd = marketData[fromCurrency]?.price || 1
          const toUsd = marketData[toCurrency]?.price || 1
          rate = fromUsd / toUsd
        }

        // Calculate the amount of crypto to receive (with a 0.5% fee)
        const toAmount = fromAmount * rate * 0.995

        // Update balances
        setCryptoAssets((prev) =>
          prev.map((asset) => {
            if (asset.symbol === fromCurrency) {
              return { ...asset, balance: asset.balance - fromAmount }
            }
            if (asset.symbol === toCurrency) {
              return { ...asset, balance: asset.balance + toAmount }
            }
            return asset
          }),
        )

        // Add transaction record
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: "Swap",
          amount: fromAmount,
          currency: fromCurrency,
          toCurrency,
          timestamp: Date.now(),
          status: "completed",
          fee: fromAmount * 0.005, // 0.5% fee
        }

        setTransactions((prev) => [newTransaction, ...prev])
      }

      return result
    } catch (error: any) {
      console.error("Failed to swap crypto:", error)
      return {
        success: false,
        error: error.message || "Failed to process swap",
      }
    }
  }

  const resetWallet = () => {
    setWallet(null)
    setProvider(null)
    setCryptoAssets(initialCryptoAssets)
    setFiatBalances(initialFiatBalances)
    setTransactions([])
    setIsConnected(false)
    setIsSandboxMode(true)
    clearWalletData()
  }

  const getNetworkInfo = (network: string): NetworkInfo => {
    return NETWORKS[network] || NETWORKS.ethereum
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        provider,
        cryptoAssets,
        fiatBalances,
        transactions,
        isConnected,
        isSandboxMode,
        selectedNetwork,
        userProfile,
        refreshUserProfile,
        submitUserVerification,
        getVerificationLimits,
        checkTransactionAllowed,
        generateRecoveryPhrase: handleGenerateRecoveryPhrase,
        verifyRecoveryPhrase: handleVerifyRecoveryPhrase,
        verifyWithRecoveryPhrase: handleVerifyWithRecoveryPhrase,
        marketData,
        exchangeRates,
        networkFees,
        paymentMethods,
        cashOutMethods,
        addPaymentMethod: handleAddPaymentMethod,
        addCashOutMethod: handleAddCashOutMethod,
        createWallet,
        importWallet,
        connectToBlockchain,
        resetWallet,
        fetchBalances,
        refreshMarketData,
        deposit,
        withdraw,
        transfer,
        buyCryptoWithFiat,
        sellCryptoForFiat,
        swapCryptoAssets,
        setSelectedNetwork,
        getNetworkInfo,
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

type TransactionType = "Deposit" | "Withdraw" | "Transfer" | "Buy" | "Sell" | "Swap" | "Simulated"
