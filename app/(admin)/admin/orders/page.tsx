'use client';

import React, { useMemo, useState, useEffect } from 'react';
// Menggunakan relative path untuk menghindari error module not found (Naik 3 tingkat ke src)
import { getOrders, updateOrderStatus } from '@/src/actions/orderActions';

// Definisi tipe data yang sesuai dengan return dari Server Action
type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  fileUrl?: string;         // Link File Dokumen
  paymentProofUrl?: string; // Link File Bukti Transfer (Kolom Baru)
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
  const handleDownload = (fileUrl: string | undefined) => {
    if (!fileUrl) {
        alert("File belum tersedia/belum diupload.");
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
        <p className="text-lg text-[#4f6596]">Kelola semua pesanan yang masuk dari pelanggan</p>
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
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4f6596]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Cari berdasarkan ID, pelanggan, atau tanggal..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#e8ebf3] focus:outline-none focus:ring-2 focus:ring-[#123891] focus:border-transparent bg-white text-[#0e121b] placeholder:text-[#4f6596]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['Semua Status', 'Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Selesai', 'Dibatalkan'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  statusFilter === status
                    ? 'bg-[#123891] text-white shadow-lg shadow-[#123891]/30'
                    : 'bg-[#f8f9fb] text-[#4f6596] border border-[#e8ebf3] hover:border-[#123891] hover:text-[#123891]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8ebf3] overflow-hidden hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#f8f9fb] to-[#f0f2f8] border-b border-[#e8ebf3]">
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0e121b]">ID Pesanan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0e121b]">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0e121b]">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0e121b]">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#0e121b]">Status</th>
                  
                  {/* --- KOLOM FILE DOKUMEN --- */}
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0e121b]">File</th>
                  
                  {/* --- KOLOM BARU: BUKTI TF --- */}
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0e121b]">Bukti TF</th>
                  
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0e121b]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((o) => {
                    const statusColor = STATUS_COLORS[o.status] || STATUS_COLORS['Menunggu Pembayaran'];
                    return (
                      <tr key={o.id} className="border-b border-[#e8ebf3] hover:bg-[#f8f9fb] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#123891] bg-[#123891]/10 px-3 py-1 rounded-lg text-sm">{o.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#0e121b]">{o.customer}</div>
                        </td>
                        <td className="px-6 py-4 text-[#4f6596]">{o.date}</td>
                        <td className="px-6 py-4 font-bold text-[#0e121b]">
                          Rp {o.total.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon} {o.status}
                          </span>
                        </td>

                        {/* --- TOMBOL DOWNLOAD FILE DOKUMEN --- */}
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => handleDownload(o.fileUrl)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
                                title="Download File Dokumen"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                File
                            </button>
                        </td>

                        {/* --- TOMBOL DOWNLOAD BUKTI TRANSFER --- */}
                        <td className="px-6 py-4 text-center">
                            {o.paymentProofUrl ? (
                                <button 
                                    onClick={() => handleDownload(o.paymentProofUrl)}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-all"
                                    title="Download Bukti Transfer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Bukti
                                </button>
                            ) : (
                                <span className="text-xs text-gray-400 italic">Belum ada</span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value as Order['status'])}
                            className="px-3 py-2 rounded-lg border border-[#e8ebf3] bg-white text-[#0e121b] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#123891] focus:border-transparent cursor-pointer hover:border-[#123891] transition-all"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📭</div>
                        <p className="text-lg font-semibold text-[#0e121b]">Tidak ada pesanan</p>
                        <p className="text-sm text-[#4f6596]">Data akan muncul jika ada pesanan di database</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-[#f8f9fb] border-t border-[#e8ebf3] px-6 py-4">
              <p className="text-sm text-[#4f6596] font-medium">
                Menampilkan <span className="text-[#0e121b] font-bold">{filtered.length}</span> dari <span className="text-[#0e121b] font-bold">{orders.length}</span> pesanan
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}