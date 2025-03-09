require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testDatabaseConnection() {
  let sslConfig;
  
  // Determine SSL configuration based on environment variables
  if (process.env.MYSQL_SSL_MODE === 'REQUIRED') {
    if (process.env.MYSQL_CA_CERT) {
      // Option 1: CA cert from environment variable
      sslConfig = {
        ca: process.env.MYSQL_CA_CERT
      };
    } else if (process.env.MYSQL_CA_CERT_PATH) {
      // Option 2: CA cert from file
      const certPath = path.resolve(process.env.MYSQL_CA_CERT_PATH);
      sslConfig = {
        ca: fs.readFileSync(certPath)
      };
    } else {
      // Fallback: SSL without certificate validation (less secure)
      sslConfig = {
        rejectUnauthorized: false
      };
    }
  } else {
    sslConfig = false; // SSL disabled
  }

  // Create connection configuration
  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: sslConfig
  };

  console.log('Attempting to connect to MySQL database...');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`SSL Mode: ${process.env.MYSQL_SSL_MODE}`);
  console.log(`Using CA Certificate: ${sslConfig ? 'Yes' : 'No'}`);

  try {
    // Create connection
    const connection = await mysql.createConnection(config);
    console.log('Successfully connected to the database!');

    // Get list of tables
    console.log('Fetching list of tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    // If there are tables, query the first one
    if (tables.length > 0) {
      const firstTable = Object.values(tables[0])[0];
      console.log(`\nFetching all entries from table: ${firstTable}`);
      const [rows] = await connection.query(`SELECT * FROM ${firstTable} LIMIT 10`);
      console.log(`Found ${rows.length} entries in ${firstTable}`);
      console.log('Sample data:');
      console.log(JSON.stringify(rows, null, 2));
    } else {
      console.log('No tables found in the database.');
    }

    // Close the connection
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nAuthentication failed. Try the following:');
      console.log('1. Verify your username and password are correct');
      console.log('2. Check if your account has proper privileges');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\nConnection refused. Possible reasons:');
      console.log('1. Database server is not running');
      console.log('2. Firewall is blocking the connection');
      console.log('3. Host or port is incorrect');
    } else if (error.code === 'CERT_SIGNATURE_FAILURE' || error.message.includes('SSL')) {
      console.log('\nSSL connection issue. Try:');
      console.log('1. Setting MYSQL_SSL_MODE to DISABLED in .env file for testing');
      console.log('2. Configuring proper SSL certificates');
    }
  }
}

// Run the test
testDatabaseConnection();
