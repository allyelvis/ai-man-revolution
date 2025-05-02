"use client"

import { useWallet } from "./wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { useState } from "react"
import VerificationModal from "./verification-modal"
import type { VerificationStatus } from "@/lib/types"

export default function VerificationStatus() {
  const { userProfile, getVerificationLimits } = useWallet()
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "none":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "basic":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Basic
          </Badge>
        )
      case "full":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Fully Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getLimitProgress = () => {
    const limits = getVerificationLimits(userProfile.kycLevel)
    const dailyPercentage = limits.daily ? (userProfile.usedDailyLimit / limits.daily) * 100 : 0
    const monthlyPercentage = limits.monthly ? (userProfile.usedMonthlyLimit / limits.monthly) * 100 : 0

    return {
      daily: {
        percentage: Math.min(dailyPercentage || 0, 100),
        used: userProfile.usedDailyLimit || 0,
        limit: limits.daily || 0,
      },
      monthly: {
        percentage: Math.min(monthlyPercentage || 0, 100),
        used: userProfile.usedMonthlyLimit || 0,
        limit: limits.monthly || 0,
      },
      perTransaction: limits.perTransaction || 0,
    }
  }

  const progress = getLimitProgress()

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2" />
              Verification Status
            </div>
            {getStatusBadge(userProfile.kycLevel)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Limit</span>
              <span>
                ${(progress.daily.used || 0).toLocaleString()} / ${(progress.daily.limit || 0).toLocaleString()}
              </span>
            </div>
            <Progress value={progress.daily.percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Limit</span>
              <span>
                ${(progress.monthly.used || 0).toLocaleString()} / ${(progress.monthly.limit || 0).toLocaleString()}
              </span>
            </div>
            <Progress value={progress.monthly.percentage} className="h-2" />
          </div>

          <div className="text-sm flex justify-between">
            <span>Max Transaction:</span>
            <span className="font-medium">${(progress.perTransaction || 0).toLocaleString()}</span>
          </div>

          {userProfile.kycLevel !== "full" && (
            <Button variant="outline" className="w-full mt-2" onClick={() => setShowVerificationModal(true)}>
              {userProfile.kycLevel === "none"
                ? "Verify Your Identity"
                : userProfile.kycLevel === "pending"
                  ? "Check Verification Status"
                  : "Upgrade Verification Level"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>

      <VerificationModal open={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
    </>
  )
}
