"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, LinkIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { CryptoCurrency } from "@/lib/types"
import WalletHeader from "./wallet-header"
import TransactionHistory from "./transaction-history"
import AssetList from "./asset-list"
import NetworkSelector from "./network-selector"
import BuySellPanel from "./buy-sell-panel"
import SwapPanel from "./swap-panel"
import CashOutPanel from "./cash-out-panel"
import VerificationStatus from "./verification-status"

export default function WalletInterface() {
  const {
    wallet,
    createWallet,
    importWallet,
    connectToBlockchain,
    resetWallet,
    isConnected,
    isSandboxMode,
    refreshMarketData,
  } = useWallet()

  const [privateKey, setPrivateKey] = useState("")
  const [showImportField, setShowImportField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [useCustomRpc, setUseCustomRpc] = useState(false)
  const [customRpcUrl, setCustomRpcUrl] = useState("")

  const handleCreateWallet = () => {
    createWallet()
    setError(null)
    setInfoMessage(null)
  }

  const handleImportWallet = () => {
    if (!showImportField) {
      setShowImportField(true)
      return
    }

    if (!privateKey.trim()) {
      setError("Please enter a private key")
      return
    }

    const success = importWallet(privateKey.trim())
    if (success) {
      setPrivateKey("")
      setShowImportField(false)
      setError(null)
      setInfoMessage(null)
    } else {
      setError("Invalid private key")
    }
  }

  const validateRpcUrl = (url: string): boolean => {
    try {
      // Basic URL validation
      const urlObj = new URL(url)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch (e) {
      return false
    }
  }

  const handleConnect = async () => {
    if (!wallet) {
      setError("Create or import a wallet first")
      return
    }

    // Validate custom RPC URL if enabled
    if (useCustomRpc) {
      if (!customRpcUrl.trim()) {
        setError("Please enter an RPC URL")
        return
      }

      if (!validateRpcUrl(customRpcUrl)) {
        setError("Invalid RPC URL. Please enter a valid HTTP or HTTPS URL")
        return
      }
    }

    setIsLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const result = await connectToBlockchain(useCustomRpc ? customRpcUrl : undefined)

      if (result.success) {
        setInfoMessage(
          useCustomRpc
            ? `Successfully connected to the blockchain using custom RPC: ${customRpcUrl}`
            : "Successfully connected to the Ethereum blockchain",
        )

        // Refresh market data after connecting
        await refreshMarketData()
      } else {
        // If connection failed, show error but enable sandbox mode
        setError(`${result.message}. Continuing in sandbox mode.`)
        setInfoMessage("Sandbox mode is active. All transactions will be simulated.")
      }
    } catch (err: any) {
      console.error("Connection error:", err)
      setError(`Connection error: ${err.message || "Unknown error"}. Continuing in sandbox mode.`)
      setInfoMessage("Sandbox mode is active. All transactions will be simulated.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your wallet? This action cannot be undone.")) {
      resetWallet()
      setShowImportField(false)
      setPrivateKey("")
      setError(null)
      setInfoMessage(null)
      setUseCustomRpc(false)
      setCustomRpcUrl("")
    }
  }

  return (
    <div className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-center">Crypto Management System</CardTitle>
        <CardDescription className="text-center">
          Manage your crypto assets, trade, and cash out to fiat
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <WalletHeader />

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {infoMessage && (
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">{infoMessage}</AlertDescription>
          </Alert>
        )}

        {isSandboxMode && isConnected && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              Running in sandbox mode. Transactions will be simulated.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {!wallet ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleCreateWallet}>Create Wallet</Button>
                <Button onClick={handleImportWallet} variant="outline">
                  Import Wallet
                </Button>
              </div>

              {showImportField && (
                <Input
                  type="text"
                  placeholder="Private Key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          ) : (
            <>
              <AssetList />
              <VerificationStatus />

              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="buy">Buy & Sell</TabsTrigger>
                  <TabsTrigger value="swap">Swap</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="cashout">Cash Out</TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-4">
                  <BuySellPanel />
                </TabsContent>

                <TabsContent value="swap" className="space-y-4">
                  <SwapPanel />
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4">
                  <TransferPanel />
                </TabsContent>

                <TabsContent value="cashout" className="space-y-4">
                  <CashOutPanel />
                </TabsContent>
              </Tabs>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="connection-settings">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connection Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <NetworkSelector />

                      <div className="flex items-center space-x-2">
                        <Switch id="custom-rpc" checked={useCustomRpc} onCheckedChange={setUseCustomRpc} />
                        <Label htmlFor="custom-rpc">Use Custom RPC URL</Label>
                      </div>

                      {useCustomRpc && (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Enter RPC URL (e.g., https://mainnet.infura.io/v3/your-api-key)"
                            value={customRpcUrl}
                            onChange={(e) => setCustomRpcUrl(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter a valid HTTP or HTTPS URL for your blockchain RPC endpoint
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleConnect}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to Blockchain"
                  )}
                </Button>

                <Button onClick={handleReset} variant="destructive" disabled={isLoading}>
                  Reset Wallet
                </Button>
              </div>

              <TransactionHistory />
            </>
          )}
        </div>
      </CardContent>
    </div>
  )
}

// Transfer Panel Component
function TransferPanel() {
  const { cryptoAssets, transfer, marketData, checkTransactionAllowed } = useWallet()
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>("ETH")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Update the handleTransfer function to better handle errors
  const handleTransfer = async () => {
    if (!to.trim()) {
      setError("Please enter a receiver address")
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check transaction limits first
      const usdValue = parsedAmount * (marketData[selectedCurrency]?.price || 0)
      const limitCheck = await checkTransactionAllowed(usdValue)

      if (!limitCheck.allowed) {
        setError(limitCheck.reason || "Transaction exceeds your limits")
        setIsLoading(false)
        return
      }

      const result = await transfer(to.trim(), parsedAmount, selectedCurrency)
      if (result) {
        setTo("")
        setAmount("")
        setSuccess(`Successfully transferred ${parsedAmount} ${selectedCurrency} to ${to.substring(0, 10)}...`)
      } else {
        setError("Failed to send transaction. Please check your balance and try again.")
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

      <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as CryptoCurrency)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Currency" />
        </SelectTrigger>
        <SelectContent>
          {cryptoAssets.map((asset) => (
            <SelectItem key={asset.symbol} value={asset.symbol}>
              {asset.name} ({asset.symbol})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input type="text" placeholder="Receiver Address" value={to} onChange={(e) => setTo(e.target.value)} />

      <Input
        type="number"
        placeholder="Amount to Transfer"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button onClick={handleTransfer} className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Transfer ${selectedCurrency}`
        )}
      </Button>
    </div>
  )
}
