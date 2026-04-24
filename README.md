# Graph Analyzer

This is a full-stack web application that takes directed graph edges as input, processes them to find trees and cycles, and visualizes the hierarchy. It consists of an Express backend and a React frontend built with Vite.

## Project Structure

The repository is organized as a monorepo containing both parts of the application:
- /backend: Contains the Express server and all the graph processing logic (inside utils.js).
- /frontend: Contains the React application and styling.

## Prerequisites

Make sure you have Node.js installed on your machine.

## Local Setup

### Running the Backend

1. Open your terminal and navigate to the backend directory:
   cd backend

2. Install the required dependencies:
   npm install

3. Start the server:
   npm start

The backend API will start running on http://localhost:4000.

### Running the Frontend

1. Open a new terminal window and navigate to the frontend directory:
   cd frontend

2. Install the dependencies:
   npm install

3. Start the development server:
   npm run dev

The web interface will be available at http://localhost:5173.

## API Details

Endpoint: POST /bfhl

The API expects a JSON payload containing an array of strings representing directed edges.

Example request:
{
  "data": ["A->B", "A->C", "X->Y", "Y->X", "1->2"]
}

The API returns a JSON response containing the parsed hierarchies, any detected cycles, a list of invalid entries, duplicate edges, and a summary count.

## Deployment Notes

- Backend: Can be deployed to services like Render or Koyeb. Set the root directory to `backend`, build command to `npm install`, and start command to `npm start`.
- Frontend: Best deployed to Vercel. Set the root directory to `frontend`. You must add an environment variable named `VITE_API_URL` that points to your live backend URL (e.g., https://your-backend.onrender.com) so the React app knows where to send requests.
