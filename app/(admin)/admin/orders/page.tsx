'use client';

import React, { useMemo, useState, useEffect } from 'react';
// Menggunakan relative path agar aman (naik 3 level dari src/app/admin/orders ke src)
import { getOrders, updateOrderStatus } from '@/src/actions/orderActions';

// Definisi tipe data yang sesuai dengan return dari Server Action
type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  fileUrl?: string;         // Link File Dokumen
  paymentProofUrl?: string; // Link File Bukti Transfer
  notes?: string;           // Kolom Catatan
};

const STATUS_OPTIONS: Order['status'][] = [
  'Menunggu Pembayaran',
  'Dibayar',
  'Diproses',
  'Selesai',
  'Dibatalkan',
];

const STATUS_COLORS: Record<Order['status'], { bg: string; text: string; icon: string }> = {
  'Menunggu Pembayaran': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏳' },
  'Dibayar': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '✓' },
  'Diproses': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '⚙️' },
  'Selesai': { bg: 'bg-green-100', text: 'text-green-700', icon: '✓✓' },
  'Dibatalkan': { bg: 'bg-red-100', text: 'text-red-700', icon: '✕' },
};

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua Status');

  // --- AMBIL DATA DARI SERVER ---
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        // Casting tipe data agar aman
        setOrders(data as unknown as Order[]);
      } catch (error) {
        console.error("Gagal mengambil pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // --- UPDATE STATUS ---
  async function handleUpdateStatus(id: string, newStatus: Order['status']) {
    // Optimistic Update (Ubah UI dulu biar cepat)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    // Kirim ke server
    await updateOrderStatus(id, newStatus);
  }

  // --- FUNGSI DOWNLOAD REAL ---
  const handleDownload = (fileUrl: string | undefined, type: 'file' | 'proof') => {
    if (!fileUrl) {
        alert(`${type === 'file' ? 'Dokumen' : 'Bukti transfer'} belum tersedia/belum diupload.`);
        return;
    }
    // Langsung buka URL file di tab baru
    window.open(fileUrl, '_blank'); 
  };

  // --- FILTERING ---
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term && statusFilter === 'Semua Status') return orders;
    return orders.filter((o) => {
      const matchesQuery =
        !term ||
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.date.toLowerCase().includes(term) ||
        o.total.toString().includes(term);
      const matchesStatus = statusFilter === 'Semua Status' || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, q, statusFilter]);

  // --- STATS ---
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Menunggu Pembayaran').length,
      processing: orders.filter((o) => o.status === 'Diproses').length,
      completed: orders.filter((o) => o.status === 'Selesai').length,
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123891]"></div>
        <p className="mt-4 text-[#4f6596]">Memuat data pesanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#f0f2f8] py-8">
      {/* Header */}
      <div className="mb-8 px-6">
        <h1 className="text-4xl font-black text-[#0e121b] mb-2">Kelola Pesanan</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 px-6">
        {[
          { label: 'Total Pesanan', value: stats.total, icon: '📦', color: 'from-[#123891] to-[#4f6596]' },
          { label: 'Menunggu Pembayaran', value: stats.pending, icon: '⏳', color: 'from-[#f59e0b] to-[#d97706]' },
          { label: 'Sedang Diproses', value: stats.processing, icon: '⚙️', color: 'from-[#8b5cf6] to-[#7c3aed]' },
          { label: 'Selesai', value: stats.completed, icon: '✓', color: 'from-[#10b981] to-[#059669]' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-[#e8ebf3] p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4f6596] font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#0e121b]">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8ebf3] p-6 mb-8 px-6 mx-6">
        <div className="space-y-4">
           <input placeholder="Cari pesanan..." className="w-full p-3 border rounded-lg" value={q} onChange={(e) => setQ(e.target.value)} />
           <div className="flex gap-2 flex-wrap">
             {['Semua Status', ...STATUS_OPTIONS].map(s => <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 transition">{s}</button>)}
           </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8ebf3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {/* --- PEMISAHAN KOLOM DI SINI --- */}
                  <th className="px-6 py-4 text-left font-bold text-sm text-[#0e121b]">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-sm text-[#0e121b]">Pelanggan</th>
                  
                  <th className="px-6 py-4 text-left font-bold text-sm text-[#0e121b]">Total</th>
                  
                  {/* KOLOM CATATAN */}
                  <th className="px-6 py-4 text-left font-bold text-sm text-[#0e121b] min-w-[200px]">Catatan</th> 

                  <th className="px-6 py-4 text-left font-bold text-sm text-[#0e121b]">Status</th>
                  <th className="px-6 py-4 text-center font-bold text-sm text-[#0e121b]">File</th>
                  <th className="px-6 py-4 text-center font-bold text-sm text-[#0e121b]">Bukti TF</th>
                  <th className="px-6 py-4 text-center font-bold text-sm text-[#0e121b]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((o) => {
                     const statusColor = STATUS_COLORS[o.status] || STATUS_COLORS['Menunggu Pembayaran'];
                     return (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          {/* KOLOM ID (Plus Tanggal) */}
                          <td className="px-6 py-4">
                              <span className="font-bold text-blue-800 block">{o.id}</span>
                              <span className="text-xs text-[#4f6596]">{o.date}</span>
                          </td>

                          {/* KOLOM PELANGGAN */}
                          <td className="px-6 py-4 font-semibold text-gray-700">
                              {o.customer}
                          </td>

                          <td className="px-6 py-4 font-bold">Rp {o.total.toLocaleString()}</td>
                          
                          {/* KOLOM CATATAN */}
                          <td className="px-6 py-4 text-sm text-gray-600 italic border-l">
                              {o.notes && o.notes !== '-' ? `"${o.notes}"` : '-'}
                          </td>

                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor.bg} ${statusColor.text}`}>{o.status}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <button onClick={() => handleDownload(o.fileUrl, 'file')} className="text-blue-600 underline text-sm hover:text-blue-800">File</button>
                          </td>
                          <td className="px-6 py-4 text-center">
                              {o.paymentProofUrl ? <button onClick={() => handleDownload(o.paymentProofUrl, 'proof')} className="text-green-600 underline text-sm hover:text-green-800">Bukti</button> : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <select value={o.status} onChange={(e) => handleUpdateStatus(o.id, e.target.value as Order['status'])} className="border rounded p-1 text-sm bg-white cursor-pointer hover:border-gray-400">
                              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                     );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada pesanan yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}