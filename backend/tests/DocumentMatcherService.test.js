//Unit Tests for the DocumentMatcherService class

const documentMatcherService = require('../services/documentMatcherService'); // Adjust path as needed
const mongoose = require('mongoose');

describe('DocumentMatcherService - initialize()', () => {
  beforeEach(() => {
  });
  //Ensure that the initialization method sets the collection property
  it('should initialize with a provided collection', () => {
    const mockCollection = {};
    documentMatcherService.initialize(mockCollection);
    expect(documentMatcherService.collection).toBe(mockCollection);
  });

  //Ensure that the initialization method logs the correct collection name
  it('should log initialization with the correct collection name', () => {
    console.log = jest.fn(); // Mock console.log
    const mockCollection = {};
    documentMatcherService.initialize(mockCollection);
    expect(console.log).toHaveBeenCalledWith(
      'DocumentMatcherService initialized with collection:',
      documentMatcherService.collectionName
    );
  });
});

//Unit Tests for the findBestMatch() method
//Test Cases:
//1. Ensure that the method returns the most relevant document for valid input
//2. Ensure that the method returns null if no matching documents are found
//3. Ensure that the method throws an error if aggregation fails
//4. Ensure that the method handles an empty searchKeywords array gracefully
jest.mock('mongoose', () => ({
    connection: {
      collection: jest.fn().mockReturnValue({
        aggregate: jest.fn(), // Mock aggregate function
      }),
    },
  }));
  
  describe('DocumentMatcherService - findBestMatch()', () => {
    let mockCollection;
  
    beforeEach(() => {
      mockCollection = mongoose.connection.collection();
      documentMatcherService.initialize(mockCollection); // Initialize the instance with the mocked collection
  
      // Mock the aggregate method to return a cursor-like object
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValueOnce([]), // Default mock behavior for toArray
      }));
    });
  
    it('should return the most relevant document for valid input', async () => {
      const mockKeywords = ['test'];
      const mockResult = [{ id: 'doc1', keywords: ['test'] }];
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValueOnce(mockResult), // Mock toArray to resolve with mockResult
      }));
  
      const result = await documentMatcherService.findBestMatch(mockKeywords);
      expect(result).toEqual(mockResult[0]);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
    });
  
    it('should return null if no matching documents are found', async () => {
      const mockKeywords = ['test'];
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValueOnce([]), // Mock toArray to resolve with an empty array
      }));
  
      const result = await documentMatcherService.findBestMatch(mockKeywords);
      expect(result).toBeNull();
    });
  
    it('should throw an error if aggregation fails', async () => {
      const mockKeywords = ['test'];
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockRejectedValueOnce(new Error('Aggregation error')), // Mock toArray to reject
      }));
  
      await expect(documentMatcherService.findBestMatch(mockKeywords)).rejects.toThrow('Failed to find matching document');
    });
  
    it('should handle an empty searchKeywords array gracefully', async () => {
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValueOnce([]), // Mock toArray to resolve with an empty array
      }));
  
      const result = await documentMatcherService.findBestMatch([]);
      expect(result).toBeNull();
    });
  });