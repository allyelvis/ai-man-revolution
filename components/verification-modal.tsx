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
import { Loader2, AlertCircle, Info, ShieldCheck, Clock, KeyRound } from "lucide-react"
import type { DocumentType } from "@/lib/types"
import RecoveryPhraseVerification from "./recovery-phrase-verification"

interface VerificationModalProps {
  open: boolean
  onClose: () => void
}

export default function VerificationModal({ open, onClose }: VerificationModalProps) {
  const { userProfile, submitUserVerification, refreshUserProfile, getVerificationLimits } = useWallet()
  const [activeTab, setActiveTab] = useState("status")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showRecoveryPhraseModal, setShowRecoveryPhraseModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    email: "",
    phone: "",
  })
  const [documentType, setDocumentType] = useState<DocumentType>("passport")
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!documentFile) {
      setError("Please upload a verification document")
      return
    }

    setIsLoading(true)

    try {
      const result = await submitUserVerification(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          email: formData.email,
          phone: formData.phone,
        },
        documentType,
        documentFile,
      )

      if (result.success) {
        setSuccess(result.message)
        setActiveTab("status")
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          email: "",
          phone: "",
        })
        setDocumentFile(null)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit verification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await refreshUserProfile()
      setSuccess("Verification status updated successfully")
    } catch (err: any) {
      setError(err.message || "Failed to refresh verification status")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatusContent = () => {
    switch (userProfile.kycLevel) {
      case "none":
        return (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Not Verified</h3>
            <p className="text-muted-foreground mb-4">
              Verify your identity to increase your transaction limits and unlock additional features.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => setActiveTab("verify")}>Standard Verification</Button>
              <Button variant="outline" onClick={() => setShowRecoveryPhraseModal(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Quick Verification with Secret Words
              </Button>
            </div>
          </div>
        )
      case "pending":
        return (
          <div className="text-center py-4">
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Verification In Progress</h3>
            <p className="text-muted-foreground mb-4">
              Your verification is being processed. This typically takes 1-2 business days.
            </p>
            <Button onClick={handleRefreshStatus} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Status"
              )}
            </Button>
          </div>
        )
      case "basic":
        return (
          <div className="text-center py-4">
            <ShieldCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Basic Verification Complete</h3>
            <p className="text-muted-foreground mb-4">
              You have completed basic verification. To increase your limits further, upgrade to full verification.
            </p>
            <Button onClick={() => setActiveTab("verify")}>Upgrade to Full Verification</Button>
          </div>
        )
      case "full":
        return (
          <div className="text-center py-4">
            <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Fully Verified</h3>
            <p className="text-muted-foreground mb-4">
              You have completed full verification and have access to the highest transaction limits.
            </p>
            <div className="bg-gray-50 p-3 rounded-md text-left">
              <h4 className="font-medium mb-1">Your Limits</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Daily Limit:</div>
                <div className="text-right font-medium">${userProfile.dailyLimit.toLocaleString()}</div>
                <div>Monthly Limit:</div>
                <div className="text-right font-medium">${userProfile.monthlyLimit.toLocaleString()}</div>
                <div>Per Transaction:</div>
                <div className="text-right font-medium">
                  ${getVerificationLimits(userProfile.kycLevel).perTransaction.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )
      case "rejected":
        return (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Verification Rejected</h3>
            <p className="text-muted-foreground mb-4">
              Your verification was rejected. Please review the reason below and try again.
            </p>
            {userProfile.verificationDocuments.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {userProfile.verificationDocuments[0].rejectionReason || "Invalid or unclear document"}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col space-y-2">
              <Button onClick={() => setActiveTab("verify")}>Try Again</Button>
              <Button variant="outline" onClick={() => setShowRecoveryPhraseModal(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Try Quick Verification
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Identity Verification</DialogTitle>
            <DialogDescription>
              Verify your identity to increase your transaction limits and unlock additional features.
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
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger
                value="verify"
                disabled={userProfile.kycLevel === "full" || userProfile.kycLevel === "pending"}
              >
                Verify
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              {renderStatusContent()}
            </TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select Document Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="utility_bill">Utility Bill</SelectItem>
                      <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentFile">Upload Document</Label>
                  <Input
                    id="documentFile"
                    name="documentFile"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,application/pdf"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Please upload a clear image or PDF of your document. Maximum file size: 5MB.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRecoveryPhraseModal(true)}
                    className="flex items-center"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Use Secret Words Instead
                  </Button>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Verification"
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RecoveryPhraseVerification open={showRecoveryPhraseModal} onClose={() => setShowRecoveryPhraseModal(false)} />
    </>
  )
}
