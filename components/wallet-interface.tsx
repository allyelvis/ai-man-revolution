"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import WalletHeader from "./wallet-header"
import TransactionHistory from "./transaction-history"

export default function WalletInterface() {
  const {
    wallet,
    createWallet,
    importWallet,
    connectToBlockchain,
    deposit,
    withdraw,
    transfer,
    resetWallet,
    isConnected,
  } = useWallet()

  const [privateKey, setPrivateKey] = useState("")
  const [showImportField, setShowImportField] = useState(false)
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateWallet = () => {
    createWallet()
    setError(null)
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
    } else {
      setError("Invalid private key")
    }
  }

  const handleDeposit = () => {
    const amount = Number.parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    deposit(amount, selectedToken)
    setDepositAmount("")
    setError(null)
  }

  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const success = withdraw(amount, selectedToken)
    if (success) {
      setWithdrawAmount("")
      setError(null)
    } else {
      setError("Insufficient balance")
    }
  }

  const handleTransfer = async () => {
    if (!transferTo.trim()) {
      setError("Please enter a receiver address")
      return
    }

    const amount = Number.parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await transfer(transferTo.trim(), amount)
      if (success) {
        setTransferTo("")
        setTransferAmount("")
      } else {
        setError("Failed to send transaction")
      }
    } catch (err) {
      setError("Transaction failed")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!wallet) {
      setError("Create or import a wallet first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await connectToBlockchain()
    } catch (err) {
      setError("Failed to connect to blockchain")
      console.error(err)
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
    }
  }

  return (
    <div className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-center">Sandbox Crypto Wallet</CardTitle>
        <CardDescription className="text-center">Create, manage, and interact with your crypto wallet</CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <WalletHeader />

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
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

          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH (Native)</SelectItem>
                  <SelectItem value="USDT">USDT (ERC20)</SelectItem>
                  <SelectItem value="DAI">DAI (ERC20)</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Amount to Deposit (Sandbox)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />

              <Button onClick={handleDeposit} className="w-full" disabled={!wallet}>
                Deposit
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH (Native)</SelectItem>
                  <SelectItem value="USDT">USDT (ERC20)</SelectItem>
                  <SelectItem value="DAI">DAI (ERC20)</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Amount to Withdraw (Sandbox)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />

              <Button onClick={handleWithdraw} className="w-full" disabled={!wallet}>
                Withdraw
              </Button>
            </TabsContent>

            <TabsContent value="transfer" className="space-y-4">
              <Input
                type="text"
                placeholder="Receiver Address"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Amount to Transfer (ETH Only)"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />

              <Button onClick={handleTransfer} className="w-full" disabled={!wallet || !isConnected || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Transfer Real ETH"
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleConnect}
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!wallet || isConnected || isLoading}
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
        </div>
      </CardContent>
    </div>
  )
}
