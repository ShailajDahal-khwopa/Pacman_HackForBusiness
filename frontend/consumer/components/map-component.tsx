"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface LocationItem {
  id: string
  name: string
  range: number
  lat: number
  lng: number
}

interface Business {
  uuid: string
  name: string
  lat: number
  lng: number
}

interface MapComponentProps {
  center: [number, number]
  selectedLocation: [number, number] | null
  previewRange: number | null
  items: LocationItem[]
  businesses?: Business[]
  onMapClick: (lat: number, lng: number) => void
}

export default function MapComponent({
  center: initialCenter,
  selectedLocation,
  previewRange,
  items,
  businesses = [],
  onMapClick,
}: MapComponentProps) {
  const [center, setCenter] = useState<[number, number] | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const circlesRef = useRef<L.Circle[]>([])
  const businessMarkersRef = useRef<L.Marker[]>([])
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const previewCircleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    // Get user's current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([
            position.coords.latitude,
            position.coords.longitude,
          ])
        },
        () => {
          // If denied or failed, fallback to initialCenter
          setCenter(initialCenter)
        }
      )
    } else {
      setCenter(initialCenter)
    }
  }, [initialCenter])

  useEffect(() => {
    if (!mapRef.current || !center) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 16)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div style="width: 24px; height: 32px; position: relative;">
    <div style="width: 24px; height: 24px; background-color: #3b82f6; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 0;"></div>
    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; position: absolute; top: 8px; left: 8px; z-index: 1;"></div>
  </div>`,
      className: "custom-user-marker",
      iconSize: [24, 32],
      iconAnchor: [12, 32],
    })

    L.marker(center, { icon: userIcon }).addTo(map).bindPopup("Your Location")

    // Handle map clicks
    map.on("click", (e) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    })

    return () => {
      map.remove()
    }
  }, [center, onMapClick])

  // Update selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove previous selected marker
    if (selectedMarkerRef.current) {
      mapInstanceRef.current.removeLayer(selectedMarkerRef.current)
      selectedMarkerRef.current = null
    }

    // Add new selected marker
    if (selectedLocation) {
      const selectedIcon = L.divIcon({
        html: `<div style="width: 24px; height: 32px; position: relative;">
    <div style="width: 24px; height: 24px; background-color: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 0;"></div>
    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; position: absolute; top: 8px; left: 8px; z-index: 1;"></div>
  </div>`,
        className: "custom-selected-marker",
        iconSize: [24, 32],
        iconAnchor: [12, 32],
      })

      selectedMarkerRef.current = L.marker(selectedLocation, { icon: selectedIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("Selected Location")
    }
  }, [selectedLocation])

  // Update preview circle for selected location with range
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove previous preview circle
    if (previewCircleRef.current) {
      mapInstanceRef.current.removeLayer(previewCircleRef.current)
      previewCircleRef.current = null
    }

    // Add new preview circle if we have both selected location and preview range
    if (selectedLocation && previewRange && previewRange > 0) {
      previewCircleRef.current = L.circle(selectedLocation, {
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.15,
        weight: 2,
        dashArray: "5, 5",
        radius: previewRange,
      }).addTo(mapInstanceRef.current)
    }
  }, [selectedLocation, previewRange])

  // Update items markers and circles
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers and circles
    markersRef.current.forEach((marker) => mapInstanceRef.current?.removeLayer(marker))
    circlesRef.current.forEach((circle) => mapInstanceRef.current?.removeLayer(circle))
    markersRef.current = []
    circlesRef.current = []

    // Add new markers and circles for items
    items.forEach((item) => {
      if (!mapInstanceRef.current) return

      // Create custom icon for item
      const itemIcon = L.divIcon({
        html: `<div style="width: 20px; height: 28px; position: relative;">
    <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 0;"></div>
    <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%; position: absolute; top: 7px; left: 7px; z-index: 1;"></div>
  </div>`,
        className: "custom-item-marker",
        iconSize: [20, 28],
        iconAnchor: [10, 28],
      })

      // Add marker
      const marker = L.marker([item.lat, item.lng], { icon: itemIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<strong>${item.name}</strong><br/>Range: ${item.range}m`)

      markersRef.current.push(marker)

      // Add range circle
      const circle = L.circle([item.lat, item.lng], {
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.1,
        radius: item.range,
      }).addTo(mapInstanceRef.current)

      circlesRef.current.push(circle)
    })
  }, [items])

  // Update business markers
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing business markers
    businessMarkersRef.current.forEach((marker) => mapInstanceRef.current?.removeLayer(marker))
    businessMarkersRef.current = []

    // Add new business markers
    businesses.forEach((business) => {
      if (!mapInstanceRef.current) return

      // Create custom icon for business
      const businessIcon = L.divIcon({
        html: `<div style="width: 18px; height: 26px; position: relative;">
    <div style="width: 18px; height: 18px; background-color: #f59e0b; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 0;"></div>
    <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%; position: absolute; top: 7px; left: 6px; z-index: 1;"></div>
  </div>`,
        className: "custom-business-marker",
        iconSize: [18, 26],
        iconAnchor: [9, 26],
      })

      // Add business marker
      const marker = L.marker([business.lat, business.lng], { icon: businessIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<strong>${business.name}</strong><br/>Business Location`)

      businessMarkersRef.current.push(marker)
    })
  }, [businesses])

  return <div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ minHeight: "400px" }} />
}
