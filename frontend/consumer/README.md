# 🗺️ Consumer Location Tracker & Business Finder

A modern Next.js + TypeScript app for consumers to track items on a map, find nearby businesses selling those items, and send notifications to businesses if none are found. Built with interactive Leaflet maps, dynamic business search, and notification integration.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This app allows consumers to:
- Select locations on a map and add items with a search radius.
- Instantly find businesses selling those items within the specified range.
- View business locations and item coverage on an interactive map.
- Send notifications to businesses if no sellers are found nearby.

---

## Features

- 🗺️ Interactive Leaflet map with custom markers and range circles
- ➕ Add multiple items with custom names and search radii
- 🏪 Find and display businesses selling each item
- 🔔 Send notifications to businesses when no sellers are found
- 📍 Auto-detect user location (with fallback)
- 💡 Responsive, accessible UI with Shadcn UI components
- ⚡ Dynamic imports for fast, SSR-friendly map rendering

---

## Tech Stack

- Next.js (App Router)
- React 18+
- TypeScript
- Leaflet.js (interactive maps)
- Shadcn UI (Radix + Tailwind)
- Lucide React Icons
- Fetch API for backend communication

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd frontend/consumer
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser:**
   - Visit [http://localhost:3000](http://localhost:3000) (default Next.js port).

---

## Usage

- **Map Interaction:** Click anywhere on the map to select a location for your item.
- **Add Item:** Enter the item name and search radius (in meters), then add it to the map.
- **View Businesses:** The app will automatically search for businesses selling the item within the specified range and display them.
- **Send Notification:** If no businesses are found, you can send a notification to nearby businesses.
- **Remove Items:** Remove items from the sidebar as needed.

---

## Project Structure

```
components/
  map-component.tsx      # Leaflet map with custom markers and circles
app/
  page.tsx               # Main page logic and UI
  services/
    notification-service.tsx  # API call for sending notifications
...
```

---

## API Documentation

### 1. Search Businesses

**POST** `/search_businesses/`  
- **Body:**  
  ```json
  {
    "product_name": "Milk",
    "lat": 27.7,
    "long": 85.3,
    "radius": 500
  }
  ```
  - `radius` is in meters.
- **Response:**  
  ```json
  {
    "status": "success",
    "businesses": [
      { "uuid": "...", "name": "...", "lat": ..., "lng": ... }
    ]
  }
  ```

### 2. Send Notification

**POST** `/notification/`  
- **Body:**  
  ```json
  {
    "message": "Request for Milk at (27.7, 85.3)",
    "lat": 27.7,
    "long": 85.3,
    "radius": 500
  }
  ```
- **Response:**  
  ```json
  {
    "status": "success",
    "message": "Notification sent to businesses."
  }
  ```

---

## Customization

- **API URLs:**  
  Update API endpoints in `services/notification-service.tsx` and `page.tsx` if your backend runs on a different host/port.
- **Map Defaults:**  
  Change the fallback location in `page.tsx` if you want a different default than San Francisco.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## License

MIT License. See [LICENSE](../../LICENSE) for details.