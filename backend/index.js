const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// ENV CONFIG (RENDER)
// ======================
const PORT = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
};

// ======================
// DB POOL
// ======================
let pool;

async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);

        // Create tables (bez CREATE DATABASE — robi się w hostingu)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            )
        `);

        console.log('Database connected & tables ready');
    } catch (err) {
        console.error('DB ERROR:', err);
        process.exit(1);
    }
}

// ======================
// ROUTES
// ======================

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ error: 'Missing fields' });

        const [existing] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0)
            return res.status(400).json({ error: 'Username exists' });

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashed]
        );

        res.json({ message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0)
            return res.status(400).json({ error: 'Invalid credentials' });

        const user = users[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login success', username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET CART
app.get('/api/cart/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const [items] = await pool.query(
            'SELECT product_id FROM cart_items WHERE username = ?',
            [username]
        );

        res.json(items.map(i => i.product_id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// SAVE CART
app.post('/api/cart/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { productIds } = req.body;

        await pool.query(
            'DELETE FROM cart_items WHERE username = ?',
            [username]
        );

        if (productIds?.length) {
            const values = productIds.map(id => [username, id]);

            await pool.query(
                'INSERT INTO cart_items (username, product_id) VALUES ?',
                [values]
            );
        }

        res.json({ message: 'Cart saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initDB();
});
