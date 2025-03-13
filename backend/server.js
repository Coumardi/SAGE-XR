require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const queryRoutes = require('./routes/queryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cookieParser = require('cookie-parser');
const { verifyToken, checkRole } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'sage_xr_auth'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Make db available to routes
app.locals.db = db;

// Login route
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

// Routes
app.use('/api/auth', authRoutes);

// Add other routes conditionally if they exist
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

// Protected routes example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});