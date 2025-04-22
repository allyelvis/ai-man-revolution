import { MarketplaceHeader } from "@/components/marketplace-header"
import { TokenList } from "@/components/token-list"
import { PaymentOptions } from "@/components/payment-options"

export default function MarketplacePage() {
  return (
    <main className="container py-12 md:py-24">
      <MarketplaceHeader />
      <TokenList />
      <PaymentOptions />
    </main>
  )
}
