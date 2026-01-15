'use client';

import { useState, useEffect } from 'react';
// Menggunakan relative path agar aman dari error build
import Navbar from "@/components/layouts/Navbar";
import FileUpload from "@/components/forms/FileUpload";
import { useRouter } from 'next/navigation';

// Import Server Actions dengan relative path
import { getServicesForOrder, createOrder, uploadOrderFile } from '@/src/actions/orderActions';
// Import hook dengan relative path
import { useAuth } from '@/src/hooks/useAuth';

// --- IMPORT LIBRARY PDF READER ---
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Service = { id: number; name: string; category: string; price: number };

export default function BuatPesanan() {
  const router = useRouter();
  const { isLoggedIn, isChecking } = useAuth(); 

  // --- AMBIL ID USER DARI LOCALSTORAGE ---
  const getUserId = () => {
    if (typeof window !== 'undefined') {
        const userIdString = localStorage.getItem('user_session_id');
        return userIdString ? Number(userIdString) : null;
    }
    return null;
  };

  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FORM ---
  const [fileToUpload, setFileToUpload] = useState<File | null>(null); 
  const [pageCount, setPageCount] = useState(1);
  const [copies, setCopies] = useState(1);
  const [isReading, setIsReading] = useState(false);
  
  // STATE BARU: PESAN / CATATAN
  const [notes, setNotes] = useState(''); 

  const [selectedPaperId, setSelectedPaperId] = useState<number>(0);
  const [selectedFinishingId, setSelectedFinishingId] = useState<number>(0);
  const [sizeMode, setSizeMode] = useState('a4');
  const [colorMode, setColorMode] = useState('bw');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REDIRECT GUARD ---
  useEffect(() => {
    if (isChecking) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isLoggedIn, isChecking, router]); 

  // --- LOAD DATA LAYANAN ---
  async function loadData() {
    try {
      const data = await getServicesForOrder();
      setDbServices(data);

      const papers = data.filter(s => s.category === 'kertas');
      if (papers.length > 0) setSelectedPaperId(papers[0].id);
    } catch (error) {
      console.error("Gagal load data", error);
    } finally {
      setLoading(false);
    }
  }
  
  // --- KODE KALKULASI HARGA ---
  const papers = dbServices.filter(s => s.category === 'kertas');
  const finishings = dbServices.filter(s => s.category === 'finishing');
  const addonA3 = dbServices.find(s => s.name.toLowerCase().includes('a3'));
  const addonF4 = dbServices.find(s => s.name.toLowerCase().includes('f4'));
  const addonColor = dbServices.find(s => s.category === 'warna');
  
  const selectedPaper = papers.find(p => p.id === selectedPaperId);
  const selectedFinishing = finishings.find(f => f.id === selectedFinishingId);

  let basePrice = selectedPaper ? selectedPaper.price : 0;
  let sizeMarkup = 0;
  if (sizeMode === 'a3' && addonA3) sizeMarkup = addonA3.price;
  if (sizeMode === 'f4' && addonF4) sizeMarkup = addonF4.price;
  let colorMarkup = 0;
  if (colorMode === 'color' && addonColor) colorMarkup = addonColor.price;
  const finishingPrice = selectedFinishing ? selectedFinishing.price : 0;
  
  const totalSheets = pageCount * copies;
  const printCost = (basePrice + sizeMarkup + colorMarkup) * totalSheets;
  const finishCost = finishingPrice * copies;
  const totalPrice = printCost + finishCost;

  // --- LOGIKA BACA PDF ---
  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setFileToUpload(file);
    setPageCount(1);
    if (file.type === 'application/pdf') {
      try {
        setIsReading(true);
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(buffer).promise;
        setPageCount(pdf.numPages);
        alert(`File terbaca: ${pdf.numPages} Halaman.`);
      } catch (err) {
        console.error(err);
        console.log("Gagal membaca halaman PDF otomatis."); 
      } finally {
        setIsReading(false);
      }
    }
  };

  // --- SUBMIT: UPLOAD DOKUMEN & CREATE ORDER ---
  async function handleSubmit() {
    const userId = getUserId();
    if (!userId) {
        alert("Sesi user hilang. Silakan login ulang!");
        router.push('/login');
        return;
    }

    if (!fileToUpload) {
        alert("Mohon upload dokumen terlebih dahulu!");
        return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload File Fisik ke Server
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const uploadedFileUrl = await uploadOrderFile(formData);

      // 2. Siapkan Data Item
      const itemsToSave = [];
      if (selectedPaperId) itemsToSave.push({ serviceId: selectedPaperId, qty: totalSheets, price: basePrice });
      if (selectedFinishingId) itemsToSave.push({ serviceId: selectedFinishingId, qty: copies, price: finishingPrice });
      if (colorMode === 'color' && addonColor) itemsToSave.push({ serviceId: addonColor.id, qty: totalSheets, price: addonColor.price });
      if (sizeMode === 'a3' && addonA3) itemsToSave.push({ serviceId: addonA3.id, qty: totalSheets, price: addonA3.price });
      if (sizeMode === 'f4' && addonF4) itemsToSave.push({ serviceId: addonF4.id, qty: totalSheets, price: addonF4.price });

      // 3. Simpan Pesanan ke Database
      const orderId = await createOrder({
        userId: userId, 
        items: itemsToSave,
        total: totalPrice,
        fileUrl: uploadedFileUrl,
        notes: notes // <--- TAMBAHAN: Mengirim catatan ke backend
      });

      // 4. Redirect ke Halaman Pembayaran
      router.push(`/pesanan/bayar/${orderId}`);

    } catch (error) {
      console.error(error);
      alert("Gagal membuat pesanan. " + error);
      setIsSubmitting(false);
    }
  }

  const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  if (isChecking || (loading && isLoggedIn)) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123891]"></div>
        <p className="mt-4 text-[#4f6596]">Mengecek sesi dan memuat data...</p>
    </div>
  );
  
  if (!isLoggedIn) return null; 

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-[#123891] pl-4">
          Buat Pesanan Baru
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#123891]">1. Unggah Dokumen</h2>
              <FileUpload onFileSelect={handleFileSelect} />
              {isReading && <p className="text-sm text-blue-600 mt-2">Menghitung halaman...</p>}
            </section>

            {/* Spesifikasi Section */}
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <h2 className="text-lg font-semibold mb-4 text-[#123891]">2. Spesifikasi Cetak</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-sm font-bold mb-2 text-gray-700">Ukuran</span>
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {['a4', 'f4', 'a3'].map((size) => (
                      <button key={size} onClick={() => setSizeMode(size)} className={`flex-1 py-2 rounded-md text-sm font-medium ${sizeMode === size ? 'bg-white text-[#123891] shadow-sm' : 'text-gray-500'}`}>{size.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-bold mb-2 text-gray-700">Warna</span>
                  <div className="flex gap-3">
                    <button onClick={() => setColorMode('bw')} className={`flex-1 border-2 p-2 rounded-lg text-xs font-bold ${colorMode === 'bw' ? 'border-gray-800 bg-gray-100' : 'border-gray-200'}`}>Hitam Putih</button>
                    <button onClick={() => setColorMode('color')} className={`flex-1 border-2 p-2 rounded-lg text-xs font-bold ${colorMode === 'color' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>Berwarna</button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <label className="block">
                    <span className="text-sm font-bold mb-2 text-gray-700 block">Kertas</span>
                    <select value={selectedPaperId} onChange={(e) => setSelectedPaperId(Number(e.target.value))} className="w-full border rounded-lg p-3">
                    {papers.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>)}
                    </select>
                 </label>
                 <label className="block">
                    <span className="text-sm font-bold mb-2 text-gray-700 block">Finishing</span>
                    <select value={selectedFinishingId} onChange={(e) => setSelectedFinishingId(Number(e.target.value))} className="w-full border rounded-lg p-3">
                    <option value={0}>Tanpa Finishing</option>
                    {finishings.map((f) => <option key={f.id} value={f.id}>{f.name} ({formatRupiah(f.price)})</option>)}
                    </select>
                 </label>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold mb-1">Halaman</label>
                       <input type="number" min="1" value={pageCount} onChange={(e) => setPageCount(Math.max(1, Number(e.target.value)))} className="w-full border rounded-lg p-2 font-bold" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold mb-1">Rangkap</label>
                       <input type="number" min="1" value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))} className="w-full border rounded-lg p-2 font-bold" />
                    </div>
                </div>
              </div>

              {/* --- TAMBAHAN: INPUT PESAN / CATATAN --- */}
              <div className="pt-2">
                 <label className="block text-sm font-bold mb-2 text-gray-700">Catatan Tambahan (Opsional)</label>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong jilid warna biru, atau potong bagian tepi..."
                    className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-[#123891] outline-none resize-none"
                 />
              </div>

            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border shadow-lg sticky top-24">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b">Ringkasan</h3>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between"><span>Total Lembar</span><span className="font-bold">{totalSheets}</span></div>
                <div className="flex justify-between"><span>Spesifikasi</span><span className="font-bold uppercase">{sizeMode} - {colorMode}</span></div>
              </div>
              <div className="flex justify-between items-center mb-6 bg-blue-50 p-3 rounded-lg">
                <span className="text-[#123891] font-bold">Total</span>
                <span className="text-2xl font-bold text-[#123891]">{formatRupiah(totalPrice)}</span>
              </div>
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#123891] text-white py-3 rounded-lg font-bold hover:bg-[#0d2654] disabled:bg-gray-400">
                {isSubmitting ? 'Mengupload...' : 'Lanjut Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}