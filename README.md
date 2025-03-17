# SAGE_XR_React
React based SAGE XR Project.
How to stup and run backend and front end for the project.
Ensure you have Node.js installed.

After pulling from main:

Make sure you have MySQL Workbench and MySQL Server installed on your computer. Make sure the database is running your local host, port 3306.
There is a script in /backend/utils called seedUsers.js, if this is your first time loading the software you will need to run this script. It automatically creates the database you need
for authentication information.

Make sure the .env file is in the ***backend*** directory

Ensure LM Studio is running on your computer, and the LLMs are loaded. If you've used it before and haven't manually disabled the LLM, 
it should already be running. The models used for development are text-embedding-nomic-embed-text-v1.5 **and** hermes-3-llama-3.2-3b.

llama 3.2 3b (3b standing for 3 billion parameters) seems to be the limit for consumer-grade hardware. If using the VizLab computer, you can probably work up to 13b + parameters
and maintain very fast performance.

The repo is currently set up to use llama 3.2 3b parameter model. If you decide to choose a different model in LM Studio,
just change the model name in llamaService.js in the services folder of the backend directory. The Quadrant database is currently set up to accept 768-dimension vectors, 
which nomic 1.5 works perfectly for us. Qdrant is flexible to accept more dimensions, if developers would like to experiment with more accurate vector embedding models (some do multiple thousands of dimensions).

1. cd into the root directory of the project, wherever you pulled it to
2. cd backend
3. npm install
4. node utils/seedUsers.js (automatically generates the development database, SO LONG as MySQL server is running)
5. cd ..
6. cd frontend
7. npm install
8. cd ..
9. cd backend
10. npm start
11. cd ..
12. cd frontend
13. npm start


**Notes on commiting to github**
Please utilize JIRA Issue numbers with a message in the commits so we can see changes done and get the commit revision.

#Cloning the repo to utilize vector database instead of keyword search

** .ENV SKELETON **
This is a skeleton of what should be included in your .env file. Reach out to the previous team or Professor Mark Gill on how to fill this out.

# LLM Configuration
LLAMA_API_ENDPOINT=http://127.0.0.1:1234
PORT=5000

# Qdrant Configuration
QDRANT_API_KEY=
QDRANT_URL=
QDRANT_COLLECTION=

# MySQL Database Connection (Local)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=sage_xr_auth
