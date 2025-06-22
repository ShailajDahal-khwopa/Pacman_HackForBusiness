# 🏢 Business Dashboard Frontend

A modern React + TypeScript dashboard for business users to manage inventory, credits, competition analysis, and notifications. This frontend is designed for seamless integration with the Pacman_HackForBusiness backend and ML APIs.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This dashboard enables business users to:
- Manage product inventory (add, edit, update via image or invoice)
- Track and manage customer credits
- Analyze competition using product image and keyword
- View notifications
- Secure login and protected routes

---

## Features

- 📦 Inventory management with image and invoice upload
- 💳 Credit tracking and overdue alerts
- 🏆 Competition analysis with ML-powered image matching
- 🔔 Notifications panel
- 🔒 Protected routes and session management
- 🎨 Responsive, modern UI with Tailwind CSS and Lucide icons
- 🧩 Modular, maintainable codebase

---

## Tech Stack

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Lucide React Icons
- jsPDF (for invoice PDF generation)
- Custom UI components

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd frontend/Business
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables (if needed):**
   - By default, API URLs are hardcoded as `http://localhost:8000`, `:4000`, and `:5000`.
   - For production, update API endpoints in the code or use environment variables.

4. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (default Vite port).

---

## Usage

- **Sign In:** Use your business email and password to log in.
- **Dashboard:** View stats, quick actions, and recent activity.
- **Inventory:** Add/edit products, upload images for detection, or upload invoice images to auto-update stock.
- **Credits:** Track customer credits, due dates, and overdue amounts.
- **Competition:** Upload a product image and keyword to analyze similar products from competitors.
- **Notifications:** View important alerts and system messages.

---

## Project Structure

```
src/
  components/         # Reusable UI components
  hooks/              # Custom React hooks
  pages/              # Main page components (Dashboard, Inventory, Credits, etc.)
  App.tsx             # Main app and routing
  main.tsx            # Entry point
  ...
```

---

## API Documentation

The frontend communicates with the following backend endpoints:

### Authentication

- `POST /signin/`  
  - Body: `{ email, password }`
  - Response: `{ status, uuid, ... }`

### Inventory

- `POST /view/`  
  - Body: `{ uuid }`
  - Response: `{ status, stocks: [...] }`

- `POST /edit/`  
  - Body: `{ uuid, product_name, price, quantity }`
  - Response: `{ status, ... }`

- `POST /credit_business/`  
  - Body: `{ business_uuid }`
  - Response: `{ status, credits: [...] }`

### Competition Analysis

- `POST /match` (ML API, port 5000)  
  - FormData: `image`, `keyword`
  - Response: `{ khadyanna: [...], milanwholesale: [...], merokirana: [...] }`

### Inventory Detection

- `POST /detect` (ML API, port 4000)  
  - FormData: `image`
  - Response: `{ product_name: quantity, ... }`

### Invoice Processing

- `POST /detect` (Invoice API, port 5000)  
  - FormData: `image`
  - Response: `{ items: [...], subtotal, total, currency }`

### Notifications

- `POST /view_notifications/`  
  - Body: `{ business_uuid }`
  - Response: `{ status, notifications: [...] }`

---

## Environment Variables

- By default, API URLs are hardcoded. For production, consider using `.env` and `import.meta.env` for:
  - `VITE_API_URL`
  - `VITE_ML_API_URL`
  - `VITE_INVOICE_API_URL`

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## License

MIT License. See [LICENSE](../../LICENSE)