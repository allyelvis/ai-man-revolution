"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, CreditCard, Building, Smartphone, Wallet } from "lucide-react"
import type { PaymentProvider } from "@/lib/types"

interface PaymentMethodFormProps {
  open: boolean
  onClose: () => void
  type: "payment" | "cashout"
}

export default function PaymentMethodForm({ open, onClose, type }: PaymentMethodFormProps) {
  const { addPaymentMethod, addCashOutMethod } = useWallet()
  const [activeTab, setActiveTab] = useState("card")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    cardProvider: "visa" as PaymentProvider,
  })

  // Bank form state
  const [bankData, setBankData] = useState({
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    bankName: "",
  })

  // PayPal form state
  const [paypalData, setPaypalData] = useState({
    email: "",
  })

  // Mobile Money form state
  const [mobileData, setMobileData] = useState({
    phoneNumber: "",
    provider: "mpesa" as PaymentProvider,
  })

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBankData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaypalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaypalData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMobileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      let result

      switch (activeTab) {
        case "card":
          if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expiryDate || !cardData.cvv) {
            setError("Please fill in all card details")
            setIsLoading(false)
            return
          }

          result =
            type === "payment"
              ? await addPaymentMethod("card", cardData.cardProvider, {
                  cardNumber: cardData.cardNumber,
                  cardholderName: cardData.cardholderName,
                  expiryDate: cardData.expiryDate,
                  cvv: cardData.cvv,
                  last4: cardData.cardNumber.slice(-4),
                })
              : await addCashOutMethod("card", cardData.cardProvider, {
                  cardNumber: cardData.cardNumber,
                  cardholderName: cardData.cardholderName,
                  expiryDate: cardData.expiryDate,
                  cvv: cardData.cvv,
                  last4: cardData.cardNumber.slice(-4),
                })
          break

        case "bank":
          if (!bankData.accountNumber || !bankData.routingNumber || !bankData.accountHolderName || !bankData.bankName) {
            setError("Please fill in all bank details")
            setIsLoading(false)
            return
          }

          result =
            type === "payment"
              ? await addPaymentMethod("bank", "bank", {
                  accountNumber: bankData.accountNumber,
                  routingNumber: bankData.routingNumber,
                  accountHolderName: bankData.accountHolderName,
                  bankName: bankData.bankName,
                  accountLast4: bankData.accountNumber.slice(-4),
                })
              : await addCashOutMethod("bank", "bank", {
                  accountNumber: bankData.accountNumber,
                  routingNumber: bankData.routingNumber,
                  accountHolderName: bankData.accountHolderName,
                  bankName: bankData.bankName,
                })
          break

        case "paypal":
          if (!paypalData.email) {
            setError("Please enter your PayPal email")
            setIsLoading(false)
            return
          }

          result =
            type === "payment"
              ? await addPaymentMethod("digital_wallet", "paypal", {
                  email: paypalData.email,
                })
              : await addCashOutMethod("digital_wallet", "paypal", {
                  email: paypalData.email,
                })
          break

        case "mobile":
          if (!mobileData.phoneNumber) {
            setError("Please enter your phone number")
            setIsLoading(false)
            return
          }

          result =
            type === "payment"
              ? await addPaymentMethod("mobile_money", mobileData.provider, {
                  phoneNumber: mobileData.phoneNumber,
                })
              : await addCashOutMethod("mobile_money", mobileData.provider, {
                  phoneNumber: mobileData.phoneNumber,
                })
          break

        default:
          setError("Invalid payment method type")
          setIsLoading(false)
          return
      }

      if (result.success) {
        setSuccess(`${type === "payment" ? "Payment" : "Cash out"} method added successfully`)

        // Reset form data
        setCardData({
          cardNumber: "",
          cardholderName: "",
          expiryDate: "",
          cvv: "",
          cardProvider: "visa",
        })

        setBankData({
          accountNumber: "",
          routingNumber: "",
          accountHolderName: "",
          bankName: "",
        })

        setPaypalData({
          email: "",
        })

        setMobileData({
          phoneNumber: "",
          provider: "mpesa",
        })
      } else {
        setError(result.error || "Failed to add payment method")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add {type === "payment" ? "Payment" : "Cash Out"} Method</DialogTitle>
          <DialogDescription>
            Add a new {type === "payment" ? "payment" : "cash out"} method to your account.
          </DialogDescription>
        </DialogHeader>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="card" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Card</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bank</span>
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardProvider">Card Type</Label>
                <Select
                  value={cardData.cardProvider}
                  onValueChange={(value) =>
                    setCardData((prev) => ({ ...prev, cardProvider: value as PaymentProvider }))
                  }
                >
                  <SelectTrigger id="cardProvider">
                    <SelectValue placeholder="Select Card Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  value={cardData.cardholderName}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Card"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={bankData.bankName}
                  onChange={handleBankInputChange}
                  placeholder="Chase Bank"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  name="accountHolderName"
                  value={bankData.accountHolderName}
                  onChange={handleBankInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={bankData.accountNumber}
                  onChange={handleBankInputChange}
                  placeholder="123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  value={bankData.routingNumber}
                  onChange={handleBankInputChange}
                  placeholder="987654321"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Bank Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">PayPal Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={paypalData.email}
                  onChange={handlePaypalInputChange}
                  placeholder="your-email@example.com"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add PayPal Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobileProvider">Mobile Money Provider</Label>
                <Select
                  value={mobileData.provider}
                  onValueChange={(value) => setMobileData((prev) => ({ ...prev, provider: value as PaymentProvider }))}
                >
                  <SelectTrigger id="mobileProvider">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={mobileData.phoneNumber}
                  onChange={handleMobileInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Mobile Money"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
