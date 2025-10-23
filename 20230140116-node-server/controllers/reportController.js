const { Presensi } = require("../models");


exports.getDailyReport = async (req, res) => {
  try {
    console.log("Controller: Mengambil data laporan harian dari database...");
    
   
    const presensiRecords = await Presensi.findAll({
      order: [['checkIn', 'DESC']]  
    });
    
    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: presensiRecords,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};