const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  
  console.log('Login attempt:', { identifier });
  
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }
  
  // Check if the input is an email or starid
  const isEmail = identifier.includes('@');
  const query = isEmail 
    ? 'SELECT * FROM users WHERE email = ?'
    : 'SELECT * FROM users WHERE starid = ?';
  
  console.log('Query:', query, 'Identifier:', identifier);
  
  req.app.locals.db.query(query, [identifier], async (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Error processing your request', error: err.message });
    }
    
    console.log('Query results:', results.length > 0 ? 'User found' : 'No user found');
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    console.log('User found:', { starid: user.starid, email: user.email, user_type: user.user_type });
    
    // For development purposes, just check if password matches user_type
    // This is NOT secure for production but helps with testing
    if (password === user.user_type) {
      console.log('Password matches user_type - allowing login for development');
      
      // Create a JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          starid: user.starid, 
          user_type: user.user_type, 
          first_name: user.first_name,
          last_name: user.last_name
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      // Don't send the password back to the client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({ 
        message: 'Login successful', 
        user: userWithoutPassword,
        token
      });
    }
    
    // If not using the development shortcut, try normal password comparison
    try {
      console.log('Comparing password...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
      
      if (isMatch) {
        // Create a JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            starid: user.starid, 
            user_type: user.user_type, 
            first_name: user.first_name,
            last_name: user.last_name
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1h' }
        );
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        
        res.status(200).json({ 
          message: 'Login successful', 
          user: userWithoutPassword,
          token
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(500).json({ message: 'Error processing your request' });
    }
  });
});

// Get current user route
router.get('/me', (req, res) => {
  // This route will be protected by the verifyToken middleware
  // The user data will be available in req.user
  res.status(200).json({ user: req.user });
});

// Logout route
router.post('/logout', (req, res) => {
  // Since we're using JWT, we don't need to do anything server-side
  // The client will remove the token
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router; 