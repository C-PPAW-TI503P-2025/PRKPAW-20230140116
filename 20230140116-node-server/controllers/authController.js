const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

exports.register = async (req, res) => {
try {
const { nama, email, password, role } = req.body;

if (!nama || !email || !password) {
  return res.status(400).json({ message: "Nama, email, dan password harus diisi" });
}
if (role && !['mahasiswa', 'admin'].includes(role)) {
  return res.status(400).json({ message: "Role tidak valid. Harus 'mahasiswa' atau 'admin'." });
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = await User.create({
  nama,
  email,
  password: hashedPassword,
  role: role || 'mahasiswa'
});

res.status(201).json({
  message: "Registrasi berhasil",
  data: {
    id: newUser.id,
    nama: newUser.nama,
    email: newUser.email,
    role: newUser.role
  }
});


} catch (error) {
if (error.name === 'SequelizeUniqueConstraintError') {
return res.status(400).json({ message: "Email sudah terdaftar." });
}
res.status(500).json({
message: "Terjadi kesalahan pada server",
error: error.message
});
}
};


exports.login = async (req, res) => {
try {
const { email, password } = req.body;




const user = await User.findOne({ where: { email } });
if (!user) {
  return res.status(404).json({ message: "Email tidak ditemukan." });
}


const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({ message: "Password salah." });
}


const token = jwt.sign(
  { id: user.id, role: user.role, nama: user.nama },
  JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({
  message: "Login berhasil",
  token: token
});


} catch (error) {
console.log("LOGIN ERROR:", error);
res.status(500).json({
message: "Terjadi kesalahan pada server",
error: error.message
});
}
};
