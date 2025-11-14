// src/components/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      setUserName(decoded.nama || decoded.email || "Pengguna");
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-pink-200 max-w-lg">
        <h1 className="text-4xl font-bold text-pink-600 mb-4 animate-pulse">
          Welcome, {userName} 💖
        </h1>

        <p className="text-gray-600 mb-8 text-sm">
          Login berhasil. Selamat beraktivitas!
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="py-2 px-6 bg-red-400 text-white rounded-xl hover:bg-red-500 transition shadow-md"
          >
            Logout ❌
          </button>

          <button
            onClick={() =>
              Swal.fire({
                title: "Coming Soon!",
                text: "Fitur akan segera hafir guys...",
                icon: "info",
                confirmButtonText: "Oke!",
                confirmButtonColor: "#ec4899",
                background: "#fff0f6",
              })
            }
            className="py-2 px-6 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition shadow-md"
            >
              Fitur Lain 🌟
            </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
