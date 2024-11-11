#helper method to add timestamps to mongodb documents

from pymongo import MongoClient
from pymongo.operations import UpdateOne
from datetime import datetime
import time
from tqdm import tqdm  # For progress bar

def update_timestamps(uri, db_name, collection_name):
    """
    Update all documents in a MongoDB collection with timestamps if they don't have one.
    Includes progress bar and error handling.
    """
    try:
        # Connect to MongoDB
        client = MongoClient(uri)
        db = client[db_name]
        collection = db[collection_name]
        
        # Count documents without timestamp
        docs_to_update = collection.count_documents({"timestamp": {"$exists": False}})
        
        if docs_to_update == 0:
            print("No documents need timestamp updates.")
            return
        
        print(f"Found {docs_to_update} documents without timestamps.")
        
        # Get all document IDs that need updating
        docs = collection.find(
            {"timestamp": {"$exists": False}}, 
            {"_id": 1}
        )
        
        # Prepare bulk operation
        bulk_operations = []
        now = datetime.utcnow()
        
        # Create progress bar
        with tqdm(total=docs_to_update, desc="Updating documents") as pbar:
            for doc in docs:
                bulk_operations.append(
                    UpdateOne(
                        {"_id": doc["_id"]},
                        {"$set": {"timestamp": now}}
                    )
                )
                
                # Process in batches of 1000
                if len(bulk_operations) >= 1000:
                    collection.bulk_write(bulk_operations)
                    pbar.update(len(bulk_operations))
                    bulk_operations = []
            
            # Process any remaining operations
            if bulk_operations:
                collection.bulk_write(bulk_operations)
                pbar.update(len(bulk_operations))
        
        print("\nTimestamp update completed successfully!")
        
        # Verify updates
        remaining = collection.count_documents({"timestamp": {"$exists": False}})
        print(f"Documents without timestamps after update: {remaining}")
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    # Connection settings
    MONGO_URI = "mongodb+srv://SE:SE490Group@cluster0.2ilsj.mongodb.net/"
    DATABASE_NAME = "test_database"
    COLLECTION_NAME = "test_collection"
    
    # Add timestamps
    print("Starting timestamp update process...")
    start_time = time.time()
    
    update_timestamps(MONGO_URI, DATABASE_NAME, COLLECTION_NAME)
    
    end_time = time.time()
    print(f"\nTotal execution time: {end_time - start_time:.2f} seconds")