# MiniMart

MiniMart is a grocery e-commerce web application built with React, TypeScript, Vite, and Supabase. The project includes product browsing, category filtering, cart management, authentication, order placement, user profiles, reviews, contact messages, and admin management pages.

## Project Type

React Project with Supabase Backend

## Main Features

- Modern React frontend using TypeScript
- Supabase authentication
- User registration, login, logout, email verification, and password reset
- Product catalog
- Product search, category filtering, sorting, and pagination
- Product details page
- Featured products on the home page
- Local cart system using browser storage
- Order placement through Supabase RPC functions
- User order history
- User profile management
- Product reviews
- Contact form with Supabase storage and local fallback
- Admin pages for:
  - Products
  - Orders
  - Users
- Product image support through Supabase Storage

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Routing:** React Router DOM
- **Animation/UI:** Framer Motion
- **Charts:** Recharts

## Requirements

Make sure the following are installed:

- Node.js
- npm
- Git
- A Supabase project

## Installation

Clone the repository:

```bash
git clone https://github.com/DerpToon/MiniMart.git
cd MiniMart/MiniMart
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env .env.local
```

If `.env` is not available, create a new `.env` file manually.

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the project for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

## Environment Variables

The app requires these variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These are used by the Supabase client inside the project.

## Supabase Setup

The code expects Supabase to provide authentication, database tables, storage, and RPC functions.

Expected database-related resources include:

- `profiles`
- `categories`
- `products`
- `product_reviews`
- `orders`
- `order_items`
- `contact_messages`

Expected storage bucket:

- `product-images`

Expected RPC functions:

- `place_order`
- `get_my_orders`

Make sure Row Level Security policies are configured correctly in Supabase so that users and admins can access only the data they are allowed to access.

## Main Pages

- `/` — Home page
- `/login` — Login page
- `/register` — Registration page
- `/forgot-password` — Forgot password page
- `/reset-password` — Reset password page
- `/catalog` — Product catalog
- `/products/:productId` — Product details
- `/about` — About page
- `/contact` — Contact page
- `/profile` — User profile
- `/orders` — User orders
- `/cart` — Cart page
- `/admin/products` — Admin product management
- `/admin/orders` — Admin order management
- `/admin/users` — Admin user management

## Project Structure

```text
src/
  Services/          Supabase service functions
  app/               App-level utilities/config
  assets/            Static assets
  components/        Reusable UI and layout components
  contexts/          Authentication and cart context providers
  css/               Styling files
  hooks/             Custom React hooks
  lib/               Supabase client and utilities
  pages/             Application pages
  types/             TypeScript type definitions
  App.tsx            Main router
  main.tsx           React entry point
```

## Main Services

- `AuthService` — login, signup, logout, password reset
- `ProductService` — product CRUD, categories, product reviews, image upload
- `CategoryService` — category fetching
- `OrderService` — order placement and order management
- `ProfileService` — profile and role-related operations
- `ContactService` — contact message submission and retrieval

## Notes

- Cart data is stored locally in the browser.
- Authentication state is managed through Supabase Auth.
- Admin routes should be protected by role checks.
- Product images should be uploaded to the Supabase `product-images` bucket.

## Future Improvements

- Add full Supabase SQL schema to the repository
- Add seed data for products and categories
- Improve admin analytics
- Add payment gateway integration
- Add stronger inventory management
- Add order email notifications
- Add automated tests
- Improve accessibility and SEO

## Author

MiniMart was developed as a React project using Supabase as the backend.
