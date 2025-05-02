"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, ArrowDown, RefreshCw, AlertTriangle } from "lucide-react"
import type { CryptoCurrency } from "@/lib/types"
import VerificationModal from "./verification-modal"

export default function SwapPanel() {
  const { cryptoAssets, marketData, exchangeRates, swapCryptoAssets, userProfile, checkTransactionAllowed } =
    useWallet()

  const [fromAmount, setFromAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState<CryptoCurrency>("ETH")
  const [toCurrency, setToCurrency] = useState<CryptoCurrency>("BTC")
  const [toAmount, setToAmount] = useState("")
  const [rate, setRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Update the exchange rate when currencies change
  useEffect(() => {
    updateRate()
  }, [fromCurrency, toCurrency, marketData])

  // Update the to amount when from amount or rate changes
  useEffect(() => {
    if (rate !== null && fromAmount) {
      const amount = Number.parseFloat(fromAmount) || 0
      setToAmount((amount * rate * 0.995).toFixed(6)) // Apply 0.5% fee
    } else {
      setToAmount("")
    }
  }, [fromAmount, rate])

  const updateRate = () => {
    // Find direct exchange rate if available
    const directRate = exchangeRates.find((rate) => rate.from === fromCurrency && rate.to === toCurrency)

    if (directRate) {
      setRate(directRate.rate)
      return
    }

    // Otherwise calculate through USD prices
    const fromPrice = marketData[fromCurrency]?.price || 0
    const toPrice = marketData[toCurrency]?.price || 0

    if (fromPrice > 0 && toPrice > 0) {
      setRate(fromPrice / toPrice)
    } else {
      setRate(null)
    }
  }

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)

    // Clear amounts
    setFromAmount("")
    setToAmount("")
  }

  const handleSwap = async () => {
    const amount = Number.parseFloat(fromAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Check if user has enough balance
    const asset = cryptoAssets.find((a) => a.symbol === fromCurrency)
    if (!asset || asset.balance < amount) {
      setError("Insufficient balance")
      return
    }

    // Calculate the USD value for limit checking
    const fromUsdPrice = marketData[fromCurrency]?.price || 0
    const usdValue = amount * fromUsdPrice

    // Check transaction limits
    const limitCheck = await checkTransactionAllowed(usdValue)
    if (!limitCheck.allowed) {
      setError(limitCheck.reason || "Transaction exceeds your limits")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await swapCryptoAssets(amount, fromCurrency, toCurrency)

      if (result.success) {
        setFromAmount("")
        setToAmount("")
        setSuccess(`Successfully swapped ${amount} ${fromCurrency} for ${toAmount} ${toCurrency}`)
      } else {
        setError(result.error || "Failed to process swap")
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {userProfile.kycLevel === "none" && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Your account is not verified. Transaction limits apply.{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-amber-700 underline"
              onClick={() => setShowVerificationModal(true)}
            >
              Verify now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">From</label>
          <span className="text-xs text-muted-foreground">
            Balance: {cryptoAssets.find((a) => a.symbol === fromCurrency)?.balance.toFixed(6) || "0"} {fromCurrency}
          </span>
        </div>
        <div className="flex space-x-2">
          <Select value={fromCurrency} onValueChange={(value) => setFromCurrency(value as CryptoCurrency)}>
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {cryptoAssets
                .filter((asset) => asset.symbol !== toCurrency)
                .map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="w-2/3"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="icon" onClick={handleSwapCurrencies} className="rounded-full h-8 w-8">
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">To</label>
          <span className="text-xs text-muted-foreground">
            Balance: {cryptoAssets.find((a) => a.symbol === toCurrency)?.balance.toFixed(6) || "0"} {toCurrency}
          </span>
        </div>
        <div className="flex space-x-2">
          <Select value={toCurrency} onValueChange={(value) => setToCurrency(value as CryptoCurrency)}>
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {cryptoAssets
                .filter((asset) => asset.symbol !== fromCurrency)
                .map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input type="text" placeholder="Amount" value={toAmount} readOnly className="w-2/3 bg-gray-50" />
        </div>
      </div>

      {rate !== null && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="text-sm">
            1 {fromCurrency} ≈ {rate.toFixed(6)} {toCurrency}
          </div>
          <Button variant="ghost" size="sm" onClick={updateRate} className="h-6 w-6 p-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">Fee: 0.5% • Estimated slippage: 0.1-0.5%</div>

      <Button onClick={handleSwap} className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Swap ${fromCurrency} to ${toCurrency}`
        )}
      </Button>

      <VerificationModal open={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
    </div>
  )
}
