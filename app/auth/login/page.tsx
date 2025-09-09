"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getErrorMessage = (error: any) => {
    if (!error?.message) return "An unexpected error occurred. Please try again."

    const message = error.message.toLowerCase()

    if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
      return "Invalid email or password. Please check your credentials and try again."
    }
    if (message.includes("email not confirmed")) {
      return "Please check your email and click the confirmation link before signing in."
    }
    if (message.includes("too many requests")) {
      return "Too many login attempts. Please wait a few minutes before trying again."
    }
    if (message.includes("network") || message.includes("fetch")) {
      return "Network error. Please check your connection and try again."
    }

    return "Login failed. Please try again or contact support if the problem persists."
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setEmailError(null)
    setError(null)

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setEmailError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Added email sanitization
        password,
      })

      if (error) throw error

      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: unknown) {
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError("Please enter your email address first")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setError(null)
      setEmailError(null)
      // Show success message
      setError("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      setError("Failed to send reset email. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2 hover:text-emerald-700 transition-colors">
              MangroveID
            </h1>
          </Link>
          <p className="text-emerald-600">Sign in to your account</p>
        </div>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-emerald-800">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your plant identification dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`border-emerald-200 focus:border-emerald-400 ${emailError ? "border-red-300 focus:border-red-400" : ""}`}
                  disabled={isLoading}
                />
                {emailError && <p className="text-sm text-red-600">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    className="border-emerald-200 focus:border-emerald-400 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert
                  className={
                    error.includes("reset email sent") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription className={error.includes("reset email sent") ? "text-green-700" : "text-red-700"}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                disabled={isLoading || !!emailError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>

              <div className="text-center text-sm border-t pt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 font-medium"
                >
                  Create account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
