'use client';
import { useState } from 'react';
import Navbar from "@/components/layouts/Navbar";
import CancelModal from "@/components/ui/CancelModal";

export default function DetailPesanan({ params }: { params: { id: string } }) {
  const [isModalOpen, setModalOpen] = useState(false);
  
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pesanan #{params.id}</h1>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">Menunggu Pembayaran</span>
        </div>
        <div className="bg-white p-6 rounded-xl border mb-6">
          <p>HVS A4 - 10 Lembar - Hitam Putih</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="text-red-600 font-bold text-sm">Batalkan Pesanan</button>
        <CancelModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onConfirm={() => alert('Dibatalkan')} />
      </div>
    </>
  );
}