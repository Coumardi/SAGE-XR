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
      user_type: 'Student',
      first_name: 'Developer',
      last_name: 'Developer'
    },
    { 
      starid: 'instructor', 
      email: 'instructor@go.minnstate.edu', 
      // This is a bcrypt hash of "Instructor"
      password: '$2a$10$XHapQZBIoGGgUB8QxNWV6.LbyfLHJHBKRG4YFtg27R9vDFEJkKY3G', 
      user_type: 'Instructor',
      first_name: 'Developer',
      last_name: 'Developer'
    },
    { 
      starid: 'administrator', 
      email: 'administrator@go.minnstate.edu', 
      // This is a bcrypt hash of "Administrator"
      password: '$2a$10$eCyoiO7tQMZJYAJZ6VG0B.9sPUXaLwCg.DsWkQjIBJj0zcUfZ1JHm', 
      user_type: 'Administrator',
      first_name: 'Developer',
      last_name: 'Developer'
    },
    { 
      starid: 'guest', 
      email: 'guest@go.minnstate.edu', 
      // This is a bcrypt hash of "Guest"
      password: '$2a$10$8FPsGQlF0QW9RCNfdnMmG.XK1CwF9Vy.S3qNBVur1Chz.XjzEhRHC', 
      user_type: 'Guest',
      first_name: 'Guest',
      last_name: 'User'
    }
  ];

  // Create initial connection without specifying database
  const initialConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root'
  });

  const dbName = process.env.MYSQL_DATABASE || 'sage_xr_auth';
  let connection;

  try {
    console.log(`Checking if database ${dbName} exists...`);
    
    // Try to create the database if it doesn't exist
    await initialConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Ensured database ${dbName} exists`);
    
    // Close initial connection
    await initialConnection.end();
    
    // Create connection to the specific database
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: dbName
    });

    console.log('Connected to database. Checking if users table exists...');
    
    // Check if the users table exists, if not create it with first_name and last_name columns
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        starid VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        user_type ENUM('Student', 'Instructor', 'Administrator', 'Guest') NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL
      )
    `);
    
    // Check if first_name and last_name columns exist, add them if they don't
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT 'User',
        ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT 'Name'
      `);
      console.log('Added first_name and last_name columns to users table');
    } catch (error) {
      // Columns might already exist, which is fine
      console.log('Name columns already exist or other error:', error.message);
    }
    
    // Drop the name column if it exists (from previous version)
    try {
      await connection.execute(`
        ALTER TABLE users DROP COLUMN IF EXISTS name
      `);
      console.log('Dropped old name column if it existed');
    } catch (error) {
      console.log('Error dropping name column:', error.message);
    }
    
    console.log('Seeding users...');
    
    for (const user of users) {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE starid = ? OR email = ?',
        [user.starid, user.email]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.starid} already exists, updating...`);
        await connection.execute(
          'UPDATE users SET password = ?, user_type = ?, first_name = ?, last_name = ? WHERE starid = ?',
          [user.password, user.user_type, user.first_name, user.last_name, user.starid]
        );
      } else {
        // Insert new user with pre-hashed password and first/last name
        await connection.execute(
          'INSERT INTO users (starid, email, password, user_type, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
          [user.starid, user.email, user.password, user.user_type, user.first_name, user.last_name]
        );
        
        console.log(`Added user: ${user.starid} (${user.user_type})`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (connection) await connection.end();
    console.log('Database connection closed.');
  }
}

// Run the seeding function
seedUsers().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
}); 