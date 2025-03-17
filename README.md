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
it should already be running.

The repo is currently set up to use llama 3.2 3b parameter model. If you decide to choose a different model in LM Studio,
just change the model name in llamaService.js in the services folder of the backend directory.

1. cd into the root directory of the project, wherever you pulled it to
2. cd backend
3. npm install
4. cd ..
5. cd frontend
6. npm install
7. cd ..
8. cd backend
9. npm start
10. cd ..
11. cd frontend
12. npm start


**Notes on commiting to github**
Please utilize JIRA Issue numbers with a message in the commits so we can see changes done and get the commit revision.

#Cloning the repo to utilize vector database instead of keyword search
