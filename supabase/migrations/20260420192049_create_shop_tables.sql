/*
  # Create Online Shop Tables

  ## Tables Created

  1. `categories`
     - `id` (uuid, primary key)
     - `name` (text) - Category name
     - `slug` (text) - URL-friendly name

  2. `products`
     - `id` (uuid, primary key)
     - `name` (text) - Product name
     - `description` (text) - Product description
     - `price` (numeric) - Price in EUR
     - `image_url` (text) - Product image URL
     - `category_id` (uuid) - Foreign key to categories
     - `stock` (integer) - Available quantity
     - `featured` (boolean) - Featured on homepage
     - `created_at` (timestamptz)

  3. `orders`
     - `id` (uuid, primary key)
     - `customer_name` (text)
     - `customer_email` (text)
     - `total_amount` (numeric)
     - `status` (text) - pending, confirmed, shipped
     - `created_at` (timestamptz)

  4. `order_items`
     - `id` (uuid, primary key)
     - `order_id` (uuid) - Foreign key to orders
     - `product_id` (uuid) - Foreign key to products
     - `quantity` (integer)
     - `unit_price` (numeric)

  ## Security
  - RLS enabled on all tables
  - Public read access for products and categories
  - Public insert for orders and order_items (checkout flow)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  category_id uuid REFERENCES categories(id),
  stock integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products: public read
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Orders: public insert (checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Order items: public insert (checkout)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
