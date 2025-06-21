"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Plus, X } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng })
  }, [])

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (itemToRemove: string) => {
    setItems(items.filter((item) => item !== itemToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  const handleSubmit = async () => {
    if (!location) {
      setError("Please select your location on the map")
      return
    }

    if (items.length === 0) {
      setError("Please add at least one item you provide")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          location,
          items,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save user data")
      }

      const result = await response.json()
      console.log("User data saved:", result)

      // Close modal and redirect
      onClose()
    } catch (err) {
      setError("Failed to save your information. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !location) {
      setError("Please select your location on the map")
      return
    }
    setError("")
    setStep(2)
  }

  const prevStep = () => {
    setError("")
    setStep(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
          <DialogDescription>We need some information to personalize your experience</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Your Location
              </CardTitle>
              <CardDescription>Click on the map to set your location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationMap onLocationSelect={handleLocationSelect} isEditable={true} />
              {location && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Location:</p>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
                  </p>
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end">
                <Button onClick={nextStep} disabled={!location}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What do you provide?</CardTitle>
              <CardDescription>Add items or services you offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter an item or service"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={addItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Items:</Label>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button
                          onClick={() => removeItem(item)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
