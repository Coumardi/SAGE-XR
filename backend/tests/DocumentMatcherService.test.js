//Unit Tests for the DocumentMatcherService class

const documentMatcherService = require('../services/documentMatcherService'); // Adjust path as needed
const mongoose = require('mongoose');

//  Unit Tests for the initialize() method
//  Test Cases:
//  1. Ensure that the initialization method sets the collection property
//  2. Ensure that the initialization method logs the correct collection name
describe('DocumentMatcherService - initialize()', () => {
  beforeEach(() => {
  });
  it('should initialize with a provided collection', () => {
    const mockCollection = {};
    documentMatcherService.initialize(mockCollection);
    expect(documentMatcherService.collection).toBe(mockCollection);
  });

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

jest.mock('mongoose', () => ({
    connection: {
      collection: jest.fn().mockReturnValue({
        aggregate: jest.fn(),
        createIndex: jest.fn(),
      }),
    },
  }));
  
    //  Unit Tests for the findBestMatch() method
    //  Test Cases:
    //  1. Ensure that the method returns the most relevant document for valid input
    //  2. Ensure that the method returns null if no matching documents are found
    //  3. Ensure that the method throws an error if aggregation fails
    //  4. Ensure that the method handles an empty searchKeywords array gracefully
  describe('DocumentMatcherService', () => {
    let mockCollection;
  
    beforeEach(() => {
      mockCollection = mongoose.connection.collection();
      documentMatcherService.initialize(mockCollection);
  
      // Reset all mocks
      mockCollection.aggregate.mockReset();
      mockCollection.createIndex.mockReset();
  
      // Default implementations
      mockCollection.aggregate.mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValueOnce([]),
      }));
      mockCollection.createIndex.mockResolvedValue();
    });
  
    describe('findBestMatch()', () => {
      it('should return the most relevant document for valid input', async () => {
        const mockKeywords = ['test'];
        const mockResult = [{ id: 'doc1', keywords: ['test'] }];
        mockCollection.aggregate.mockImplementation(() => ({
          toArray: jest.fn().mockResolvedValueOnce(mockResult),
        }));
  
        const result = await documentMatcherService.findBestMatch(mockKeywords);
        expect(result).toEqual(mockResult[0]);
        expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      });
  
      it('should return null if no matching documents are found', async () => {
        const mockKeywords = ['test'];
        mockCollection.aggregate.mockImplementation(() => ({
          toArray: jest.fn().mockResolvedValueOnce([]),
        }));
  
        const result = await documentMatcherService.findBestMatch(mockKeywords);
        expect(result).toBeNull();
      });
  
      it('should throw an error if aggregation fails', async () => {
        const mockKeywords = ['test'];
        mockCollection.aggregate.mockImplementation(() => ({
          toArray: jest.fn().mockRejectedValueOnce(new Error('Aggregation error')),
        }));
  
        await expect(documentMatcherService.findBestMatch(mockKeywords)).rejects.toThrow(
          'Failed to find matching document'
        );
      });
  
      it('should handle an empty searchKeywords array gracefully', async () => {
        mockCollection.aggregate.mockImplementation(() => ({
          toArray: jest.fn().mockResolvedValueOnce([]),
        }));
  
        const result = await documentMatcherService.findBestMatch([]);
        expect(result).toBeNull();
      });
    });
    //  Unit Tests for the createIndexes() method
    //  Test Cases:
    //  1. Ensure that the method creates indexes successfully
    //  2. Ensure that the method logs an error if index creation fails
    describe('createIndexes()', () => {
      it('should create indexes successfully', async () => {
        mockCollection.createIndex.mockResolvedValueOnce();
  
        await documentMatcherService.createIndexes();
  
        expect(mockCollection.createIndex).toHaveBeenCalledWith({ keywords: 1 });
        expect(mockCollection.createIndex).toHaveBeenCalledWith({ timestamp: 1 });
      });
  
      it('should log an error if index creation fails', async () => {
        const errorMessage = 'Index creation error';
        mockCollection.createIndex.mockRejectedValueOnce(new Error(errorMessage));
  
        console.error = jest.fn();
  
        await documentMatcherService.createIndexes();
  
        expect(console.error).toHaveBeenCalledWith(
          'Error creating indexes:',
          expect.any(Error)
        );
      });
    });
  });