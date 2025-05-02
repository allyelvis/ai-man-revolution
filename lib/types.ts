// Currency types
export type FiatCurrency = "USD" | "EUR" | "GBP" | "JPY"
export type CryptoCurrency = "BTC" | "ETH" | "USDT" | "USDC" | "DAI" | "SOL" | "MATIC"

// Market data
export interface MarketData {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: string
}

export interface CryptoAsset {
  symbol: CryptoCurrency
  name: string
  balance: number
  marketData?: MarketData
  address?: string // For tokens that have their own address
  network: string
  decimals: number
  logoUrl: string
}

export interface FiatBalance {
  currency: FiatCurrency
  balance: number
  symbol: string
}

// Transaction types
export type TransactionType = "Deposit" | "Withdraw" | "Transfer" | "Swap" | "Buy" | "Sell" | "CashOut" | "Simulated"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  fee?: number
  currency: CryptoCurrency | FiatCurrency
  toCurrency?: CryptoCurrency | FiatCurrency
  toAddress?: string
  fromAddress?: string
  timestamp: number
  status: "pending" | "completed" | "failed"
  hash?: string
  network?: string
}

// Exchange rates
export interface ExchangeRate {
  from: CryptoCurrency | FiatCurrency
  to: CryptoCurrency | FiatCurrency
  rate: number
  lastUpdated: string
}

// Fee structure
export interface FeeEstimate {
  slow: number
  average: number
  fast: number
  lastUpdated: string
}

// Network information
export interface NetworkInfo {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorerUrl: string
  currencySymbol: string
  logoUrl: string
  isTestnet: boolean
}

// KYC verification status
export type VerificationStatus = "none" | "pending" | "basic" | "full" | "rejected"

// Verification document types
export type DocumentType = "passport" | "national_id" | "driving_license" | "utility_bill" | "bank_statement"

// Verification document
export interface VerificationDocument {
  id: string
  type: DocumentType
  status: "pending" | "approved" | "rejected"
  submittedAt: number
  reviewedAt?: number
  rejectionReason?: string
  fileUrl?: string
}

// Enhanced user profile with verification details
export interface UserProfile {
  kycLevel: VerificationStatus
  dailyLimit: number
  monthlyLimit: number
  usedDailyLimit: number
  usedMonthlyLimit: number
  email?: string
  phone?: string
  verifiedAt?: number
  verificationDocuments: VerificationDocument[]
  recoveryPhrase?: string
  recoveryPhraseVerified?: boolean
  personalInfo?: {
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
  }
}

// Transaction limits by verification level
export interface TransactionLimits {
  daily: number
  monthly: number
  perTransaction: number
}

// Payment providers
export type PaymentProvider =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "paypal"
  | "bank"
  | "mpesa"
  | "mtn"
  | "airtel"
  | "venmo"
  | "cashapp"
  | "alipay"
  | "wechat"

// Payment method for buying crypto
export interface PaymentMethod {
  id: string
  type: "card" | "bank" | "digital_wallet" | "mobile_money"
  provider: PaymentProvider
  name: string
  last4?: string
  expiryDate?: string
  email?: string
  phoneNumber?: string
  isDefault: boolean
}

// Cash out method
export interface CashOutMethod {
  id: string
  type: "bank" | "digital_wallet" | "mobile_money" | "card"
  provider: PaymentProvider
  name: string
  accountNumber?: string
  routingNumber?: string
  email?: string
  phoneNumber?: string
  last4?: string
  isDefault: boolean
}
