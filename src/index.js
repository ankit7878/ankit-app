require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const booksRoutes = require('./routes/booksRoutes');

const app = express();
app.use(express.json());
const server = http.createServer(app);

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
// Your website should send a POST request here whenever someone visits
app.post('/api/report-visit', (req, res) => {
    const { city, country, lat, lng, ip } = req.body;

    const visitorData = {
        id: "vis_" + Date.now(),
        title: "Visit on ankit.pro",
        message: `New visitor from ${city || 'Unknown Location'} is viewing ${ip || 'the site'}`,
        latitude: lat || 0,
        longitude: lng || 0,
        timestamp: Date.now()
    };

    console.log("🚀 Broadcasting visitor to Android:", visitorData.message);

    // This triggers the 'new_visitor' event in your Android app
    io.emit('new_visitor', visitorData);

    res.status(200).json({ success: true, message: "Notification sent to app" });
});

const PORT = process.env.PORT || 5000;
// Start the server on all network interfaces
server.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📱 For Android Emulator: http://10.0.2.2:${PORT}`);
    console.log(`-----------------------------------------`);
});