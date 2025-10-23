const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
const { addUserData } = require("../middleware/permissionMiddleware");

// Middleware dummy user
router.use(addUserData);

// Endpoint check-in dan check-out
router.post("/check-in", presensiController.CheckIn);
router.post("/check-out", presensiController.CheckOut);

module.exports = router;
