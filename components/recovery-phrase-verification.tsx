"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Info, Copy, Check, Eye, EyeOff, KeyRound } from "lucide-react"

interface RecoveryPhraseVerificationProps {
  open: boolean
  onClose: () => void
}

export default function RecoveryPhraseVerification({ open, onClose }: RecoveryPhraseVerificationProps) {
  const { userProfile, generateRecoveryPhrase, verifyWithRecoveryPhrase } = useWallet()
  const [activeTab, setActiveTab] = useState("generate")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [showPhrase, setShowPhrase] = useState(false)
  const [copied, setCopied] = useState(false)
  const [verificationPhrase, setVerificationPhrase] = useState("")

  const handleGeneratePhrase = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const phrase = generateRecoveryPhrase()
      setRecoveryPhrase(phrase)
      setSuccess("Recovery phrase generated successfully. Please save it in a secure location.")
    } catch (err: any) {
      setError(err.message || "Failed to generate recovery phrase")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerifyPhrase = async () => {
    if (!verificationPhrase.trim()) {
      setError("Please enter your recovery phrase")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await verifyWithRecoveryPhrase("user_id", verificationPhrase.trim())

      if (result.success) {
        setSuccess(result.message)
        setVerificationPhrase("")
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify recovery phrase")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recovery Phrase Verification</DialogTitle>
          <DialogDescription>
            Generate or verify a recovery phrase to secure your account and increase your verification level.
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a new recovery phrase to secure your account. This phrase will be used to verify your identity
                and recover your account if needed.
              </p>

              {recoveryPhrase ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Textarea
                      value={recoveryPhrase}
                      readOnly
                      className="h-24 font-mono text-sm"
                      type={showPhrase ? "text" : "password"}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setShowPhrase(!showPhrase)}
                    >
                      {showPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={handleCopyPhrase}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("verify")}>
                      Proceed to Verification
                    </Button>
                  </div>

                  <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-700">
                      Write down this recovery phrase and store it in a secure location. It will be used to verify your
                      identity and cannot be recovered if lost.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Button onClick={handleGeneratePhrase} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Generate Recovery Phrase
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your recovery phrase to verify your identity and increase your verification level.
              </p>

              <Textarea
                placeholder="Enter your recovery phrase"
                value={verificationPhrase}
                onChange={(e) => setVerificationPhrase(e.target.value)}
                className="h-24 font-mono text-sm"
              />

              <Button onClick={handleVerifyPhrase} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Recovery Phrase"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
