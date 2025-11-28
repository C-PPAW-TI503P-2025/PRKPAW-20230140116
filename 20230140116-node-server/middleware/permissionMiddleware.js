const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt"); // ✅ Import dari config

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak: Token tidak ada." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("🔥 JWT VERIFY ERROR:", err.message);
      return res.status(403).json({ message: "Token tidak valid." });
    }

    req.user = user;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Akses ditolak: Hanya untuk admin" });
  }
};

exports.isMahasiswa = (req, res, next) => {
  if (req.user && req.user.role === "mahasiswa") {
    console.log("✅ Middleware: Izin mahasiswa diberikan.");
    next();
  } else {
    console.log("❌ Middleware: Gagal! Pengguna bukan mahasiswa.");
    return res.status(403).json({ message: "Akses ditolak: Hanya untuk mahasiswa" });
  }
};