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

## My contributions

This project was originally developed as a group project. I later  made improvements including:

- Integrated Pinecone vector search
- Improved embedding and retrieval pipeline
- Fixed memory/ context filtering issues
- Improved backend query flow
- Built AI performance monitoring using InfluxDB to track response time, token usage, GPU and Memory usage


