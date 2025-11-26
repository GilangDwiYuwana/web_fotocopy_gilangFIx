'use client';
import Navbar from "@/components/layouts/Navbar";
import { useRouter } from 'next/navigation';

export default function Pembayaran() {
  const router = useRouter();
  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Pembayaran</h1>
        <div className="bg-white p-6 rounded-xl border mb-6">
          <p className="mb-2">Total Tagihan: <span className="font-bold">Rp 5.000</span></p>
          <p className="text-sm text-gray-500">Silakan transfer ke BCA 1234567890 a.n CetakDigital</p>
          <input type="file" className="mt-4 w-full" />
        </div>
        <button onClick={() => router.push('/pesanan/123')} className="w-full bg-[#123891] text-white py-3 rounded-lg font-bold">Konfirmasi Pembayaran</button>
      </div>
    </>
  );
}