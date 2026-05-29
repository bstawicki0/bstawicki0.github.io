const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// ======================
// ENV CONFIG (RENDER)
// ======================
const PORT = process.env.PORT || 3306;

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
        // First connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS fuel_labs');
        await connection.query('USE fuel_labs');

        // Create Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Cart Items table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            )
        `);

        // Create Orders table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                zip_code VARCHAR(20) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            )
        `);

        // Create Order Items table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);

        console.log('Database and tables initialized successfully!');

        // Create connection pool
        pool = mysql.createPool(dbConfig);
    } catch (error) {
        console.error('Error initializing database! Please check XAMPP and your credentials.', error);
        process.exit(1);
    }
}

// Routes

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) return res.status(400).json({ error: 'Username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

        const validPassword = await bcrypt.compare(password, users[0].password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

        res.json({ message: 'Login successful', username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user cart
app.get('/api/cart/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const [items] = await pool.query('SELECT product_id FROM cart_items WHERE username = ?', [username]);

        // We just return array of product IDs that are in the cart
        const productIds = items.map(item => item.product_id);
        res.json(productIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save user cart (Replace entirely)
app.post('/api/cart/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { productIds } = req.body; // Array of product IDs

        // Clear existing cart
        await pool.query('DELETE FROM cart_items WHERE username = ?', [username]);

        // Insert new items
        if (productIds && productIds.length > 0) {
            const values = productIds.map(id => [username, id]);
            await pool.query('INSERT INTO cart_items (username, product_id) VALUES ?', [values]);
        }

        res.json({ message: 'Cart saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new order (Checkout)
app.post('/api/orders', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { username, totalPrice, fullName, address, city, zipCode, paymentMethod, items } = req.body;
        if (!username || !totalPrice || !fullName || !address || !city || !zipCode || !paymentMethod || !items || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert into orders table
        const [orderResult] = await connection.query(
            'INSERT INTO orders (username, total_price, full_name, address, city, zip_code, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, totalPrice, fullName, address, city, zipCode, paymentMethod]
        );
        const orderId = orderResult.insertId;

        // Insert into order_items table
        const orderItemsValues = items.map(item => [
            orderId,
            item.productId,
            item.quantity || 1,
            item.price
        ]);
        
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItemsValues]
        );

        // Clear user's cart
        await connection.query('DELETE FROM cart_items WHERE username = ?', [username]);

        await connection.commit();
        res.json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Get user orders history
app.get('/api/orders/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Fetch all orders for this user sorted by created_at DESC
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE username = ? ORDER BY created_at DESC',
            [username]
        );

        if (orders.length === 0) {
            return res.json([]);
        }

        // Fetch all order items for these orders
        const orderIds = orders.map(o => o.id);
        const [items] = await pool.query(
            'SELECT * FROM order_items WHERE order_id IN (?)',
            [orderIds]
        );

        // Group items by order_id
        const itemsByOrderId = {};
        items.forEach(item => {
            if (!itemsByOrderId[item.order_id]) {
                itemsByOrderId[item.order_id] = [];
            }
            itemsByOrderId[item.order_id].push({
                productId: item.product_id,
                quantity: item.quantity,
                price: item.price
            });
        });

        // Attach items to each order
        const ordersWithItems = orders.map(order => ({
            id: order.id,
            totalPrice: order.total_price,
            fullName: order.full_name,
            address: order.address,
            city: order.city,
            zipCode: order.zip_code,
            paymentMethod: order.payment_method,
            status: order.status,
            createdAt: order.created_at,
            items: itemsByOrderId[order.id] || []
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await initDB();
});
