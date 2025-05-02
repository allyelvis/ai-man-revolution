"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import type { CryptoCurrency, FiatCurrency } from "@/lib/types"
import VerificationModal from "./verification-modal"

export default function BuySellPanel() {
  const {
    cryptoAssets,
    fiatBalances,
    marketData,
    paymentMethods,
    buyCryptoWithFiat,
    sellCryptoForFiat,
    userProfile,
    checkTransactionAllowed,
  } = useWallet()

  const [buyAmount, setBuyAmount] = useState("")
  const [buyFiatCurrency, setBuyFiatCurrency] = useState<FiatCurrency>("USD")
  const [buyCryptoCurrency, setBuyCryptoCurrency] = useState<CryptoCurrency>("BTC")
  const [buyPaymentMethod, setBuyPaymentMethod] = useState("")
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const [sellAmount, setSellAmount] = useState("")
  const [sellCryptoCurrency, setSellCryptoCurrency] = useState<CryptoCurrency>("BTC")
  const [sellFiatCurrency, setSellFiatCurrency] = useState<FiatCurrency>("USD")
  const [sellPaymentMethod, setSellPaymentMethod] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Calculate estimated crypto amount for buy
  const calculateBuyCryptoAmount = () => {
    const fiatAmount = Number.parseFloat(buyAmount) || 0
    const cryptoPrice = marketData[buyCryptoCurrency]?.price || 0
    if (cryptoPrice === 0) return 0

    // Subtract 1% fee
    return (fiatAmount * 0.99) / cryptoPrice
  }

  // Calculate estimated fiat amount for sell
  const calculateSellFiatAmount = () => {
    const cryptoAmount = Number.parseFloat(sellAmount) || 0
    const cryptoPrice = marketData[sellCryptoCurrency]?.price || 0

    // Subtract 1% fee
    return cryptoAmount * cryptoPrice * 0.99
  }

  const handleBuy = async () => {
    const amount = Number.parseFloat(buyAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!buyPaymentMethod) {
      setError("Please select a payment method")
      return
    }

    // Check transaction limits
    const limitCheck = await checkTransactionAllowed(amount)
    if (!limitCheck.allowed) {
      setError(limitCheck.reason || "Transaction exceeds your limits")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await buyCryptoWithFiat(amount, buyFiatCurrency, buyCryptoCurrency, buyPaymentMethod)

      if (result.success) {
        setBuyAmount("")
        setSuccess(`Successfully purchased ${calculateBuyCryptoAmount().toFixed(6)} ${buyCryptoCurrency}`)
      } else {
        setError(result.error || "Failed to process purchase")
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSell = async () => {
    const amount = Number.parseFloat(sellAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!sellPaymentMethod) {
      setError("Please select a payment method")
      return
    }

    // Check if user has enough balance
    const asset = cryptoAssets.find((a) => a.symbol === sellCryptoCurrency)
    if (!asset || asset.balance < amount) {
      setError("Insufficient balance")
      return
    }

    // Calculate the fiat value for limit checking
    const fiatValue = calculateSellFiatAmount()

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
      const result = await sellCryptoForFiat(amount, sellCryptoCurrency, sellFiatCurrency, sellPaymentMethod)

      if (result.success) {
        setSellAmount("")
        setSuccess(`Successfully sold ${amount} ${sellCryptoCurrency} for ${sellFiatCurrency}`)
      } else {
        setError(result.error || "Failed to process sale")
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

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
          <TabsTrigger value="sell">Sell Crypto</TabsTrigger>
        </TabsList>

        {userProfile.kycLevel === "none" && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
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

        <TabsContent value="buy" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select value={buyFiatCurrency} onValueChange={(value) => setBuyFiatCurrency(value as FiatCurrency)}>
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
              <div>
                <Select
                  value={buyCryptoCurrency}
                  onValueChange={(value) => setBuyCryptoCurrency(value as CryptoCurrency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoAssets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.name} ({asset.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Input
              type="number"
              placeholder={`Amount in ${buyFiatCurrency}`}
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
            />

            {buyAmount && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">You'll receive approximately:</div>
                <div className="font-medium">
                  {calculateBuyCryptoAmount().toFixed(6)} {buyCryptoCurrency}
                </div>
              </div>
            )}

            <Select value={buyPaymentMethod} onValueChange={setBuyPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleBuy} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Buy ${buyCryptoCurrency}`
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={sellCryptoCurrency}
                  onValueChange={(value) => setSellCryptoCurrency(value as CryptoCurrency)}
                >
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
                <Select value={sellFiatCurrency} onValueChange={(value) => setSellFiatCurrency(value as FiatCurrency)}>
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

            <Input
              type="number"
              placeholder={`Amount in ${sellCryptoCurrency}`}
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />

            {sellAmount && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">You'll receive approximately:</div>
                <div className="font-medium">
                  {sellFiatCurrency === "USD" ? "$" : sellFiatCurrency === "EUR" ? "€" : "£"}
                  {calculateSellFiatAmount().toFixed(2)}
                </div>
              </div>
            )}

            <Select value={sellPaymentMethod} onValueChange={setSellPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select Payout Method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSell} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Sell ${sellCryptoCurrency}`
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      <VerificationModal open={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
    </div>
  )
}
