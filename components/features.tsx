import { Coins, Image, Wallet, ArrowLeftRight, CreditCard, Shield } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Coins className="h-10 w-10 text-blue-500" />,
      title: "Fungible Tokens",
      description: "Create your own ERC-20 tokens with customizable supply, name, and symbol.",
    },
    {
      icon: <Image className="h-10 w-10 text-purple-500" />,
      title: "NFT Collections",
      description: "Mint unique digital assets as ERC-721 or ERC-1155 tokens with metadata support.",
    },
    {
      icon: <Wallet className="h-10 w-10 text-green-500" />,
      title: "Wallet Integration",
      description: "Connect with MetaMask, WalletConnect, Coinbase Wallet and other popular providers.",
    },
    {
      icon: <ArrowLeftRight className="h-10 w-10 text-amber-500" />,
      title: "Token Exchange",
      description: "Buy, sell, and swap tokens directly on the platform with low fees.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-rose-500" />,
      title: "Multiple Payment Options",
      description: "Support for bank transfers, PayPal, and mobile money platforms.",
    },
    {
      icon: <Shield className="h-10 w-10 text-indigo-500" />,
      title: "Security First",
      description: "Built with security best practices and audited smart contracts.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to create and manage digital assets on the blockchain
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-2 rounded-full bg-muted">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
