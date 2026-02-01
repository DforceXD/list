const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'affiliate_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Get all affiliate links (public)
app.get('/api/links', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT l.*, c.name as category_name 
             FROM affiliate_links l 
             LEFT JOIN categories c ON l.category_id = c.id 
             WHERE l.is_active = 1 
             ORDER BY l.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all categories (public)
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE is_active = 1 ORDER BY name'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND role = "admin"',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin CRUD Operations
// Get all links (admin)
app.get('/api/admin/links', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT l.*, c.name as category_name 
             FROM affiliate_links l 
             LEFT JOIN categories c ON l.category_id = c.id 
             ORDER BY l.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new link
app.post('/api/admin/links', authenticateToken, async (req, res) => {
    try {
        const { title, description, url, image_url, category_id, is_active } = req.body;
        
        const [result] = await pool.execute(
            `INSERT INTO affiliate_links 
             (title, description, url, image_url, category_id, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, url, image_url, category_id, is_active || 1]
        );
        
        res.json({ 
            id: result.insertId, 
            message: 'Link created successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update link
app.put('/api/admin/links/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, url, image_url, category_id, is_active } = req.body;
        
        await pool.execute(
            `UPDATE affiliate_links 
             SET title = ?, description = ?, url = ?, 
                 image_url = ?, category_id = ?, is_active = ? 
             WHERE id = ?`,
            [title, description, url, image_url, category_id, is_active, id]
        );
        
        res.json({ message: 'Link updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete link
app.delete('/api/admin/links/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM affiliate_links WHERE id = ?', [id]);
        
        res.json({ message: 'Link deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Category CRUD Operations (similar to links)
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/categories', authenticateToken, async (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO categories (name, description, is_active) VALUES (?, ?, ?)',
            [name, description, is_active || 1]
        );
        
        res.json({ id: result.insertId, message: 'Category created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;
        
        await pool.execute(
            'UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?',
            [name, description, is_active, id]
        );
        
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check admin authentication
app.get('/api/admin/check-auth', authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
