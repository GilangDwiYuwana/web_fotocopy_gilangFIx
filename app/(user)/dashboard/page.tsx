import Link from 'next/link';
import Navbar from "@/components/layouts/Navbar";

export default function UserDashboard() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="bg-[#123891] text-white p-8 rounded-2xl flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Halo, User!</h1><p>Siap mencetak dokumen hari ini?</p></div>
          <Link href="/pesanan/buat" className="bg-white text-[#123891] px-6 py-2 rounded-lg font-bold">Buat Pesanan</Link>
        </div>
        <h2 className="text-xl font-bold">Pesanan Terbaru</h2>
        <div className="bg-white p-4 rounded-xl border">Belum ada pesanan aktif.</div>
      </div>
    </>
  );
}