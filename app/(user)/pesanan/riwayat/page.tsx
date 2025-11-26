'use client';
import Navbar from "@/components/layouts/Navbar";
import Link from 'next/link';

export default function Riwayat() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Riwayat Pesanan</h1>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50"><tr><th className="p-4">ID</th><th className="p-4">Tanggal</th><th className="p-4">Status</th></tr></thead>
            <tbody>
              <tr className="border-t"><td className="p-4">#101</td><td className="p-4">20 Mei 2024</td><td className="p-4 text-green-600 font-bold">Selesai</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}