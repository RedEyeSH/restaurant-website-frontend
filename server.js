const https = require('https');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Serve config
app.get('/config', (req, res) => {
    res.json({ apiKey: process.env.HSL_KEY });
});

// Load SSL certificate and key
const options = {
    key: fs.readFileSync('path/to/private.key'), // Replace with the path to your private.key
    cert: fs.readFileSync('path/to/certificate.crt'), // Replace with the path to your certificate.crt
};

// Start HTTPS server
https.createServer(options, app).listen(8000,'0.0.0.0', () => {
    console.log('HTTPS server running on https://0.0.0.0:8000');
});

