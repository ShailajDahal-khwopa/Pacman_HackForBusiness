# 🏪 MyApp: Business & Customer Management Django API

A Django RESTful API for managing business users, customers, product stocks, credits, and notifications. This backend is designed for B2B/B2C platforms where businesses can manage inventory, customers can sign up/sign in, and both parties can interact through credits and notifications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
  - [Business APIs](#business-apis)
  - [Customer APIs](#customer-apis)
  - [Credit APIs](#credit-apis)
  - [Notification APIs](#notification-apis)
- [Models](#models)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This Django app provides endpoints for:
- Business and customer registration & authentication
- Managing product stocks for businesses
- Credit management between businesses and customers
- Sending and viewing notifications within a geographic radius

---

## Features

- Business user and customer user management
- Product stock CRUD for businesses
- Credit assignment and editing
- Notification system for businesses within a radius
- CORS support for frontend integration

---

## Tech Stack

- Python 3.x
- Django 4.x
- SQLite (default, can be swapped for PostgreSQL/MySQL)
- Django REST Framework (optional for extension)

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd backend/myproject
   ```

2. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```sh
   pip install django
   ```

4. **Apply migrations:**
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Run the development server:**
   ```sh
   python manage.py runserver
   ```

---

## Usage

- The API will be available at `http://127.0.0.1:8000/`
- All endpoints are under the `/myapp/` path (depending on your project urls).

---

## API Documentation

### Business APIs

- **POST `/edit/`**  
  Update business user location and stock.
  - Body: `{ "uuid": "...", "lat": ..., "long": ..., "product_name": "...", "price": ..., "quantity": ... }`

- **POST `/view/`**  
  View all stocks for a business.
  - Body: `{ "uuid": "..." }`

- **POST `/signup/`**  
  Register a new business user.
  - Body: `{ "email": "...", "password": "...", "name": "...", "lat": ..., "long": ... }`

- **POST `/signin/`**  
  Authenticate a business user.
  - Body: `{ "email": "...", "password": "..." }`

- **POST `/search_businesses/`**  
  Search businesses by product and location.
  - Body: `{ "product_name": "...", "lat": ..., "long": ..., "radius": ... }`

### Customer APIs

- **POST `/customer_signup/`**  
  Register a new customer user.
  - Body: `{ "email": "...", "password": "..." }`

- **POST `/customer_signin/`**  
  Authenticate a customer user.
  - Body: `{ "email": "...", "password": "..." }`

### Credit APIs

- **POST `/credit_business/`**  
  Get all credits for a business user.
  - Body: `{ "business_uuid": "..." }`

- **POST `/credit_customer/`**  
  Get all credits for a customer user.
  - Body: `{ "customer_uuid": "..." }`

- **POST `/credit/`**  
  Create a new credit entry.
  - Body: `{ "customer_uuid": "...", "business_uuid": "...", "amount": ... }`

- **POST `/credit_edit/`**  
  Edit an existing credit entry.
  - Body: `{ "credit_id": ..., "amount": ..., "due_date": "...", "paid_status": ... }`

### Notification APIs

- **POST `/notification/`**  
  Send a notification to all businesses in a radius.
  - Body: `{ "message": "...", "lat": ..., "long": ..., "radius": ... }`

- **POST `/view_notifications/`**  
  View all notifications for a business user.
  - Body: `{ "business_uuid": "..." }`

---

## Models

See [`models.py`](myapp/models.py) for full model definitions.

- **BusinessUsers**: uuid, name, email, password, lat, long
- **Stock**: product_name, price, quantity, business_user (FK)
- **CutomerUser**: uuid, email, password
- **Credit**: credit_id, customer_user (FK), business_user (FK), amount, due_date, paid_status
- **Notification**: notification_id, business_user (FK), message

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

---

## License

MIT License.