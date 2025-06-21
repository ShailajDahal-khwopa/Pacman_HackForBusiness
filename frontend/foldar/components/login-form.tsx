"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail } from "lucide-react"
import { OnboardingModal } from "@/components/onboarding-modal"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userId, setUserId] = useState("")

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate email login - in real app, this would handle authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user ID generation
      const mockUserId = `user_${Date.now()}`
      setUserId(mockUserId)

      // Check if user is new (in real app, this would come from your auth provider)
      const isNewUser = true // Mock - always show onboarding for demo

      if (isNewUser) {
        setShowOnboarding(true)
      } else {
        // Redirect to dashboard
        window.location.href = "/"
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate Google login - in real app, this would use Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock user ID from Google
      const mockUserId = `google_user_${Date.now()}`
      setUserId(mockUserId)

      // Check if user is new
      const isNewUser = true // Mock - always show onboarding for demo

      if (isNewUser) {
        setShowOnboarding(true)
      } else {
        // Redirect to dashboard
        window.location.href = "/"
      }
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    // Redirect to dashboard after onboarding
    window.location.href = "/"
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Sign in with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Sign in with Google
          </Button>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </CardContent>
      </Card>

      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingComplete} userId={userId} />
    </>
  )
}
