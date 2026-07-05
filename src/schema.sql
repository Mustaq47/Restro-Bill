-- ==========================================
-- PostgreSQL Database Schema (Supabase/Postgres)
-- Project: Localized Digital-Analog Restaurant Bridge
-- ==========================================

-- 1. Create Enums for consistent status tracking
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card');
CREATE TYPE service_request_type AS ENUM ('waiter', 'water', 'bill');
CREATE TYPE service_request_status AS ENUM ('pending', 'resolved');

-- 2. Tables Table (QR-coded physical tables)
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INT NOT NULL UNIQUE CHECK (table_number > 0),
    qr_code_url TEXT,
    status VARCHAR(50) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'service_required')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Menu Categories Table
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Menu Items Table (Product catalog with private recipe instructions/ingredients tracking)
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_veg BOOLEAN NOT NULL DEFAULT FALSE,
    is_non_veg BOOLEAN NOT NULL DEFAULT FALSE,
    is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    recipe_instructions TEXT, -- Secret kitchen instructions
    ingredients TEXT,          -- Private back-office key structural ingredients list
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table (Primary checkout)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    table_number INT NOT NULL, -- Hardcoded for speed/decoupling
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table (Junction table)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL, -- Snapshot at time of order
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Service Requests Table (Instant digital counter requests)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    table_number INT NOT NULL,
    type service_request_type NOT NULL,
    status service_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Users / Customers Table (Mandatory country-coded phone number validation constraint)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL CHECK (phone_number ~ '^\+?[0-9]{10,12}$'),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Performance Indexes & Optimizations
-- ==========================================
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);

-- ==========================================
-- Supabase Realtime Setup
-- Enable realtime tracking for critical dashboard streams
-- ==========================================
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table service_requests;
alter publication supabase_realtime add table menu_items;

-- ==========================================
-- Automation: Auto-update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_modtime BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_modtime BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_modtime BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
