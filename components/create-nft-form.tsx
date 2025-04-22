"use client"

import type React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi"
import { ConnectKitButton } from "connectkit"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Collection name must be at least 2 characters.",
  }),
  symbol: z
    .string()
    .min(1, {
      message: "Collection symbol is required.",
    })
    .max(8, {
      message: "Collection symbol must be 8 characters or less.",
    }),
  description: z.string().optional(),
  standard: z.enum(["ERC721", "ERC1155"]),
  supply: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Supply must be a positive number.",
  }),
  royalty: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10, {
    message: "Royalty must be between 0% and 10%.",
  }),
  network: z.string(),
})

export function CreateNFTForm() {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "success" | "error">("idle")
  const [collectionAddress, setCollectionAddress] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      standard: "ERC721",
      supply: "10000",
      royalty: "2.5",
      network: "ethereum",
    },
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy an NFT collection",
        variant: "destructive",
      })
      return
    }

    // Switch network if needed
    if (values.network === "ethereum" && chain?.id !== 1) {
      switchNetwork?.(1)
      return
    } else if (values.network === "base" && chain?.id !== 8453) {
      switchNetwork?.(8453)
      return
    }

    setIsDeploying(true)
    setDeploymentStatus("idle")

    try {
      // Simulate NFT collection deployment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful deployment
      setDeploymentStatus("success")
      setCollectionAddress("0x9876543210987654321098765432109876543210")

      toast({
        title: "NFT Collection deployed successfully!",
        description: `Your ${values.name} collection has been created.`,
      })
    } catch (error) {
      setDeploymentStatus("error")
      toast({
        title: "Deployment failed",
        description: "There was an error deploying your NFT collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My NFT Collection" {...field} />
                    </FormControl>
                    <FormDescription>The name of your NFT collection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MNFT" {...field} />
                    </FormControl>
                    <FormDescription>The ticker symbol for your collection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="standard"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>NFT Standard</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ERC721" id="erc721" />
                          <Label htmlFor="erc721">ERC-721 (Unique NFTs)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ERC1155" id="erc1155" />
                          <Label htmlFor="erc1155">ERC-1155 (Multi-token standard)</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Choose the token standard for your NFT collection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Supply</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Maximum number of NFTs in this collection</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="royalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Royalty Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>Percentage of secondary sales (0-10%)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                        <SelectItem value="baseGoerli">Base Goerli Testnet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The blockchain network to deploy your collection on</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Label htmlFor="image-upload">Collection Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload an image for your collection (recommended size: 350x350px)
                </p>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of your NFT collection"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {deploymentStatus === "success" && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>NFT Collection deployed successfully!</AlertTitle>
                <AlertDescription>
                  Your collection has been deployed to address:{" "}
                  <code className="bg-green-100 px-1 py-0.5 rounded">{collectionAddress}</code>
                </AlertDescription>
              </Alert>
            )}

            {deploymentStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deployment failed</AlertTitle>
                <AlertDescription>
                  There was an error deploying your NFT collection. Please check your wallet and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              {!isConnected ? (
                <ConnectKitButton />
              ) : (
                <Button type="submit" disabled={isDeploying}>
                  {isDeploying ? "Deploying..." : "Deploy Collection"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
