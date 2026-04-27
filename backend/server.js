require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const queryRoutes = require('./routes/queryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const cookieParser = require('cookie-parser');
const { verifyToken, checkRole } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/matricsRoutes');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database: 'sage_xr_auth',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to local database.');
  connection.release();
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB SageXR database'))
  .catch(err => console.error('MongoDB connection error:', err));

app.locals.db = db;

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error processing your request', error: err });
    }
    if (results.length > 0) {
      res.status(200).send({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/metrics', metricsRoutes);

try {
  const queryRoutes = require('./routes/queryRoutes');
  app.use('/api/query', queryRoutes);
} catch (error) {
  console.log('queryRoutes not found, skipping...');
}

try {
  const uploadRoutes = require('./routes/uploadRoutes');
  app.use('/api/upload', uploadRoutes);
} catch (error) {
  console.log('uploadRoutes not found, skipping...');
}

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  try {
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
      console.log('HTTPS Server running on port 443');
    });
  } catch (error) {
    console.error('Error setting up HTTPS server:', error);
  }
}

app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});