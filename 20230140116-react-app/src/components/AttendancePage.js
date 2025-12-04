import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ FIX ICON MARKER LEAFLET
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true); // ✅ Loading state untuk lokasi
  
  // State untuk kamera
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const API_URL = "http://localhost:3001/api/presensi";
  const getToken = () => localStorage.getItem("token");

  const getLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLoadingLocation(false);
          console.log("Lokasi berhasil didapat:", pos.coords);
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
          setLoadingLocation(false);
          console.error("Error lokasi:", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    } else {
      setError("Browser tidak mendukung geolocation.");
      setLoadingLocation(false);
    }
  };

  const fetchAttendanceStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    getLocation();
    fetchAttendanceStatus();
  }, [fetchAttendanceStatus]);

  // Fungsi untuk ambil foto
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Fix mirror: Flip gambar secara horizontal
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Flip horizontal
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      
      // Convert ke base64
      setImage(canvas.toDataURL('image/jpeg'));
    };
  }, [webcamRef]);

  // Update fungsi Check-In (dengan FormData)
  const handleCheckIn = async () => {
    setError("");
    setMessage("");

    // Validasi
    if (!coords) {
      setError("Lokasi belum tersedia. Izinkan akses GPS.");
      return;
    }
    
    if (!image) {
      setError("Foto wajib diambil! Klik tombol 'Ambil Foto' terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      // Konversi base64 ke Blob
      const blob = await (await fetch(image)).blob();
      
      // Buat FormData
      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const res = await axios.post(
        `${API_URL}/checkin`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${getToken()}`
          },
        }
      );

      setMessage(res.data.message);
      setImage(null); // Reset foto setelah berhasil
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
      
      {/* ✅ MAP dengan Loading State */}
      {loadingLocation && !coords && (
        <div className="w-full max-w-3xl mb-6 p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">Mengambil lokasi Anda...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon izinkan akses lokasi di browser Anda</p>
        </div>
      )}

      {coords && (
        <div className="w-full max-w-3xl mb-6 border-4 border-white rounded-3xl shadow-xl overflow-hidden ring-1 ring-pink-200">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={16}
            style={{ height: "350px", width: "100%" }}
            scrollWheelZoom={false}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>
                <div className="text-center">
                  <strong>Lokasi Anda</strong>
                  <br />
                  Lat: {coords.lat.toFixed(6)}
                  <br />
                  Lng: {coords.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
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
        ) : !loadingLocation ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-6 text-center">
            <p className="text-red-700 font-medium mb-3">❌ Gagal mendapatkan lokasi</p>
            <button
              onClick={getLocation}
              className="py-2 px-6 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : null}

        {/* TAMPILAN KAMERA */}
        {!attendanceStatus && (
          <div className="mb-6">
            <p className="font-semibold text-pink-700 mb-3 flex items-center gap-2">
              📸 Ambil Foto Selfie
            </p>
            <div className="border-4 border-pink-200 rounded-2xl overflow-hidden bg-black shadow-lg">
              {image ? (
                <img src={image} alt="Selfie" className="w-full" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                />
              )}
            </div>

            {/* Tombol Ambil Foto / Foto Ulang */}
            <div className="mt-4">
              {!image ? (
                <button
                  onClick={capture}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:from-blue-500 hover:to-blue-700 transition transform hover:scale-[1.02]"
                >
                  📸 Ambil Foto Selfie
                </button>
              ) : (
                <button
                  onClick={() => setImage(null)}
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:from-gray-500 hover:to-gray-700 transition transform hover:scale-[1.02]"
                >
                  🔄 Foto Ulang
                </button>
              )}
            </div>
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
            disabled={loading || !coords || !image || attendanceStatus !== null}
            className={`flex-1 py-4 px-6 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200
              ${loading || !coords || !image || attendanceStatus 
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
              ? "Ambil foto selfie dan tekan tombol Check-In saat tiba di lokasi" 
              : "Tekan tombol Check-Out jika pekerjaan selesai"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;