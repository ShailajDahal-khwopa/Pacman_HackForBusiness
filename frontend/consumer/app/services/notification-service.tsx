interface NotificationResponse {
  status: "success" | "error"
  message: string
}

export async function sendBusinessNotification(
  message: string,
  lat: number,
  lng: number,
  radius = 5,
): Promise<NotificationResponse> {
  try {
    const response = await fetch("http://localhost:8000/notification/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        lat,
        long: lng, // Note: backend expects 'long' not 'lng'
        radius: radius, // Radius in kilometers
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: NotificationResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error sending notification:", error)
    throw new Error("Failed to send notification")
  }
}
