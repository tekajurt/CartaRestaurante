-- Create the menu_items table in your Supabase database
-- Run this SQL in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- Create an index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);

-- Create an index on available for filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items (available);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read available menu items (for public carta page)
CREATE POLICY "Anyone can view available menu items" ON menu_items FOR
SELECT USING (available = true);

-- Policy: Allow authenticated users to read all menu items
CREATE POLICY "Authenticated users can view all menu items" ON menu_items FOR
SELECT TO authenticated USING (true);

-- Policy: Allow authenticated users to insert menu items
CREATE POLICY "Authenticated users can insert menu items" ON menu_items FOR INSERT TO authenticated
WITH
    CHECK (true);

-- Policy: Allow authenticated users to update menu items
CREATE POLICY "Authenticated users can update menu items" ON menu_items
FOR UPDATE
    TO authenticated USING (true)
WITH
    CHECK (true);

-- Policy: Allow authenticated users to delete menu items
CREATE POLICY "Authenticated users can delete menu items" ON menu_items FOR DELETE TO authenticated USING (true);

-- Optional: Insert some sample data
INSERT INTO
    menu_items (
        name,
        description,
        price,
        category,
        available
    )
VALUES (
        'Ensalada César',
        'Lechuga romana, crutones, parmesano y aderezo césar',
        8.50,
        'Entradas',
        true
    ),
    (
        'Bruschetta',
        'Pan tostado con tomate, albahaca y aceite de oliva',
        6.00,
        'Entradas',
        true
    ),
    (
        'Pasta Carbonara',
        'Pasta con salsa carbonara, panceta y queso parmesano',
        14.00,
        'Platos Principales',
        true
    ),
    (
        'Filete de Res',
        'Filete de res a la parrilla con papas y vegetales',
        22.00,
        'Platos Principales',
        true
    ),
    (
        'Tiramisú',
        'Postre italiano con café, mascarpone y cacao',
        7.00,
        'Postres',
        true
    ),
    (
        'Cheesecake',
        'Pastel de queso con salsa de frutos rojos',
        7.50,
        'Postres',
        true
    ),
    (
        'Limonada Natural',
        'Limonada fresca hecha en casa',
        3.50,
        'Bebidas',
        true
    ),
    (
        'Café Espresso',
        'Café espresso italiano',
        2.50,
        'Bebidas',
        true
    );