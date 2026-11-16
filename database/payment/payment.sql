-- Database for Shop-EE application (PostgreSQL)
CREATE TABLE IF NOT EXISTS payment (
    id SERIAL PRIMARY KEY,
    user_id INT,
    order_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE payment IS 'Payments for Shop-EE application';
-- Seed data
INSERT INTO payment (user_id, order_id, amount, method, status)
VALUES (1, 1, 919.98, 'credit_card', 'completed'),
    (2, 2, 19.99, 'paypal', 'pending');