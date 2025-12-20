'use client';

// Menggunakan alias standar '@/' yang mengarah ke folder 'src'
import Navbar from "@/components/layouts/Navbar";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Menggunakan alias standar untuk actions
import { getPaymentDetails, submitPaymentProof } from "@/src/actions/paymentActions";
import { uploadOrderFile } from "@/src/actions/orderActions";

export default function Pembayaran() {
  const router = useRouter();
  // Menggunakan useParams untuk menangkap ID dari URL di Client Component
  const params = useParams(); 
  
  // State Data
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State Form & UI
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const danaNumber = "081261285727";
  const accountName = "Alga Arvino";

  // 1. Load Data Order
  useEffect(() => {
    async function loadData() {
      // Pastikan params.id ada
      // Dalam Next.js App Router, params.id bisa string atau array string
      if (!params || !params.id) return;
      
      const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

      try {
        console.log("Loading Payment for ID:", orderId);
        const data = await getPaymentDetails(orderId);
        
        if (data) {
          setOrderData(data);
        } else {
          setErrorMsg("Data pesanan tidak ditemukan di database.");
        }
      } catch (e) {
        console.error("Error loading order:", e);
        setErrorMsg("Terjadi kesalahan koneksi.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params]);

  // 2. Handle File Select
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) {
        setFile(f);
        const objectUrl = URL.createObjectURL(f);
        setPreviewUrl(objectUrl);
    }
  }

  // 3. Copy Number
  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(danaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // 4. Submit Logic
  async function confirmPayment() {
    if (!orderData || !file) return;
    
    setIsSubmitting(true);
    try {
      // A. Upload File
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadedFileUrl = await uploadOrderFile(formData);
      
      // Ambil nama file-nya saja untuk disimpan di database
      const fileNameOnly = uploadedFileUrl.split('/').pop() || file.name;

      // B. Submit Data
      await submitPaymentProof(
        orderData.id, 
        orderData.userId,
        orderData.totalAmount,
        fileNameOnly
      );

      alert("Pembayaran berhasil dikirim! Menunggu verifikasi admin.");
      router.push("/pesanan/riwayat"); 
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim bukti pembayaran: " + error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- TAMPILAN 1: LOADING ---
  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123891]"></div>
            <p className="mt-4 text-[#4f6596]">Memuat tagihan...</p>
        </div>
    );
  }

  // --- TAMPILAN 2: ERROR ---
  if (!orderData) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb] p-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-[#0e121b] mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-[#4f6596] mb-6 max-w-md">
                Gagal memuat data untuk ID: <span className="font-mono font-bold">{params?.id}</span>.
                <br/> <span className="text-red-500 text-sm">{errorMsg}</span>
            </p>
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-[#123891] text-[#123891] rounded-lg font-bold hover:bg-blue-50"
                >
                    Ke Beranda
                </button>
                <button 
                    onClick={() => router.push('/pesanan/buat')}
                    className="px-6 py-3 bg-[#123891] text-white rounded-lg font-bold hover:bg-[#0d2654] transition-colors"
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
      <div className="max-w-3xl mx-auto p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e121b] mb-2">Konfirmasi Pembayaran</h1>
        <p className="text-[#4f6596] mb-6">ID Pesanan: <span className="font-bold text-[#123891]">#{orderData.orderId}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card Info Transfer */}
          <div className="bg-white rounded-2xl border border-[#e8ebf3] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm text-[#4f6596] mb-2">Total Tagihan</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#0e121b] mb-4">
                Rp {orderData.totalAmount.toLocaleString('id-ID')}
              </p>

              <p className="text-sm text-[#4f6596] mb-2">Metode Pembayaran</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#123891] to-[#4f6596] flex items-center justify-center text-white font-bold">
                  DANA
                </div>
                <div>
                  <p className="font-semibold text-[#0e121b] text-lg">{danaNumber}</p>
                  <p className="text-sm text-[#4f6596]">a.n. {accountName}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={copyNumber}
                className="flex-1 px-4 py-2 bg-[#123891] text-white rounded-lg font-medium hover:bg-[#0d2654] transition"
              >
                {copied ? "Nomor Disalin ✓" : "Salin Nomor DANA"}
              </button>
            </div>
          </div>

          {/* Card Upload Bukti */}
          <div className="bg-white rounded-2xl border border-[#e8ebf3] p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-sm text-[#4f6596] mb-2">Unggah Bukti Pembayaran</p>
              <label className="block group">
                <div className={`flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all h-48
                    ${file ? 'border-[#123891] bg-blue-50/20' : 'border-[#e8ebf3] hover:border-[#123891] hover:bg-gray-50'}`}>
                  
                  {previewUrl ? (
                      <img src={previewUrl} alt="Preview Bukti" className="h-full w-full object-contain rounded-md" />
                  ) : (
                      <>
                        <div className="w-12 h-12 flex items-center justify-center bg-[#f1f5f9] rounded-full text-[#4f6596] text-2xl group-hover:scale-110 transition-transform">📸</div>
                        <div className="text-center">
                            <p className="text-sm text-[#0e121b] font-medium">Klik untuk upload foto</p>
                            <p className="text-xs text-[#9aa4b2]">JPG, PNG, PDF (Maks 10MB)</p>
                        </div>
                      </>
                  )}
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} className="hidden" />
                </div>
              </label>
              
              {file && (
                  <div className="mt-2 text-xs text-center text-gray-500">
                      File terpilih: <span className="font-semibold text-[#123891]">{file.name}</span>
                  </div>
              )}
            </div>

            <div className="mt-4 text-sm text-[#4f6596]">
              <p className="mb-2">Catatan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Transfer nominal pas <b>Rp {orderData.totalAmount.toLocaleString('id-ID')}</b>.</li>
                <li>Simpan bukti transfer, lalu unggah.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmPayment}
            disabled={!file || isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition ${file && !isSubmitting ? 'bg-[#123891] hover:bg-[#0d2654]' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isSubmitting ? (
               <span className="flex items-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                 </svg>
                 Mengirim...
               </span>
            ) : 'Kirim Konfirmasi'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-[#e8ebf3] text-[#123891] font-medium hover:bg-[#f8f9fb] transition"
          >
            Kembali
          </button>
        </div>
      </div>
    </>
  );
}