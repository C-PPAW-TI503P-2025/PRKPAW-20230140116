exports.testConnection = (req, res) => {
  const { message, deviceId } = req.body;
  console.log(`📡 [IOT] Pesan dari ${deviceId}: ${message}`);
  res.status(200).json({ status: "ok", reply: "Server menerima koneksi!" });
};

exports.receiveSensorData = (req, res) => {
  const { suhu, kelembaban, cahaya } = req.body;
  console.log(`🔥 [LOG] Suhu: ${suhu}°C | Lembab: ${kelembaban}% | Cahaya: ${cahaya}`);
  res.status(200).json({ status: "diterima" });
};


exports.getSensorHistory = async (req, res) => {
  try {
    // Ambil 20 data terakhir, diurutkan dari yang paling baru
    const data = await SensorLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    // Kita balik urutannya (reverse) agar di grafik muncul dari Kiri (Lama) ke Kanan (Baru)
    const formattedData = data.reverse(); 

    res.json({
      status: "success",
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
