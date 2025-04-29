const cors = require('cors');
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
require('dotenv').config();
// Configure CORS to allow all origins
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.use(express.json()); // Parse JSON request bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '')));

// Make .env file usable.
app.get('/config', (req, res) => {
    res.json({ apiKey: process.env.HSL_KEY });
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));