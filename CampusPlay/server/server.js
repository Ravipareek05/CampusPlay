// require("dotenv").config();

// const path = require("path");
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const morgan = require("morgan");
// const mongoose = require("mongoose");

// const app = express();

// // --- Middleware
// app.use(morgan("dev"));
// app.use(cors());
// app.use(express.json());
// app.use(cookieParser());

// // --- Static (serves your html/css/js/images)
// app.use(express.static(path.join(__dirname)));

// // --- API routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/tournaments", require("./routes/tournaments"));

// // --- HTML routes (optional when using static)
// app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
// app.get("/login", (_req, res) =>
//   res.sendFile(path.join(__dirname, "login.html"))
// );
// app.get("/tournaments", (_req, res) =>
//   res.sendFile(path.join(__dirname, "tournaments.html"))
// );

// // --- DB connect then start server
// const PORT = process.env.PORT || 3000;
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   });
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

// --- Middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// --- Correctly serve static files from the 'client' folder ---
// The '..' tells it to go up one directory from 'server' to 'CampusPlay'
const clientPath = path.join(__dirname, "..", "client");
app.use(express.static(clientPath));


// --- API routes (These are correct)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tournaments", require("./routes/tournaments"));


// --- HTML routes (These now point to the client folder)
app.get("/", (_req, res) => res.sendFile(path.join(clientPath, "index.html")));

app.get("/login", (_req, res) =>
  res.sendFile(path.join(clientPath, "login.html"))
);

app.get("/tournaments", (_req, res) =>
  res.sendFile(path.join(clientPath, "tournaments.html"))
);

// --- DB connect then start server
const PORT = process.env.PORT || 3000;
mongoose
  // CORRECTED: Use the variable from your .env file, likely MONGODB_URI or MONGO_URI
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });