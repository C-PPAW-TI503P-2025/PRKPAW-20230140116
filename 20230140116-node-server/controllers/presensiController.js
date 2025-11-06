const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const nama = req.user.nama;
    const waktuSekarang = new Date();

    const existingRecord = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in dan belum check-out.",
      });
    }

    const newRecord = await Presensi.create({
      userId,
      nama,
      checkIn: waktuSekarang,
    });

    res.status(201).json({
      message: `Check-in berhasil pada ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ada check-in aktif. Anda belum check-in atau sudah check-out.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: "Check-out berhasil",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

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
    res.json({ message: "Presensi berhasil diperbarui", data: recordToUpdate });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

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
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};