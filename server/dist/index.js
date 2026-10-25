import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
// Trust proxy for Render deployment
app.set('trust proxy', 1);
// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Rate limiter for API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
// Mandatory Health Check Endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'earnloop-rewards-app',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
    });
});
// API Routes
app.use('/api', apiRoutes);
// Dedicated Standalone Admin Portal Route
const adminPagePath = path.resolve(__dirname, '../../client/public/admin.html');
const adminDistPath = path.resolve(__dirname, '../../client/dist/admin.html');
app.get('/admin', (req, res) => {
    if (fs.existsSync(adminDistPath)) {
        return res.sendFile(adminDistPath);
    }
    if (fs.existsSync(adminPagePath)) {
        return res.sendFile(adminPagePath);
    }
    res.status(404).send('Admin page not found');
});
app.get('/admin.html', (req, res) => {
    if (fs.existsSync(adminDistPath)) {
        return res.sendFile(adminDistPath);
    }
    if (fs.existsSync(adminPagePath)) {
        return res.sendFile(adminPagePath);
    }
    res.status(404).send('Admin page not found');
});
// Serve static frontend build from client/dist if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}
else {
    app.get('/', (req, res) => {
        res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>EarnLoop API Server</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h1>🚀 EarnLoop API Server is Running</h1>
          <p>Health Check: <a href="/health">/health</a></p>
          <p>Admin Portal: <a href="/admin">/admin</a></p>
          <p>Frontend will be available once <code>npm run build</code> is executed.</p>
        </body>
      </html>
    `);
    });
}
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 EarnLoop Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/health`);
    console.log(`🛡️ Admin Portal: http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin PIN default: ${process.env.ADMIN_PIN || 'EarnLoop@Admin#2026'}`);
    console.log(`=========================================`);
});
