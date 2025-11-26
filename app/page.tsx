import Link from "next/link";
import Navbar from "@/components/layouts/Navbar"; // Pastikan import Navbar

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-5xl font-extrabold text-[#0e121b]">Cetak Dokumen <span className="text-[#123891]">Tanpa Antri</span></h1>
        <p className="text-lg text-gray-500 mt-4 max-w-2xl">Solusi cetak online cepat dan mudah. Upload, Bayar, Ambil.</p>
        <div className="flex gap-4 mt-8">
          <Link href="/pesanan/buat" className="px-8 py-3 bg-[#123891] text-white rounded-lg font-bold shadow-lg">Mulai Sekarang</Link>
        </div>
      </div>
    </>
  );
}