ç -- Database for Shop-EE application (PostgreSQL)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES profile(id) ON DELETE
    SET NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_value DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE orders IS 'Orders for Shop-EE application';