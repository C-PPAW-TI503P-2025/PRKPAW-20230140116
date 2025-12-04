import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/reports/daily";
const BACKEND_URL = "http://localhost:3001";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Modal state
  const [previewFoto, setPreviewFoto] = useState(null);

  const fetchReports = useCallback(async (query = "") => {
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
      setFilteredReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]); 
      setFilteredReports([]);
      setError(
        err.response && err.response.status === 403 
        ? "Akses Ditolak: Halaman ini hanya untuk Admin." 
        : (err.response ? err.response.data.message : "Gagal mengambil data")
      );
    }
  }, [navigate]);

  useEffect(() => {
    fetchReports(); 
  }, [fetchReports]);

  // Filter data berdasarkan email dan tanggal
  const handleFilter = () => {
    let filtered = [...reports];

    // Filter by email
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (p) => new Date(p.checkIn) >= new Date(startDate)
      );
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (p) => new Date(p.checkIn) <= endDateTime
      );
    }

    setFilteredReports(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilteredReports(reports);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Hitung statistik
  const totalPresensi = filteredReports.length;
  const totalCheckout = filteredReports.filter((p) => p.checkOut).length;
  const belumCheckout = totalPresensi - totalCheckout;

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* JUDUL */}
        <h1 className="text-3xl font-extrabold text-pink-700 mb-8 border-l-4 border-pink-500 pl-4">
          📊 Laporan Presensi Harian
        </h1>

        {/* FILTER SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">🔍 Filter Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search by Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Pengguna
              </label>
              <input
                type="text"
                placeholder="Cari email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleFilter}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-lg shadow-md hover:from-pink-600 hover:to-rose-700 transition"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* STATISTIK CARDS */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Presensi</p>
                  <p className="text-3xl font-bold text-pink-600">{totalPresensi}</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sudah Check-Out</p>
                  <p className="text-3xl font-bold text-green-600">{totalCheckout}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Belum Check-Out</p>
                  <p className="text-3xl font-bold text-yellow-600">{belumCheckout}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      Email Pengguna
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      Check-In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      Check-Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-pink-700 uppercase tracking-wider">
                      Bukti Foto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-50">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((presensi, index) => (
                      <tr key={presensi.id} className="hover:bg-pink-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {presensi.user ? presensi.user.email : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">
                              {formatDate(presensi.checkIn)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-xs">
                            {formatTime(presensi.checkIn)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {presensi.checkOut ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium text-xs">
                              {formatTime(presensi.checkOut)}
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full italic text-xs">
                              Belum Check-Out
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {presensi.buktiFoto ? (
                            <img
                              src={`${BACKEND_URL}/${presensi.buktiFoto}`}
                              alt="Bukti Presensi"
                              className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200 shadow-sm cursor-pointer hover:border-pink-400 hover:shadow-md transition transform hover:scale-110"
                              onClick={() => setPreviewFoto(`${BACKEND_URL}/${presensi.buktiFoto}`)}
                            />
                          ) : (
                            <span className="text-gray-400 italic text-xs">Tidak ada foto</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
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
          </div>
        )}
      </div>

      {/* MODAL PREVIEW FOTO */}
      {previewFoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setPreviewFoto(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <button
              onClick={() => setPreviewFoto(null)}
              className="absolute -top-10 right-0 text-white bg-pink-600 hover:bg-pink-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition transform hover:scale-110"
            >
              ✕
            </button>
            
            <img
              src={previewFoto}
              alt="Bukti Presensi Full"
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;