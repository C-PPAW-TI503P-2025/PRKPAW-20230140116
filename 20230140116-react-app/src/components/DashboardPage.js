import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Pengguna");
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      // Mengambil email dari token
      setUserName(decoded.email || "Pengguna");
      setRole(decoded.role);
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border border-pink-100 max-w-md w-full relative overflow-hidden">
        
        {/* Dekorasi Background Circle di pojok (opsional, untuk estetika) */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-pink-100 rounded-br-full -z-0 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-pink-100 rounded-tl-full -z-0 opacity-50"></div>

        <div className="relative z-10">
          {/* Avatar Icon */}
          <div className="w-24 h-24 bg-gradient-to-tr from-pink-200 to-rose-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
            <span className="text-4xl">👋</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Selamat Datang!
          </h1>
          
          <p className="text-pink-600 font-medium text-lg mb-6 break-words">
            {userName}
          </p>

          {/* Info Card Kecil */}
          <div className="bg-pink-50 rounded-2xl p-5 mb-8 border border-pink-100">
            <div className="grid grid-cols-2 gap-4 divide-x divide-pink-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                <p className="font-bold text-gray-800 capitalize mt-1">
                  {role === 'admin' ? '👑 Admin' : '🎓 Mahasiswa'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Hari Ini</p>
                <p className="font-bold text-gray-800 mt-1 text-sm">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Hint Text */}
          <p className="text-gray-400 text-sm mb-8">
            Silakan gunakan menu pada <strong>Navbar</strong> di atas untuk mengakses fitur lainnya.
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;