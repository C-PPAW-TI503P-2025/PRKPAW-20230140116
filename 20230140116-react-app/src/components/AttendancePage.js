import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ❗ COMPONENT FIX AGAR MAP TIDAK PATAH
function FixMapSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3001/api/presensi";
  const getToken = () => localStorage.getItem("token");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
        }
      );
    } else {
      setError("Browser tidak mendukung geolocation.");
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const activeAttendance = res.data.data.find(
        (record) => record.checkIn && !record.checkOut
      );

      setAttendanceStatus(activeAttendance || null);
    } catch (err) {
      console.error("Gagal ambil status presensi:", err);
    }
  };

  useEffect(() => {
    getLocation();
    fetchAttendanceStatus();
  }, []);

  const handleCheckIn = async () => {
    setError("");
    setMessage("");

    if (!coords) {
      setError("Lokasi belum tersedia. Izinkan akses GPS.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/checkin`,
        {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setMessage(res.data.message);
      fetchAttendanceStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setMessage(res.data.message);
      fetchAttendanceStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Check-out gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center py-10 px-4">
      
      {/* MAP */}
      {coords && (
        <div className="w-full max-w-3xl mb-6 border-4 border-white rounded-3xl shadow-xl overflow-hidden ring-1 ring-pink-200">

          {/* ❗ FIX: Map dibungkus dengan div height stabil */}
          <div className="w-full h-[250px]">
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={15}
              className="h-full w-full"
              zoomControl={false}
            >
              <FixMapSize /> {/* ❗ FIX map patah */}

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <Marker position={[coords.lat, coords.lng]}>
                <Popup>Lokasi Anda Saat Ini</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* CARD */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-3xl border border-pink-100">
        
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 text-center">
          Lakukan Presensi
        </h2>

        {attendanceStatus && (
          <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-6 shadow-sm">
            <p className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
              ⚠️ <span className="text-lg">Status: Sedang Check-In</span>
            </p>
            <p className="text-yellow-800 text-sm bg-yellow-100 inline-block px-3 py-1 rounded-lg">
              Waktu: {new Date(attendanceStatus.checkIn).toLocaleString('id-ID')}
            </p>
            <p className="text-yellow-600 text-sm mt-3 italic">
              * Jangan lupa klik tombol Check-Out sebelum pulang!
            </p>
          </div>
        )}

        {coords ? (
          <div className="bg-pink-50 border border-pink-100 p-5 rounded-2xl mb-6">
            <p className="font-semibold text-pink-700 mb-3 flex items-center gap-2">
              📍 Koordinat Terdeteksi
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold">Latitude</p>
                <p className="text-pink-900 font-mono font-medium">{coords.lat.toFixed(6)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold">Longitude</p>
                <p className="text-pink-900 font-mono font-medium">{coords.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-6 text-center animate-pulse">
            <p className="text-gray-500 font-medium">📡 Sedang mencari lokasi GPS...</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">!</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            onClick={handleCheckIn}
            disabled={loading || !coords || attendanceStatus !== null}
            className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200
              ${loading || !coords || attendanceStatus 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-400 to-pink-600 hover:scale-[1.02]'}`}
          >
            {loading ? "Memproses..." : "Check-In Masuk"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || attendanceStatus === null}
            className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200
              ${loading || !attendanceStatus
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-400 to-rose-500 hover:scale-[1.02]'}`}
          >
            {loading ? "Memproses..." : "Check-Out Pulang"}
          </button>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-400 text-sm">
            {!attendanceStatus 
              ? "Tekan tombol Check-In saat Anda tiba di lokasi" 
              : "Tekan tombol Check-Out jika pekerjaan selesai"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;
