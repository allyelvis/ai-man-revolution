import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react"

export function PaymentOptions() {
  return (
    <section className="mb-12">
      <div className="flex flex-col items-center space-y-4 text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Multiple Payment Options</h2>
        <p className="max-w-[700px] text-muted-foreground">
          Choose from a variety of payment methods to buy and sell digital assets
        </p>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="crypto" className="flex flex-col gap-2 py-4 h-auto">
            <Wallet className="h-5 w-5 mx-auto" />
            <span>Crypto</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex flex-col gap-2 py-4 h-auto">
            <Landmark className="h-5 w-5 mx-auto" />
            <span>Bank Transfer</span>
          </TabsTrigger>
          <TabsTrigger value="card" className="flex flex-col gap-2 py-4 h-auto">
            <CreditCard className="h-5 w-5 mx-auto" />
            <span>Card/PayPal</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex flex-col gap-2 py-4 h-auto">
            <Smartphone className="h-5 w-5 mx-auto" />
            <span>Mobile Money</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Payments</CardTitle>
              <CardDescription>The fastest and most direct way to purchase tokens</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                  </div>
                  <h3 className="font-medium">Direct Wallet Transfer</h3>
                  <p className="text-sm text-muted-foreground">Connect your wallet and transfer crypto directly</p>
                </div>
                <div className="border rounded-lg p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                  </div>
                  <h3 className="font-medium">Cross-Chain Swaps</h3>
                  <p className="text-sm text-muted-foreground">Swap tokens across different blockchain networks</p>
                </div>
                <div className="border rounded-lg p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500"></div>
                  </div>
                  <h3 className="font-medium">Stablecoin Payments</h3>
                  <p className="text-sm text-muted-foreground">Use USDC, USDT, or DAI for stable-value transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>Traditional banking options for purchasing tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Wire Transfer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send funds directly from your bank account. Processing time: 1-3 business days.
                  </p>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">Requirements:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Government-issued ID</li>
                      <li>Proof of address</li>
                      <li>Bank account details</li>
                    </ul>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">SEPA/ACH Transfers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use SEPA (EU) or ACH (US) for lower-cost transfers. Processing time: 1-2 business days.
                  </p>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">Supported regions:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>European Union (SEPA)</li>
                      <li>United States (ACH)</li>
                      <li>United Kingdom (Faster Payments)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Card & PayPal</CardTitle>
              <CardDescription>Fast and convenient payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex flex-col gap-2">
                  <h3 className="font-medium">Credit/Debit Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant purchases with Visa, Mastercard, or American Express
                  </p>
                  <div className="flex gap-2 mt-2">
                    <div className="w-10 h-6 bg-muted rounded"></div>
                    <div className="w-10 h-6 bg-muted rounded"></div>
                    <div className="w-10 h-6 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex flex-col gap-2">
                  <h3 className="font-medium">PayPal</h3>
                  <p className="text-sm text-muted-foreground">Secure payments using your PayPal account</p>
                  <div className="mt-2 p-2 bg-muted rounded-md text-xs text-muted-foreground">
                    <p>Fee: 3.5% + fixed fee based on currency</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex flex-col gap-2">
                  <h3 className="font-medium">Apple/Google Pay</h3>
                  <p className="text-sm text-muted-foreground">Quick checkout with your mobile wallet</p>
                  <div className="mt-2 p-2 bg-muted rounded-md text-xs text-muted-foreground">
                    <p>Available on mobile devices only</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Money</CardTitle>
              <CardDescription>Payment options for regions with limited banking infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Mobile Money Services</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use popular mobile money services to purchase tokens directly from your phone.
                  </p>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">Supported services:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>M-Pesa (Africa)</li>
                      <li>GCash (Philippines)</li>
                      <li>Paytm (India)</li>
                      <li>MTN Mobile Money (Africa)</li>
                    </ul>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">SMS Payments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Purchase tokens via SMS in regions with limited internet connectivity.
                  </p>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <p className="font-medium">How it works:</p>
                    <ol className="list-decimal list-inside text-muted-foreground">
                      <li>Register your phone number</li>
                      <li>Receive a verification code</li>
                      <li>Send payment SMS with code</li>
                      <li>Receive tokens in your wallet</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
