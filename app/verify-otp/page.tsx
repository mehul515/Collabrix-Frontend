"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, verifyOtp } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Shield, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ModernVerifyOTPPage() {
  const {user, isAuthenticated, setUser, setIsAuthenticated } = useAuth()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
  if (isAuthenticated && user) {
    router.replace("/dashboard") // prevent going back to login using back button
  }
}, [isAuthenticated, user, router])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email_for_verification")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      toast({
        title: "Session Expired",
        description: "Please sign up or sign in again.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (!email) {
      toast({
        title: "Session Error",
        description: "Please sign up or sign in again.",
        variant: "destructive",
      })
      return
    }

    if (otpString.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter all 6 digits of the verification code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await verifyOtp({ email, otp: otpString })

      if (res.jwt) {
        localStorage.setItem("authToken", res.jwt)
        const userProfile = await getUserProfile()
        setUser(userProfile)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(userProfile))
      }

      toast({
        title: "Email Verified! 🎉",
        description: "Your account has been verified successfully. Welcome to Collabrix!",
      })

      window.location.href = "/dashboard"
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)

    // Simulate API call
    setTimeout(() => {
      setTimeLeft(300)
      setOtp(["", "", "", "", "", ""])
      setIsResending(false)
      toast({
        title: "Code Resent! 📧",
        description: "A new verification code has been sent to your email.",
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="container">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">We've sent a 6-digit code to your email address</p>
          </div>

          <Card className="glass-effect border-border/50 animate-slide-up">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
              <CardDescription>
                Please enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                      autoComplete="off"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-button hover-lift"
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Email
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Wrong email address?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Go back to signup
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs text-muted-foreground">🔒 This verification helps keep your account secure</p>
          </div>
        </div>
      </div>
    </div>
  )
}
