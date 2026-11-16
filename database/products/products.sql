-- Database for Shop-EE application (PostgreSQL)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE products IS 'Product catalog for Shop-EE application';
-- Seed data
INSERT INTO products (name, category, value, stock)
VALUES ('Laptop HP 15', 'electronics', 899.99, 10),
    ('Wireless Mouse', 'electronics', 19.99, 100),
    ('Coffee Maker', 'home', 49.99, 25) ON CONFLICT DO NOTHING;