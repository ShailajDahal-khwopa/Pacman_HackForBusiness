"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MapPin, Plus, X, Save, Edit } from "lucide-react"
import dynamic from "next/dynamic"

const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface User {
  id: string
  name: string
  email: string
  avatar: string
  location: { lat: number; lng: number }
  items: string[]
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)
  const [newItem, setNewItem] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setEditedUser((prev) => ({ ...prev, location: { lat, lng } }))
  }, [])

  const addItem = () => {
    if (newItem.trim() && !editedUser.items.includes(newItem.trim())) {
      setEditedUser({
        ...editedUser,
        items: [...editedUser.items, newItem.trim()],
      })
      setNewItem("")
    }
  }

  const removeItem = (itemToRemove: string) => {
    setEditedUser({
      ...editedUser,
      items: editedUser.items.filter((item) => item !== itemToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      // Send updated data to backend
      const response = await fetch("http://localhost:8000/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editedUser.id,
          location: editedUser.location,
          items: editedUser.items,
          name: editedUser.name,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const result = await response.json()
      console.log("Profile updated:", result)

      setIsEditing(false)
      // In real app, update the user context/state here
    } catch (err) {
      setError("Failed to update profile. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Profile</span>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>View and manage your profile information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={editedUser.avatar || "/placeholder.svg"} alt={editedUser.name} />
                    <AvatarFallback className="text-lg">{editedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    {isEditing ? (
                      <Input
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        className="font-medium"
                      />
                    ) : (
                      <h3 className="text-lg font-medium">{editedUser.name}</h3>
                    )}
                    <p className="text-sm text-muted-foreground">{editedUser.email}</p>
                    <p className="text-xs text-muted-foreground">User ID: {editedUser.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {editedUser.location.lat.toFixed(4)}, {editedUser.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Services</Label>
                    <div className="text-sm text-muted-foreground">{editedUser.items.length} items listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Your Location
                </CardTitle>
                <CardDescription>
                  {isEditing ? "Click on the map to update your location" : "Your current registered location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={editedUser.location}
                  isEditable={isEditing}
                />
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Current Location:</p>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {editedUser.location.lat.toFixed(6)}, Longitude: {editedUser.location.lng.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Services & Items</CardTitle>
                <CardDescription>Items and services you provide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new service or item"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button onClick={addItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Your Services ({editedUser.items.length}):</Label>
                  <div className="flex flex-wrap gap-2">
                    {editedUser.items.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        {isEditing && (
                          <button
                            onClick={() => removeItem(item)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {editedUser.items.length === 0 && (
                    <p className="text-sm text-muted-foreground">No services added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
