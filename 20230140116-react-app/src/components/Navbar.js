import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // UBAH: Background jadi pink-600 agar senada dengan login
    <nav className="bg-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button 
              onClick={() => user ? navigate('/dashboard') : navigate('/login')}
              // UBAH: Hover effect jadi pink-200
              className="text-2xl font-bold hover:text-pink-200 transition"
            >
              PresensiApp
            </button>
            
            {/* Menu untuk user yang sudah login */}
            {user && (
              <>
                {/* Menu Dashboard */}
                {location.pathname !== '/dashboard' && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    // UBAH: Hover jadi pink-200
                    className="hover:text-pink-200 transition flex items-center space-x-1"
                  >
                    <span>🏠</span>
                    <span>Dashboard</span>
                  </button>
                )}

                {/* Menu Presensi */}
                {location.pathname !== '/presensi' && (
                  <button 
                    onClick={() => navigate('/presensi')}
                    className="hover:text-pink-200 transition flex items-center space-x-1"
                  >
                    <span>📋</span>
                    <span>Presensi</span>
                  </button>
                )}
                
                {/* Menu Laporan */}
                {user.role === 'admin' && location.pathname !== '/reports' && (
                  <button 
                    onClick={() => navigate('/reports')}
                    className="hover:text-pink-200 transition flex items-center space-x-1"
                  >
                    <span>📊</span>
                    <span>Laporan</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* UBAH: Background info user jadi pink-700 (lebih gelap dari navbar) */}
                <div className="flex items-center space-x-2 bg-pink-700 px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-sm font-medium">
                    {user.email}
                  </span>
                  {/* Badge role tetap warna standar untuk pembeda (Kuning/Hijau) atau bisa diubah ke Putih/Pink */}
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    user.role === 'admin' 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-green-400 text-green-900'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 Mahasiswa'}
                  </span>
                </div>
                
                {/* Tombol Logout - Tetap Merah tapi sedikit diperhalus border radiusnya */}
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition flex items-center space-x-2 shadow-md"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Tombol Login (saat belum login)
              <button
                onClick={() => navigate('/login')}
                // UBAH: Jadi Putih teks Pink agar kontras dengan background Navbar
                className="bg-white text-pink-600 font-bold hover:bg-pink-50 px-6 py-2 rounded-xl transition shadow-md"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;