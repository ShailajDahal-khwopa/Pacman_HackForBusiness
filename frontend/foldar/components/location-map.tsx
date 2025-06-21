"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLocation?: { lat: number; lng: number }
  isEditable?: boolean
}

export default function LocationMap({ onLocationSelect, initialLocation, isEditable = true }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onLocationSelectRef = useRef(onLocationSelect)

  // Keep the callback ref updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect
  }, [onLocationSelect])

  // Stable callback that won't cause re-renders
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    onLocationSelectRef.current(lat, lng)
  }, [])

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    // Initialize map with initial location or default to Kathmandu, Nepal
    const defaultLocation = initialLocation || { lat: 27.7172, lng: 85.324 }
    const map = L.map(mapRef.current, {
      center: [defaultLocation.lat, defaultLocation.lng],
      zoom: initialLocation ? 13 : 12,
      zoomAnimation: false,
      fadeAnimation: false,
    })

    map.whenReady(() => map.invalidateSize())

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off()
        if ((mapInstanceRef.current as any).stop) {
          ;(mapInstanceRef.current as any).stop()
        }
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once

  // Handle initial marker setup
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Add initial marker if location is provided
    if (initialLocation) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      markerRef.current = L.marker([initialLocation.lat, initialLocation.lng])
        .addTo(map)
        .bindPopup(isEditable ? "Your current location (click map to change)" : "Your location")

      if (!isEditable) {
        markerRef.current.openPopup()
      }

      map.setView([initialLocation.lat, initialLocation.lng], 13)
    }
  }, [initialLocation, isEditable])

  // Handle click events and geolocation
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    let cancelled = false

    // Remove existing click handlers
    map.off("click")

    // Add click handler only if editable
    if (isEditable) {
      const clickHandler = (e: L.LeafletMouseEvent) => {
        if (cancelled) return

        const { lat, lng } = e.latlng

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Selected location").openPopup()

        // Call callback
        handleLocationSelect(lat, lng)
      }

      map.on("click", clickHandler)

      // Try to get user's current location only if no initial location
      if (!initialLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (cancelled || !mapInstanceRef.current) return

            const { latitude, longitude } = position.coords
            map.setView([latitude, longitude], 13)

            // Add marker for current location
            if (markerRef.current) {
              map.removeLayer(markerRef.current)
            }
            markerRef.current = L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup("Your current location")
              .openPopup()

            handleLocationSelect(latitude, longitude)
          },
          (error) => {
            console.log("Geolocation error:", error)
          },
        )
      }
    }

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off("click")
      }
    }
  }, [isEditable, initialLocation, handleLocationSelect])

  return (
    <div className="relative">
      <div ref={mapRef} className="h-64 w-full rounded-lg border" />
      {!isEditable && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          View only
        </div>
      )}
      {isEditable && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          Click anywhere to set location
        </div>
      )}
    </div>
  )
}
