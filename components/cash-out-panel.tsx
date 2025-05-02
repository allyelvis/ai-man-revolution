"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import type { CryptoCurrency, FiatCurrency } from "@/lib/types"
import VerificationModal from "./verification-modal"

export default function CashOutPanel() {
  const { cryptoAssets, marketData, cashOutMethods, sellCryptoForFiat, userProfile, checkTransactionAllowed } =
    useWallet()

  const [amount, setAmount] = useState("")
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoCurrency>("BTC")
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>("USD")
  const [cashOutMethod, setCashOutMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Calculate estimated fiat amount
  const calculateFiatAmount = () => {
    const cryptoAmount = Number.parseFloat(amount) || 0
    const cryptoPrice = marketData[cryptoCurrency]?.price || 0

    // Subtract 1.5% fee for cash out (higher than regular sell)
    return cryptoAmount * cryptoPrice * 0.985
  }

  const handleCashOut = async () => {
    const cryptoAmount = Number.parseFloat(amount)
    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!cashOutMethod) {
      setError("Please select a cash out method")
      return
    }

    // Check if user has enough balance
    const asset = cryptoAssets.find((a) => a.symbol === cryptoCurrency)
    if (!asset || asset.balance < cryptoAmount) {
      setError("Insufficient balance")
      return
    }

    // Calculate the fiat value for limit checking
    const fiatValue = calculateFiatAmount()

    // Check transaction limits
    const limitCheck = await checkTransactionAllowed(fiatValue)
    if (!limitCheck.allowed) {
      setError(limitCheck.reason || "Transaction exceeds your limits")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await sellCryptoForFiat(cryptoAmount, cryptoCurrency, fiatCurrency, cashOutMethod)

      if (result.success) {
        setAmount("")
        setSuccess(
          `Successfully initiated cash out of ${cryptoAmount} ${cryptoCurrency} to your ${cashOutMethods.find((m) => m.id === cashOutMethod)?.name}`,
        )
      } else {
        setError(result.error || "Failed to process cash out")
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

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select value={cryptoCurrency} onValueChange={(value) => setCryptoCurrency(value as CryptoCurrency)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Crypto" />
              </SelectTrigger>
              <SelectContent>
                {cryptoAssets
                  .filter((asset) => asset.balance > 0)
                  .map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      {asset.name} ({asset.symbol})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={fiatCurrency} onValueChange={(value) => setFiatCurrency(value as FiatCurrency)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Fiat Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Amount to Cash Out</label>
            <span className="text-xs text-muted-foreground">
              Balance: {cryptoAssets.find((a) => a.symbol === cryptoCurrency)?.balance.toFixed(6) || "0"}{" "}
              {cryptoCurrency}
            </span>
          </div>
          <Input
            type="number"
            placeholder={`Amount in ${cryptoCurrency}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {amount && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">You'll receive approximately:</div>
            <div className="font-medium">
              {fiatCurrency === "USD" ? "$" : fiatCurrency === "EUR" ? "€" : "£"}
              {calculateFiatAmount().toFixed(2)}
            </div>
          </div>
        )}

        <Select value={cashOutMethod} onValueChange={setCashOutMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select Cash Out Method" />
          </SelectTrigger>
          <SelectContent>
            {cashOutMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground">Cash out fee: 1.5% • Processing time: 1-3 business days</div>

        <Button onClick={handleCashOut} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Cash Out ${cryptoCurrency} to ${fiatCurrency}`
          )}
        </Button>
      </div>
      <VerificationModal open={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
    </div>
  )
}
