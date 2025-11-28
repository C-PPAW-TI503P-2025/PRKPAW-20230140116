const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    console.log("🔍 getDailyReport dipanggil oleh:", req.user);
    
    const { email, tanggalMulai, tanggalSelesai } = req.query; // ✅ Ganti 'nama' jadi 'email'
    
    let options = { 
      where: {},
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'] // ✅ Hapus 'nama'
      }],
      order: [['checkIn', 'DESC']]
    };

    // ✅ Filter berdasarkan email user (dari relasi)
    if (email) {
      options.include[0].where = {
        email: {
          [Op.like]: `%${email}%`
        }
      };
    }

    // Filter berdasarkan tanggal
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      
      options.where.checkIn = {
        [Op.between]: [startDate, endDate]
      };
    } else if (tanggalMulai) {
      const startDate = new Date(tanggalMulai);
      startDate.setHours(0, 0, 0, 0);
      
      options.where.checkIn = {
        [Op.gte]: startDate
      };
    } else if (tanggalSelesai) {
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      
      options.where.checkIn = {
        [Op.lte]: endDate
      };
    } else {
      // ✅ TAMBAHAN: Jika tidak ada filter tanggal, tampilkan presensi hari ini saja
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      options.where.checkIn = {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      };
    }

    const records = await Presensi.findAll(options);

    console.log("✅ Records ditemukan:", records.length);

    res.json({
      message: "Laporan berhasil diambil",
      reportDate: new Date().toISOString(),
      totalRecords: records.length,
      filters: {
        email: email || null, // ✅ Ganti 'nama' jadi 'email'
        tanggalMulai: tanggalMulai || null,
        tanggalSelesai: tanggalSelesai || null
      },
      data: records,
    });
  } catch (error) {
    console.error("❌ Error getDailyReport:", error);
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message
    });
  }
};