const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedUsers() {
  // These passwords would be pre-hashed from the frontend
  // For testing purposes, we're using example hashed values
  const users = [
    { 
      starid: 'student', 
      email: 'student@go.minnstate.edu', 
      // This is a bcrypt hash of "Student"
      password: '$2a$10$XFE0rDoJcQ.zH6J7Kny8W.RXCf5CAlcq0NiGMOGi/SsOQRGpLkOFi', 
      user_type: 'Student' 
    },
    { 
      starid: 'instructor', 
      email: 'instructor@go.minnstate.edu', 
      // This is a bcrypt hash of "Instructor"
      password: '$2a$10$XHapQZBIoGGgUB8QxNWV6.LbyfLHJHBKRG4YFtg27R9vDFEJkKY3G', 
      user_type: 'Instructor' 
    },
    { 
      starid: 'administrator', 
      email: 'administrator@go.minnstate.edu', 
      // This is a bcrypt hash of "Administrator"
      password: '$2a$10$eCyoiO7tQMZJYAJZ6VG0B.9sPUXaLwCg.DsWkQjIBJj0zcUfZ1JHm', 
      user_type: 'Administrator' 
    },
    { 
      starid: 'guest', 
      email: 'guest@go.minnstate.edu', 
      // This is a bcrypt hash of "Guest"
      password: '$2a$10$8FPsGQlF0QW9RCNfdnMmG.XK1CwF9Vy.S3qNBVur1Chz.XjzEhRHC', 
      user_type: 'Guest' 
    }
  ];

  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'sage_xr_auth'
  });

  try {
    console.log('Connected to database. Seeding users...');
    
    for (const user of users) {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE starid = ? OR email = ?',
        [user.starid, user.email]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.starid} already exists, skipping...`);
        continue;
      }
      
      // Insert new user with pre-hashed password
      await connection.execute(
        'INSERT INTO users (starid, email, password, user_type) VALUES (?, ?, ?, ?)',
        [user.starid, user.email, user.password, user.user_type]
      );
      
      console.log(`Added user: ${user.starid} (${user.user_type})`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

// Run the seeding function
seedUsers().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
}); 