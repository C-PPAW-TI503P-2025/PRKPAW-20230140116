import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/reports/daily";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]); 
      setError(
        err.response && err.response.status === 403 
        ? "Akses Ditolak: Halaman ini hanya untuk Admin." 
        : (err.response ? err.response.data.message : "Gagal mengambil data")
      );
    }
  };

  useEffect(() => {
    fetchReports(); 
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm ? `?email=${searchTerm}` : "";
    fetchReports(query); 
  };

  return (
    // UBAH: Background Pink Lembut
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* JUDUL */}
        <h1 className="text-3xl font-extrabold text-pink-700 mb-8 border-l-4 border-pink-500 pl-4">
          Laporan Presensi Harian
        </h1>

        {/* SEARCH BAR & BUTTON */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // UBAH: Focus ring warna pink
              className="flex-grow px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
            />
            {/* UBAH: Tombol Gradasi Pink */}
            <button
              type="submit"
              className="py-3 px-8 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl shadow-md hover:from-pink-600 hover:to-rose-700 hover:shadow-lg transition transform hover:scale-105"
            >
              Cari Data
            </button>
          </form>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        {!error && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-pink-100">
            <table className="min-w-full divide-y divide-gray-200">
              {/* UBAH: Header Tabel Background Pink */}
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                    Email Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                    Waktu Check-In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                    Waktu Check-Out
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-50">
                {reports.length > 0 ? (
                  reports.map((presensi, index) => (
                    // UBAH: Hover effect row jadi pink sangat muda
                    <tr key={presensi.id} className="hover:bg-pink-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {presensi.user ? presensi.user.email : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium text-xs">
                          {new Date(presensi.checkIn).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {presensi.checkOut ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium text-xs">
                            {new Date(presensi.checkOut).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                            })}
                          </span>
                        ) : (
                          <span className="text-pink-500 italic text-xs">
                            Belum Check-Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-4xl mb-2">📭</span>
                        <p>Tidak ada data laporan yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportPage;