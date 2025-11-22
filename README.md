# CampusPlay

CampusPlay is a full-stack college gaming platform designed to connect students through competitive e-sports and community engagement. The system features real-time game statistics, integrated live streaming for watching campus matches, and comprehensive tournament management tools, fostering a vibrant campus gaming community.

## Key Features

-   Tournaments & Leaderboards: Organize and participate in campus-wide tournaments. Track rankings with real-time leaderboards.
-   Live Streaming: Watch live matches and streams directly on the platform.
-   Game Stats: View detailed statistics for players and teams.
-   Community Hub: Connect with other students, form teams, and share updates on the community feed.
-   User Authentication: Secure login and profile management for students.

## Tech Stack

-   Frontend: HTML5, CSS3, JavaScript (Vanilla)
-   Backend: Node.js, Express.js
-   Database: MongoDB (Mongoose)
-   Authentication: JSON Web Tokens (JWT)

## Installation & Setup

Follow these steps to get the project running locally:

1.  Clone the repository
    ```bash
    git clone <repository-url>
    cd CampusPlay
    ```

2.  Install Dependencies
    Navigate to the server directory and install the required packages.
    ```bash
    cd server
    npm install
    ```

3.  Environment Configuration
    Create a `.env` file in the `server` directory and add your MongoDB connection string.
    ```env
    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    ```

4.  Start the Server
    ```bash
    npm start
    # Or for development with nodemon:
    npm run dev
    ```

5.  Access the Application
    Open your browser and visit:
    `http://localhost:3000`

## Project Structure

```
CampusPlay/
├── client/           # Frontend static files (HTML, CSS, JS, Images)
└── server/           # Backend API and Server logic
    ├── models/       # Database schemas
    ├── routes/       # API endpoints
    ├── controllers/  # Request handlers
    └── server.js     # Entry point
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the platform.

## License

This project is licensed under the ISC License.
