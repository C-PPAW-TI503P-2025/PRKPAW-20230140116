const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

// Middleware validasi tanggal
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus berupa format tanggal yang valid (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus berupa format tanggal yang valid (ISO8601)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validasi gagal", errors: errors.array() });
    }
    next();
  },
];

// ✅ PERBAIKAN: Ubah nama endpoint dan method
router.post("/checkin", permission.authenticateToken, presensiController.CheckIn);  // ✅ Lowercase + POST
router.post("/checkout", permission.authenticateToken, presensiController.CheckOut); // ✅ Lowercase + POST

// Route untuk get presensi user yang login
router.get("/", permission.authenticateToken, presensiController.getMyPresensi);

// Routes admin untuk update dan delete
router.put("/:id", permission.authenticateToken, permission.isAdmin, validatePresensiUpdate, presensiController.updatePresensi);
router.delete("/:id", permission.authenticateToken, permission.isAdmin, presensiController.deletePresensi);

module.exports = router;