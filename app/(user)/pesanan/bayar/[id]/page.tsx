'use client';

import Navbar from "@/components/layouts/Navbar";
import { useRouter, useParams } from "next/navigation"; // Tambah useParams
import { useState, useEffect } from "react";
// Import Server Action
import { getPaymentDetails, submitPaymentProof } from "@/src/actions/paymentActions"; 

export default function Pembayaran() {
  const router = useRouter();
  const params = useParams(); // PENGGANTI params props (Lebih aman di client)
  
  // --- STATE DATA ---
  // Ubah ke <any> agar tidak merah (bypass strict checking sementara)
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // --- STATE FORM & UI ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- KONFIGURASI REKENING ---
  const danaNumber = "081261285727";
  const accountName = "Alga Arvino";

  // 1. Load Data Order saat halaman dibuka
  useEffect(() => {
    async function loadData() {
      // Cek apakah params.id sudah ada
      if (!params?.id) return;

      try {
        console.log("Fetching ID:", params.id); // Debugging di Console browser
        const idToFetch = String(params.id); // Pastikan jadi String

        const data = await getPaymentDetails(idToFetch);
        console.log("Data diterima:", data); // Cek isi data di Console
        
        if (data) {
          setOrderData(data);
        } else {
          setErrorMsg("Data pesanan tidak ditemukan/kosong.");
        }
      } catch (e) {
        console.error("Error loading order:", e);
        setErrorMsg("Gagal terhubung ke server/database.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params]); // Jalankan ulang jika params berubah

  // 2. Handle File Upload & Preview
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) {
        setFile(f);
        const objectUrl = URL.createObjectURL(f);
        setPreviewUrl(objectUrl);
    }
  }

  // 3. Fitur Copy Nomor
  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(danaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Gagal menyalin. Silakan copy manual.");
    }
  }

  // 4. Submit Pembayaran
  async function confirmPayment() {
    if (!orderData || !file) return;
    
    setIsSubmitting(true);
    try {
      // Pastikan urutan parameter sesuai dengan server action kamu
      await submitPaymentProof(
        orderData.id,          // ID Order
        orderData.userId,      // User ID
        orderData.totalAmount, // Total
        file.name              // Nama File
      );

      alert("Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.");
      router.push("/pesanan/riwayat"); 
      
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim konfirmasi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- HELPER FORMAT RUPIAH ---
  const formatRupiah = (n: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  // --- TAMPILAN 1: LOADING ---
  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123891]"></div>
            <p className="mt-4 text-[#4f6596] font-medium">Memuat rincian tagihan...</p>
        </div>
    );
  }

  // --- TAMPILAN 2: ERROR ---
  if (!orderData) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb] p-6 text-center">
            <div className="text-6xl mb-4 opacity-50">🧾</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                Gagal memuat data untuk ID: <span className="font-mono font-bold">{params?.id}</span>.
                <br/> <span className="text-red-500 text-sm">{errorMsg}</span>
            </p>
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 border border-[#123891] text-[#123891] rounded-lg font-bold hover:bg-blue-50"
                >
                    Refresh Halaman
                </button>
                <button 
                    onClick={() => router.push('/pesanan/buat')}
                    className="px-6 py-2.5 bg-[#123891] text-white rounded-lg font-bold hover:bg-[#0d2654]"
                >
                    Buat Pesanan Baru
                </button>
            </div>
        </div>
    );
  }

  // --- TAMPILAN UTAMA ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8f9fb] py-10 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e121b] mb-2">
              Konfirmasi Pembayaran
            </h1>
            <p className="text-[#4f6596]">
              Selesaikan pembayaran untuk Order ID: <span className="font-bold text-[#123891] bg-blue-50 px-2 py-0.5 rounded">#{orderData.orderId || orderData.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* KARTU KIRI: INFO TRANSFER */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
              <div className="bg-blue-50/50 p-6 border-b border-gray-100">
                <p className="text-sm text-[#4f6596] font-medium mb-1">Total yang harus dibayar</p>
                <p className="text-3xl font-extrabold text-[#123891]">
                  {formatRupiah(orderData.totalAmount || 0)}
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                   <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Transfer ke Rekening:</p>
                   <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {/* Logo DANA Simple */}
                      <div className="w-14 h-14 rounded-lg bg-[#118EEA] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        DANA
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-lg tracking-wider">{danaNumber}</p>
                        <p className="text-sm text-gray-500 font-medium">a.n. {accountName}</p>
                      </div>
                   </div>
                </div>

                <button
                  onClick={copyNumber}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2
                    ${copied 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-white text-[#123891] border-2 border-[#123891] hover:bg-blue-50'
                    }`}
                >
                  {copied ? (
                    <>
                        <span>✓</span> Berhasil Disalin
                    </>
                  ) : (
                    <>
                        <span>📋</span> Salin Nomor DANA
                    </>
                  )}
                </button>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex gap-3 items-start">
                   <span className="text-xl">💡</span>
                   <p>
                     Mohon transfer sesuai nominal hingga 3 digit terakhir agar verifikasi berjalan otomatis.
                   </p>
                </div>
              </div>
            </div>

            {/* KARTU KANAN: UPLOAD BUKTI */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-fit">
               <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-800">Unggah Bukti Transfer</h3>
                  <p className="text-sm text-gray-500">Pastikan foto bukti terlihat jelas.</p>
               </div>
               
               <div className="p-6 flex-1 flex flex-col gap-6">
                  {/* Area Upload */}
                  <div className="relative">
                    <input 
                        type="file" 
                        id="paymentProof" 
                        accept="image/png, image/jpeg, image/jpg, application/pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <label 
                        htmlFor="paymentProof"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all
                            ${file 
                                ? 'border-[#123891] bg-blue-50/30' 
                                : 'border-gray-300 hover:border-[#123891] hover:bg-gray-50'
                            }`}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-contain p-2 rounded-xl" />
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-2xl">
                                    📸
                                </div>
                                <p className="text-sm font-medium text-gray-600">Klik untuk upload bukti</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                            </>
                        )}
                    </label>
                  </div>

                  {/* Info File Terpilih */}
                  {file && (
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="truncate pr-4">
                              <p className="text-sm font-bold text-gray-700 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <button onClick={() => {setFile(null); setPreviewUrl(null);}} className="text-red-500 text-xs font-bold hover:underline">
                              Hapus
                          </button>
                      </div>
                  )}

                  {/* Tombol Aksi */}
                  <div className="mt-auto pt-2 flex gap-3">
                     <button
                       onClick={() => router.back()}
                       className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition"
                     >
                       Kembali
                     </button>
                     <button
                       onClick={confirmPayment}
                       disabled={!file || isSubmitting}
                       className={`flex-1 py-3 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2
                         ${file && !isSubmitting 
                            ? 'bg-[#123891] text-white hover:bg-[#0e2c75] hover:shadow-lg' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                         }`}
                     >
                        {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Mengirim...
                            </>
                        ) : (
                            'Kirim Konfirmasi'
                        )}
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}