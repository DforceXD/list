-- Create database
CREATE DATABASE IF NOT EXISTS affiliate_db;
USE affiliate_db;

-- Users table (for admin authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate links table
CREATE TABLE affiliate_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    category_id INT,
    clicks INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create default admin user (password: admin123)
-- Note: You need to hash the password before inserting. You can use the following command in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hashedPassword = await bcrypt.hash('admin123', 10);
-- Then insert the hashed password.
-- For now, we leave it as a placeholder.
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('E-commerce', 'Online shopping stores'),
('Technology', 'Tech products and services'),
('Education', 'Learning platforms and courses'),
('Finance', 'Banking and investment services');

-- Insert sample affiliate links
INSERT INTO affiliate_links (title, description, url, category_id) VALUES
('Amazon', 'World''s largest online retailer', 'https://amazon.com', 1),
('Udemy', 'Online learning platform', 'https://udemy.com', 3),
('Digital Ocean', 'Cloud hosting provider', 'https://digitalocean.com', 2);
