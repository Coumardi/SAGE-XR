# SAGE XR AI Chatbot
SAGE XR is an AI-powered chatbot that uses Retrieval-Augmented Generation (RAG) to answer questions based on uploaded documents.
It uses embeddings, vector database (Pinecone), and local Llama model to generate context-aware responses.

# Features

- Upload document (PDF, DOCX, TEXT)
- Automatic text chunking
- Embedding generation (convert texts to vectors)
- Vector search (Pinecone)
- Context-aware, AI responses (Llama)
- Response-time monitoring
- Chat-based interface

## How SAGE-XR Works

User question
-> Convert to embedding
-> Search vector database
-> Retrieve relevant documents
-> Build context 
-> send to Llama model
-> Generate response

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Vector Database: Pinecone
- AI Model: Local Llama (LM Studio)
- Embeddings: Local embedding API

## Setup 

cd backend
npm install
npm start

cd frontend
npm install 
npm start


