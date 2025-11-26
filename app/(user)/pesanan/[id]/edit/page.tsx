'use client';
import { useState } from 'react';
import Navbar from "@/components/layouts/Navbar";
import FileUpload from '@/components/forms/FileUpload';
import Link from 'next/link';

export default function BuatPesanan() {
  const [qty, setQty] = useState(1);
  const total = qty * 500;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Pesanan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUpload />
            <div className="space-y-4">
              <label className="block"><span className="text-sm font-bold">Jenis Kertas</span>
                <select className="w-full border rounded-lg p-3 mt-1"><option>HVS A4</option><option>Art Paper</option></select>
              </label>
              <label className="block"><span className="text-sm font-bold">Jumlah</span>
                <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-full border rounded-lg p-3 mt-1" />
              </label>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border h-fit">
            <h3 className="font-bold mb-4">Ringkasan</h3>
            <div className="flex justify-between text-xl font-bold text-[#123891] mb-6"><span>Total</span><span>Rp {total}</span></div>
            <Link href="/pesanan/bayar"><button className="w-full bg-[#123891] text-white py-3 rounded-lg font-bold">Lanjut Bayar</button></Link>
          </div>
        </div>
      </div>
    </>
  );
}