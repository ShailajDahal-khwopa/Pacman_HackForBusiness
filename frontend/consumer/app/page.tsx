"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Trash2 } from "lucide-react"
import { sendBusinessNotification } from "./services/notification-service"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})
interface Business {
  uuid: string
  name: string
}

interface LocationItem {
  id: string
  name: string
  range: number
  lat: number
  lng: number
  businesses?: Business[]
}

const API_URL = "http://localhost:8000/search_businesses/"

export default function LocationTracker() {
  // Always use this as the initial location
  const DEFAULT_LOCATION: [number, number] = [27.619417, 85.537049]
  const [userLocation, setUserLocation] = useState<[number, number] | null>(DEFAULT_LOCATION)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [itemName, setItemName] = useState("")
  const [itemRange, setItemRange] = useState("")
  const [items, setItems] = useState<LocationItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [previewRange, setPreviewRange] = useState<number | null>(null)
  const [loadingBusinesses, setLoadingBusinesses] = useState<string | null>(null)
  const [notificationLoading, setNotificationLoading] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [credits, setCredits] = useState<any[]>([])
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [creditsError, setCreditsError] = useState<string | null>(null)

  useEffect(() => {
    // Always open to DEFAULT_LOCATION
    setUserLocation(DEFAULT_LOCATION)
    // Optionally, you can remove or comment out geolocation code below
    /*
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Unable to get your location. Using default location.")
          setUserLocation(DEFAULT_LOCATION)
        },
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
      setUserLocation(DEFAULT_LOCATION)
    }
    */
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng])
    setShowForm(true)
  }

  // Fetch businesses for a given item
  const fetchBusinesses = async (item: LocationItem) => {
    setLoadingBusinesses(item.id)
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: item.name,
          lat: item.lat,
          long: item.lng,
          radius: item.range,
        }),
      })
      const data = await res.json()
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, businesses: data.status === "success" ? data.businesses : [], noBusinesses: data.status !== "success" }
            : it
        )
      )
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoadingBusinesses(null)
    }
  }

  // Call fetchBusinesses after adding an item
  const handleAddItem = async () => {
    if (!selectedLocation || !itemName.trim() || !itemRange.trim()) return

    const newItem: LocationItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      range: Number.parseFloat(itemRange),
      lat: selectedLocation[0],
      lng: selectedLocation[1],
    }

    setItems((prev) => [...prev, newItem])
    setItemName("")
    setItemRange("")
    setPreviewRange(null)
    setShowForm(false)
    setSelectedLocation(null)

    // Fetch businesses for the new item
    fetchBusinesses(newItem)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleCancelAdd = () => {
    setShowForm(false)
    setSelectedLocation(null)
    setItemName("")
    setItemRange("")
    setPreviewRange(null)
  }

  // Handler for sending notification
  const handleSendNotification = async (item: LocationItem) => {
    setNotificationLoading(item.id)
    setNotificationMessage(null)
    try {
      const resp = await sendBusinessNotification(
        `Request for ${item.name} at (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})`,
        item.lat,
        item.lng,
        item.range // Convert meters to km if needed
      )
      setNotificationMessage(resp.message)
    } catch (e: any) {
      setNotificationMessage("Failed to send notification.")
    } finally {
      setNotificationLoading(null)
    }
  }

  // Fetch credits for default customer 'shailaj'
  const fetchCredits = useCallback(async () => {
    setLoadingCredits(true)
    setCreditsError(null)
    try {
      const res = await fetch("http://localhost:8000/credit_customer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_uuid: "shailaj" }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setCredits(data.credits)
      } else {
        setCreditsError(data.message || "Failed to fetch credits")
      }
    } catch (e) {
      setCreditsError("Failed to fetch credits")
    } finally {
      setLoadingCredits(false)
    }
  }, [])

  // Collect all businesses from items
  const allBusinesses = items
    .flatMap((item) =>
      item.businesses
        ? item.businesses.map((b) => ({
            ...b,
            lat: item.lat,
            lng: item.lng,
          }))
        : []
    )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Location Item Tracker</h1>
        <p className="text-muted-foreground">Click on the map to select a location, then add an item with its range</p>
        {locationError && (
          <Badge variant="destructive" className="mt-2">
            {locationError}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Interactive Map
              </CardTitle>
              <CardDescription>Click anywhere on the map to select a location for your item</CardDescription>
            </CardHeader>
            <CardContent>
              {userLocation ? (
                <MapComponent
                  center={userLocation}
                  selectedLocation={selectedLocation}
                  previewRange={previewRange}
                  items={items}
                  businesses={allBusinesses} // <-- pass businesses here
                  onMapClick={handleMapClick}
                />
              ) : (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-muted-foreground">Getting your location...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Item Form */}
          {showForm && selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Item
                </CardTitle>
                <CardDescription>
                  Location: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="Enter item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemRange">Range (meters)</Label>
                  <Input
                    id="itemRange"
                    type="number"
                    placeholder="Enter range in meters"
                    value={itemRange}
                    onChange={(e) => {
                      setItemRange(e.target.value)
                      const rangeValue = Number.parseFloat(e.target.value)
                      setPreviewRange(isNaN(rangeValue) || rangeValue <= 0 ? null : rangeValue)
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} disabled={!itemName.trim() || !itemRange.trim()} className="flex-1">
                    Add Item
                  </Button>
                  <Button variant="outline" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Added Items ({items.length})</CardTitle>
              <CardDescription>Items you've placed on the map</CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No items added yet. Click on the map to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Range: {item.range}m</p>
                          <p className="text-xs text-muted-foreground">
                            {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Businesses */}
                      <div>
                        {loadingBusinesses === item.id ? (
                          <span className="text-xs text-muted-foreground">Loading businesses...</span>
                        ) : item.businesses ? (
                          item.businesses.length > 0 ? (
                            <ul className="text-xs mt-1">
                              {item.businesses.map((b) => (
                                <li key={b.uuid} className="flex items-center gap-1">
                                  <Badge>{b.name}</Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs text-muted-foreground">No businesses found.</span>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={notificationLoading === item.id}
                                onClick={() => handleSendNotification(item)}
                              >
                                {notificationLoading === item.id ? "Sending..." : "Send Notification to Businesses"}
                              </Button>
                              {notificationMessage && (
                                <span className="text-xs text-green-600">{notificationMessage}</span>
                              )}
                            </div>
                          )
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchBusinesses(item)}
                            className="mt-1"
                          >
                            Find Businesses
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Credits</CardTitle>
              <CardDescription>
                View all credits for customer <b>shailaj</b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" onClick={fetchCredits} disabled={loadingCredits}>
                {loadingCredits ? "Loading..." : "View Credits"}
              </Button>
              {creditsError && (
                <div className="text-xs text-red-600 mt-2">{creditsError}</div>
              )}
              {credits.length > 0 && (
                <div className="mt-3 space-y-2">
                  {credits.map((credit, idx) => (
                    <div key={idx} className="border rounded p-2 text-xs flex flex-col gap-1">
                      <div>
                        <b>Business:</b> {credit.business_uuid}
                      </div>
                      <div>
                        <b>Amount:</b> {credit.amount}
                      </div>
                      <div>
                        <b>Due Date:</b> {credit.due_date}
                      </div>
                      <div>
                        <b>Status:</b>{" "}
                        <span className={credit.paid_status ? "text-green-600" : "text-yellow-600"}>
                          {credit.paid_status ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

