# Secure MERN Auth & To-Do

### Overview
A full-stack MERN application demonstrating a secure JSON Web Token (JWT) authentication system.
It features a modern, responsive React frontend integrated with protected CRUD operations for a user-specific To-Do list.

### Flow
1. Users register or log in through the React client, and the Express backend validates credentials against MongoDB.
2. Upon successful authentication, the server issues an HTTP-only JWT cookie to securely maintain the user's session.
3. The client relies on this secure token in subsequent requests to manage their private To-Do items in the database.

### Local Setup
1. Clone the repository and copy `.env.example` to `.env` in the root directory, ensuring `MONGO_URI` and `SECRET_KEY` are set.
2. Open a terminal, navigate to the `server` directory, run `npm install`, and start the backend using `node index.js`.
3. Open a second terminal, navigate to the `client` directory, run `npm install`, and start the frontend using `npm run dev`.
