require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const booksRoutes = require('./routes/booksRoutes');

const app = express();
app.use(express.json());

// Enforce HTTPS only
const certPath = '/etc/letsencrypt/live/anil.dev/fullchain.pem';
const keyPath = '/etc/letsencrypt/live/anil.dev/privkey.pem';

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('❌ FATAL ERROR: Let\'s Encrypt certificates not found!');
    console.error(`   Expected: ${certPath}`);
    console.error(`   Expected: ${keyPath}`);
    console.error('❌ Cannot start server without HTTPS certificates.');
    process.exit(1);
}

const cert = fs.readFileSync(certPath);
const key = fs.readFileSync(keyPath);
const server = https.createServer({ cert, key }, app);
console.log('✅ HTTPS server created with Let\'s Encrypt certificates');

// Middleware: Enforce HTTPS only
app.use((req, res, next) => {
    if (req.protocol !== 'https') {
        return res.status(403).json({ error: 'HTTPS only. Insecure connections not allowed.' });
    }
    // Add security headers
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/books', booksRoutes);

app.get('/', (req, res) => res.send('API running'));

// Initialize Socket.io with CORS enabled for both your website and Android app
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with "https://ankit.pro"
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- Helper: Get visitor IP from request ---
function getVisitorIP(req) {
    return (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1')
        .split(',')[0]
        .trim();
}

// --- Helper: Fetch geolocation using built-in https module ---
function getGeolocation(ip) {
    return new Promise((resolve) => {
        const url = `https://ip-api.com/json/${ip}?fields=query,country,city,lat,lon,isp,org`;
        
        https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status === 'success') {
                        resolve({
                            ip: parsed.query,
                            country: parsed.country,
                            city: parsed.city,
                            lat: parsed.lat,
                            lng: parsed.lon,
                            isp: parsed.isp || parsed.org || 'Unknown'
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => {
            resolve(null);
        });
    });
}

// --- 1. Connection Logging ---
io.on('connection', (socket) => {
    console.log('✅ A client connected');
    console.log('🔗 Socket ID:', socket.id);
    console.log('📊 Total connections:', io.engine.clientsCount);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected: ' + socket.id);
        console.log('📊 Total connections:', io.engine.clientsCount);
    });

    socket.on('error', (error) => {
        console.log('⚠️ Socket error:', error);
    });
});

// --- 2. API Endpoint for your website (ankit.pro) ---
app.post('/api/report-visit', async (req, res) => {
    try {
        const { page, pageName, pageHost, userAgent, platform, language, timezone, screenWidth, screenHeight, referrer, timestamp } = req.body;
        
        // Get visitor IP from request headers
        const ip = getVisitorIP(req);
        
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📍 NEW VISITOR DETECTED`);
        console.log(`${'='.repeat(70)}`);
        
        console.log(`\n🌐 Network Information:`);
        console.log(`   IP Address: ${ip}`);
        
        console.log(`\n📋 Page Information:`);
        console.log(`   URL: ${page}`);
        console.log(`   Title: ${pageName}`);
        console.log(`   Host: ${pageHost}`);
        console.log(`   Referrer: ${referrer}`);
        
        console.log(`\n💻 Device Information:`);
        console.log(`   Platform: ${platform}`);
        console.log(`   Language: ${language}`);
        console.log(`   Timezone: ${timezone}`);
        console.log(`   Screen: ${screenWidth}x${screenHeight}`);
        
        // Fetch geolocation on the server (no CORS issues!)
        console.log(`\n🔍 Fetching geolocation from IP...`);
        const geoData = await getGeolocation(ip);
        
        let city = 'Unknown';
        let country = 'Unknown';
        let lat = 0;
        let lng = 0;
        let isp = 'Unknown';
        
        if (geoData) {
            city = geoData.city;
            country = geoData.country;
            lat = geoData.lat;
            lng = geoData.lng;
            isp = geoData.isp;
            
            console.log(`   ✅ City: ${city}`);
            console.log(`   ✅ Country: ${country}`);
            console.log(`   ✅ Coordinates: ${lat}, ${lng}`);
            console.log(`   ✅ ISP: ${isp}`);
        } else {
            console.log(`   ⚠️ Geolocation unavailable`);
        }
        
        const visitorData = {
            id: "vis_" + Date.now(),
            title: "Visit on ankit.pro",
            message: `🌍 Visitor from ${city}, ${country}`,
            
            // Location
            ip: ip,
            city: city,
            country: country,
            latitude: lat,
            longitude: lng,
            isp: isp,
            
            // Page
            page: page,
            pageName: pageName,
            pageHost: pageHost,
            referrer: referrer,
            
            // Device
            platform: platform,
            language: language,
            timezone: timezone,
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            userAgent: userAgent,
            
            // Timestamp
            timestamp: timestamp || Date.now()
        };
        
        console.log(`\n🚀 Broadcasting to all connected Android apps...`);
        console.log(`${'='.repeat(70)}\n`);
        
        // Broadcast to all connected Socket.io clients
        io.emit('new_visitor', visitorData);
        
        res.status(200).json({
            success: true,
            message: "Visitor notification sent to Android apps",
            visitor: visitorData
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 1234;
// Start the server on all network interfaces
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔐 HTTPS-ONLY SERVER`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🔗 Local: https://localhost:${PORT}`);
    console.log(`🌐 Remote: https://anil.dev:${PORT}`);
    console.log(`🛡️  Security: HTTPS enforced, all HTTP requests rejected`);
    console.log(`${'='.repeat(60)}\n`);
});