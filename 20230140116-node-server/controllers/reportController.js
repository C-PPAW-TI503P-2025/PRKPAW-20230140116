const presensiRecords = require("../data/presensiData");

exports.getDailyReport = (req, res) => {
  console.log("Controller: Mengambil data laporan harian...");
  res.json({
    reportDate: new Date().toLocaleDateString(),
    data: presensiRecords,
  });
};
