const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();
const PORT = 3001;

// Import routers
const bookRoutes = require("./routes/books");
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");

const authRoutes = require("./routes/auth");
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Home Page for API");
});

app.use("/api/books", bookRoutes);
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});
