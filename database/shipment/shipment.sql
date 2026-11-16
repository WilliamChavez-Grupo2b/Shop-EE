-- Database for Shop-EE application (PostgreSQL)
CREATE TABLE IF NOT EXISTS shipment (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tracking VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE shipment IS 'Shipments for Shop-EE application';