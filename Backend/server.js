require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows your S3/CloudFront frontend to talk to this API
app.use(express.json()); // Parses incoming JSON payloads

// Database Connection Pool
// Using a pool is much better than createConnection for web servers
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'your-rds-endpoint.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'YOUR_RDS_PASSWORD',
    database: process.env.DB_NAME || 'contact_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. Health Check Route (For the ALB)
app.get('/', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// 2. API Endpoint for Form Submission
app.post('/api/signup', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }

    const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
    pool.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ success: true, message: 'Thank you! Your message has been sent.' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
