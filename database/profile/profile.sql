-- Database for Shop-EE application (PostgreSQL)
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE profile IS 'User profiles for Shop-EE application';
-- Seed data
INSERT INTO profile (first_name, last_name, email, nickname, role)
VALUES (
        'Ana',
        'Garcia',
        'ana@shopee.com',
        'ana_g',
        'admin'
    ),
    (
        'Luis',
        'Perez',
        'luis@shopee.com',
        'luis_p',
        'user'
    ) ON CONFLICT (email) DO NOTHING;