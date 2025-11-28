const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// ======================= CHECK-IN ==========================
exports.CheckIn = async (req, res) => {
  try {
    console.log("CheckIn by:", req.user);

    const userId = req.user.id;
    const now = new Date();

    // Lokasi (optional)
    const { latitude, longitude } = req.body;

    // Cek apakah user belum checkout
    const existing = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existing) {
      return res.status(400).json({
        message: "Anda sudah check-in dan belum check-out.",
      });
    }

    // Buat presensi baru
    const newRecord = await Presensi.create({
      userId,
      checkIn: now,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    res.status(201).json({
      message: "Check-in berhasil.",
      data: {
        userId,
        checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),
        latitude: newRecord.latitude,
        longitude: newRecord.longitude,
      },
    });
  } catch (err) {
    console.error("❌ CheckIn Error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================= CHECK-OUT ==========================
exports.CheckOut = async (req, res) => {
  try {
    console.log("CheckOut by:", req.user);
    
    const userId = req.user.id;
    const now = new Date();

    // Cari presensi aktif
    const recordToUpdate = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ada check-in aktif. Anda belum check-in atau sudah check-out.",
      });
    }

    // Update check-out
    recordToUpdate.checkOut = now;
    await recordToUpdate.save();

    console.log("✅ CheckOut berhasil:", recordToUpdate.checkOut);

    res.json({
      message: `Check-out berhasil pada ${format(now, "HH:mm:ss", {
        timeZone,
      })} WIB`,
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("❌ CheckOut Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ======================= GET PRESENSI USER LOGIN ==========================
exports.getMyPresensi = async (req, res) => {
  try {
    console.log("🔍 getMyPresensi dipanggil oleh:", req.user);
    
    const userId = req.user.id;

    const records = await Presensi.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role"], // ✅ HAPUS "nama"
        },
      ],
      order: [["checkIn", "DESC"]],
    });

    console.log("✅ Records ditemukan:", records.length);

    res.json({
      message: "Data presensi berhasil diambil",
      data: records,
    });
  } catch (error) {
    console.error("❌ getMyPresensi Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ======================= UPDATE PRESENSI ==========================
exports.updatePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const recordToUpdate = await Presensi.findByPk(id);

    if (!recordToUpdate) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (checkIn) recordToUpdate.checkIn = new Date(checkIn);
    if (checkOut) recordToUpdate.checkOut = new Date(checkOut);

    await recordToUpdate.save();

    res.json({
      message: "Presensi berhasil diperbarui",
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("❌ updatePresensi Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ======================= DELETE PRESENSI ==========================
exports.deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;

    const recordToDelete = await Presensi.findByPk(id);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    await recordToDelete.destroy();

    res.status(200).json({ message: "Presensi berhasil dihapus" });
  } catch (error) {
    console.error("❌ deletePresensi Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};