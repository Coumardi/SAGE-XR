// Import test dependencies
const mysql = require('mysql2/promise');

// Create manual mocks for mysql
const mockExecute = jest.fn();
const mockEnd = jest.fn();
const mockConnection = {
  execute: mockExecute,
  end: mockEnd
};

// Mock the actual mysql module
mysql.createConnection = jest.fn().mockResolvedValue(mockConnection);

// Mock dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock the module under test
jest.mock('../utils/seedUsers', () => {
  // Original module with exported function accessible for testing
  const originalModule = jest.requireActual('../utils/seedUsers');
  return {
    seedUsers: originalModule.seedUsers,
    // Prevent auto-running of the module
    runIfMain: jest.fn()
  };
});

// Import the module under test
const { seedUsers } = require('../utils/seedUsers');

describe('seedUsers', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Set up environment variables
    process.env.MYSQL_HOST = 'test-host';
    process.env.MYSQL_PORT = '3306';
    process.env.MYSQL_USER = 'test-user';
    process.env.MYSQL_PASSWORD = 'test-password';
    process.env.MYSQL_DATABASE = 'test-database';
    
    // Default mock responses
    mockExecute.mockResolvedValue([[]]);
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  test('seedUsers connects to the database and creates users', async () => {
    // Configure mock for SELECT query to return no users
    mockExecute.mockImplementation((query) => {
      if (query.includes('SELECT * FROM users')) {
        return Promise.resolve([[]]);
      }
      return Promise.resolve([]);
    });
    
    // Call the function that will be tested
    await seedUsers();
    
    // Check that createConnection was called twice (once for initial connection, once for db connection)
    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
    
    // Check that database creation was attempted
    expect(mockExecute).toHaveBeenCalledWith(
      'CREATE DATABASE IF NOT EXISTS test-database'
    );
    
    // Check that table creation was attempted
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS users')
    );
    
    // Check for column addition
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE users')
    );
    
    // Check for connections being closed
    expect(mockEnd).toHaveBeenCalledTimes(2);
    
    // Check for successful completion message
    expect(console.log).toHaveBeenCalledWith('Database seeding completed successfully!');
  });
  
  test('seedUsers updates existing users', async () => {
    // Mock the first user existing, others are new
    mockExecute.mockImplementation((query, params) => {
      if (query.includes('SELECT * FROM users')) {
        if (params && params[0] === 'student') {
          return Promise.resolve([[{ 
            id: 1, 
            starid: 'student', 
            email: 'student@go.minnstate.edu',
            user_type: 'Student'
          }]]);
        }
        return Promise.resolve([[]]);
      }
      return Promise.resolve([]);
    });
    
    // Call the function
    await seedUsers();
    
    // Check that update was attempted
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password'),
      expect.arrayContaining(['student'])
    );
    
    // Check for user update message
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already exists, updating'));
  });
  
}); 