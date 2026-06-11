# 🛍️ ShopMe

A modern full-stack eCommerce platform built with Next.js, MongoDB, Stripe, and Tailwind CSS. ShopMe provides a seamless shopping experience with secure authentication, product management, cart functionality, and online payments.

## 🚀 Live Demo

**Production URL:** https://shop-hesd2b5uj-divyansh-porwals-projects.vercel.app/

## 📖 Overview

ShopMe is a scalable eCommerce application designed to provide customers with a smooth online shopping experience while offering merchants tools to manage products and orders efficiently.

The application includes user authentication, product browsing, cart management, checkout flow, order processing, and payment integration.

---

## ✨ Features

### Customer Features

* User Registration & Login
* Browse Products
* Product Details Page
* Add to Cart
* Update Cart Quantity
* Checkout Process
* Secure Stripe Payments
* Order History
* Responsive Design

### Merchant Features

* Product Management
* Inventory Management
* Order Tracking
* Dashboard Overview

### Security Features

* Protected Routes
* JWT Authentication
* Secure API Endpoints
* Environment Variable Protection

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Node.js

### Database

* MongoDB
* Mongoose

### Payments

* Stripe

### Deployment

* Vercel

---

## 📂 Project Structure

```text
app/
├── admin/
├── api/
├── auth/
├── customer/
├── merchant/

components/
controllers/
hooks/
lib/
middleware/
models/
services/
store/
utils/
public/
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/divyanshporwal/ShopMe.git
cd ShopMe
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 💳 Stripe Integration

ShopMe uses Stripe Checkout for secure online payments.

To enable payments:

1. Create a Stripe account.
2. Generate a Secret Key.
3. Add the key to your environment variables.
4. Configure Stripe Webhooks (if applicable).

---

## 🗄️ MongoDB Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Whitelist your IP address.
4. Copy the connection string.
5. Add it to `MONGODB_URI`.

---

## 🚀 Deployment

This application is optimized for deployment on Vercel.

### Required Environment Variables

```env
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_BASE_URL=
```

Deploy:

```bash
git push origin main
```

Then connect the repository to Vercel and add the environment variables in:

```text
Project Settings → Environment Variables
```

---

## 📸 Screenshots

Add screenshots of:

* Home Page
* Product Listing
* Product Details
* Cart
* Checkout
* Orders Dashboard

---

## 🧪 Future Enhancements

* Product Search
* Wishlist
* Product Reviews
* Coupon System
* Inventory Analytics
* Admin Dashboard Enhancements
* Email Notifications

---

## 👨‍💻 Author

**Divyansh Porwal**

GitHub:
https://github.com/divyanshporwal

---

## 📄 License

This project is intended for learning, portfolio, and demonstration purposes.
