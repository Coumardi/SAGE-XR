const mongoose = require('mongoose');

class DocumentMatcherService {
  constructor() {
    this.collectionName = process.env.COLLECTION_NAME || 'test_collection';
    this.collection = null;
  }

  initialize(collection) {
    this.collection = collection;
    console.log('DocumentMatcherService initialized with collection:', this.collectionName);
    return this;
  }

  async findBestMatch(searchKeywords) {
    try {
      // Use the initialized collection or fall back to getting it from mongoose connection
      const collection = this.collection || mongoose.connection.collection(this.collectionName);
      
      const pipeline = [
        // Match documents that have at least one keyword match
        {
          $match: {
            keywords: { 
              $in: searchKeywords 
            }
          }
        },
        // Add fields for scoring
        {
          $addFields: {
            matchingKeywords: {
              $size: {
                $setIntersection: ["$keywords", searchKeywords]
              }
            },
            keywordCount: { $size: "$keywords" },
          }
        },
        // Calculate relevance score
        {
          $addFields: {
            // Score is percentage of matching keywords relative to document's total keywords
            relevanceScore: {
              $divide: ["$matchingKeywords", "$keywordCount"]
            }
          }
        },
        // Sort by most relevant first
        {
          $sort: {
            matchingKeywords: -1,    // First prioritize number of matching keywords
            relevanceScore: -1,      // Then by relevance score
            timestamp: -1            // Finally by timestamp if it exists
          }
        },
        // Limit to best match
        {
          $limit: 1
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      return result[0] || null;
    } catch (error) {
      console.error('Error finding best matching document:', error);
      throw new Error('Failed to find matching document');
    }
  }

  // Helper method to create indexes if needed
  async createIndexes() {
    try {
      const collection = this.collection || mongoose.connection.collection(this.collectionName);
      await collection.createIndex({ keywords: 1 });
      await collection.createIndex({ timestamp: 1 });
      console.log('Indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }
}

module.exports = new DocumentMatcherService();