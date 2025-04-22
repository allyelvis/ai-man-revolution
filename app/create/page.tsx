import { CreateTokenForm } from "@/components/create-token-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateNFTForm } from "@/components/create-nft-form"

export default function CreatePage() {
  return (
    <main className="container max-w-5xl py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create Digital Assets</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Generate fungible tokens or NFTs with just a few clicks
        </p>
      </div>

      <Tabs defaultValue="token" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="token">Fungible Token (ERC-20)</TabsTrigger>
          <TabsTrigger value="nft">NFT Collection (ERC-721/1155)</TabsTrigger>
        </TabsList>
        <TabsContent value="token">
          <CreateTokenForm />
        </TabsContent>
        <TabsContent value="nft">
          <CreateNFTForm />
        </TabsContent>
      </Tabs>
    </main>
  )
}
