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
const ankitProRoutes = require('./routes/ankitProRoutes');
const codingLeagueRoutes = require('./routes/codingLeagueRoutes');
const suggestMeMoreRoutes = require('./routes/suggestMeMoreRoutes');

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
app.use('/api/ankit_pro', ankitProRoutes);
app.use('/api/coding_league', codingLeagueRoutes);
app.use('/api/suggest_me_more', suggestMeMoreRoutes);

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

// --- Helper: Reverse geocode latitude/longitude to get city/country ---
function reverseGeocode(latitude, longitude) {
    return new Promise((resolve) => {
        // Using Nominatim (OSM) - free, no API key needed
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        
        const request = https.get(url, { timeout: 5000, headers: { 'User-Agent': 'PortfolioVisitorTracker' } }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`   📡 Reverse Geocoding Response:`, JSON.stringify(parsed));
                    
                    if (parsed.address) {
                        const address = parsed.address;
                        const country = address.country || 'Unknown';
                        const city = address.city || address.town || address.village || 'Unknown';
                        
                        const result = {
                            country: country,
                            city: city,
                            lat: latitude,
                            lng: longitude
                        };
                        console.log(`   ✅ Reverse geocoded:`, result);
                        resolve(result);
                    } else {
                        console.log(`   ⚠️ No address found in response`);
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`   ❌ JSON parse error:`, e.message);
                    resolve(null);
                }
            });
        });
        
        request.on('error', (err) => {
            console.log(`   ❌ Request error:`, err.message);
            resolve(null);
        });
        
        request.on('timeout', () => {
            console.log(`   ⏱️  Request timeout`);
            request.destroy();
            resolve(null);
        });
    });
}

// --- Helper: Fallback - Get geolocation from IP if coordinates not available ---
function getGeolocationFromIP(ip) {
    return new Promise((resolve) => {
        const url = `https://ip-api.com/json/${ip}?fields=country,city,lat,lon,status,message`;
        
        const request = https.get(url, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`   📡 IP Geolocation Response:`, JSON.stringify(parsed));
                    
                    if (parsed.status === 'success') {
                        const result = {
                            country: parsed.country || 'Unknown',
                            city: parsed.city || 'Unknown',
                            lat: parsed.lat !== undefined ? parsed.lat : 0,
                            lng: parsed.lon !== undefined ? parsed.lon : 0
                        };
                        console.log(`   ✅ IP Geolocation found:`, result);
                        resolve(result);
                    } else {
                        console.log(`   ⚠️ No geolocation data available`);
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`   ❌ JSON parse error:`, e.message);
                    resolve(null);
                }
            });
        });
        
        request.on('error', (err) => {
            console.log(`   ❌ Request error:`, err.message);
            resolve(null);
        });
        
        request.on('timeout', () => {
            console.log(`   ⏱️  Request timeout`);
            request.destroy();
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
        const { page, pageName, pageHost, userAgent, platform, language, timezone, screenWidth, screenHeight, referrer, timestamp, latitude, longitude } = req.body;
        
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
        
        // Fetch geolocation - prioritize browser location, fallback to IP
        let geoData = null;
        if (latitude && longitude) {
            console.log(`\n🔍 Browser location available - reverse geocoding...`);
            geoData = await reverseGeocode(latitude, longitude);
        } else {
            console.log(`\n🔍 Browser location not available - using IP geolocation...`);
            geoData = await getGeolocationFromIP(ip);
        }
        
        let city = 'Unknown';
        let country = 'Unknown';
        let lat = 0;
        let lng = 0;
        
        if (geoData) {
            city = geoData.city;
            country = geoData.country;
            lat = geoData.lat;
            lng = geoData.lng;
            
            console.log(`   ✅ City: ${city}`);
            console.log(`   ✅ Country: ${country}`);
            console.log(`   ✅ Coordinates: ${lat}, ${lng}`);
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
            latitude: latitude,
            longitude: longitude,
            
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