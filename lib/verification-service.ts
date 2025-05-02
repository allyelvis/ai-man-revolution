"use server"

import type { UserProfile, VerificationStatus, DocumentType, VerificationDocument, TransactionLimits } from "./types"
import { generateMnemonic, validateMnemonic } from "bip39"

// Transaction limits by verification level
export const TRANSACTION_LIMITS: Record<VerificationStatus, TransactionLimits> = {
  none: {
    daily: 1000,
    monthly: 5000,
    perTransaction: 500,
  },
  pending: {
    daily: 1000,
    monthly: 5000,
    perTransaction: 500,
  },
  basic: {
    daily: 10000,
    monthly: 50000,
    perTransaction: 5000,
  },
  full: {
    daily: 100000,
    monthly: 500000,
    perTransaction: 50000,
  },
  rejected: {
    daily: 0,
    monthly: 0,
    perTransaction: 0,
  },
}

// Submit verification request
export async function submitVerification(
  userData: {
    firstName: string
    lastName: string
    dateOfBirth: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    email: string
    phone: string
  },
  documentType: DocumentType,
  documentFile: File,
): Promise<{ success: boolean; message: string }> {
  // In a real implementation, this would upload the document to a secure storage
  // and create a verification request in your backend system

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // For demo purposes, we'll simulate a successful submission
  return {
    success: true,
    message: "Verification request submitted successfully. Please allow 1-2 business days for review.",
  }
}

// Check verification status
export async function checkVerificationStatus(userId: string): Promise<{
  status: VerificationStatus
  documents: VerificationDocument[]
  updatedAt: number
}> {
  // In a real implementation, this would query your backend for the current verification status

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, we'll return a mock status
  return {
    status: "basic", // This would come from your backend
    documents: [
      {
        id: "doc_1",
        type: "passport",
        status: "approved",
        submittedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        reviewedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
    ],
    updatedAt: Date.now(),
  }
}

// Get transaction limits for a verification level
export async function getTransactionLimits(verificationStatus: VerificationStatus): Promise<TransactionLimits> {
  return TRANSACTION_LIMITS[verificationStatus] || TRANSACTION_LIMITS.none
}

// Check if a transaction is within limits
export async function checkTransactionLimits(
  amount: number,
  userProfile: UserProfile,
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getTransactionLimits(userProfile.kycLevel)

  // Check per-transaction limit
  if (amount > limits.perTransaction) {
    return {
      allowed: false,
      reason: `Transaction exceeds the maximum amount of $${limits.perTransaction.toLocaleString()} per transaction for your verification level.`,
    }
  }

  // Check daily limit
  if (userProfile.usedDailyLimit + amount > limits.daily) {
    return {
      allowed: false,
      reason: `Transaction would exceed your daily limit of $${limits.daily.toLocaleString()}. Remaining: $${(
        limits.daily - userProfile.usedDailyLimit
      ).toLocaleString()}`,
    }
  }

  // Check monthly limit
  if (userProfile.usedMonthlyLimit + amount > limits.monthly) {
    return {
      allowed: false,
      reason: `Transaction would exceed your monthly limit of $${limits.monthly.toLocaleString()}. Remaining: $${(
        limits.monthly - userProfile.usedMonthlyLimit
      ).toLocaleString()}`,
    }
  }

  return { allowed: true }
}

// Update used limits after a transaction
export async function updateUsedLimits(
  userProfile: UserProfile,
  amount: number,
): Promise<{ usedDailyLimit: number; usedMonthlyLimit: number }> {
  return {
    usedDailyLimit: userProfile.usedDailyLimit + amount,
    usedMonthlyLimit: userProfile.usedMonthlyLimit + amount,
  }
}

// Generate a recovery phrase
export async function generateRecoveryPhrase(): Promise<string> {
  return generateMnemonic()
}

// Verify a recovery phrase
export async function verifyRecoveryPhrase(phrase: string): Promise<boolean> {
  return validateMnemonic(phrase)
}

// Verify user with recovery phrase
export async function verifyWithRecoveryPhrase(
  userId: string,
  recoveryPhrase: string,
): Promise<{ success: boolean; message: string; newStatus?: VerificationStatus }> {
  // In a real implementation, this would verify the recovery phrase against the stored one
  // and update the user's verification status

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // For demo purposes, we'll simulate a successful verification
  if (await verifyRecoveryPhrase(recoveryPhrase)) {
    return {
      success: true,
      message: "Recovery phrase verified successfully. Your account has been upgraded to basic verification.",
      newStatus: "basic",
    }
  }

  return {
    success: false,
    message: "Invalid recovery phrase. Please try again.",
  }
}
