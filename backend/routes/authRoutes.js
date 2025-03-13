const express = require('express');
const router = express.Router();

// Login route - expects already hashed password from frontend
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }
  
  // Check if the input is an email or starid
  const isEmail = identifier.includes('@');
  const query = isEmail 
    ? 'SELECT * FROM users WHERE email = ?'
    : 'SELECT * FROM users WHERE starid = ?';
  
  req.app.locals.db.query(query, [identifier], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Error processing your request', error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    
    // Since password is already hashed on frontend, we can directly compare
    if (password === user.password) {
      // Don't send the password back to the client
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({ 
        message: 'Login successful', 
        user: userWithoutPassword 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

module.exports = router; 