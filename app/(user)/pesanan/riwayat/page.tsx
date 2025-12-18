'use client';

import React, { useMemo, useState, useEffect } from 'react';
// Gunakan relative path agar aman
import Navbar from "@/components/layouts/Navbar"; 
import { getUserOrders, getOrderById } from "@/src/actions/orderActions"; // Tambah getOrderById
import { useRouter } from 'next/navigation';
import { useAuth } from "@/src/hooks/useAuth"; 

type Order = {
  id: string;
  date: string;
  items?: number;
  total: number;
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan';
};

// Tipe data untuk detail modal
type OrderDetail = {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: string;
    items: {
        serviceName: string;
        category: string;
        qty: number;
        price: number;
        total: number;
    }[];
}

export default function Riwayat() {
  const router = useRouter();
  const { isLoggedIn, isChecking } = useAuth(); 
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal Detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const getUserId = () => {
    if (typeof window !== 'undefined') {
        const userIdString = localStorage.getItem('user_session_id');
        return userIdString ? Number(userIdString) : null;
    }
    return null;
  };

  // 1. Load Data Utama
  useEffect(() => {
    if (isChecking) return;
    if (!isLoggedIn) {
        router.push('/login');
        return;
    }

    async function loadData() {
      try {
        const userId = getUserId();
        if (!userId) return;

        const data = await getUserOrders(userId);
        if (Array.isArray(data)) {
            // @ts-ignore
            setOrders(data);
        }
      } catch (error) {
        console.error("Gagal memuat riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isLoggedIn, isChecking, router]);

  // 2. Logic Tombol Aksi
  async function handleAction(id: string, status: string) {
    if(status === 'Menunggu Pembayaran') {
       // KASUS 1: Belum bayar -> Redirect ke halaman bayar
       router.push(`/pesanan/bayar/${id}`);
    } else {
       // KASUS 2: Sudah bayar -> Buka Modal Detail
       openDetailModal(id);
    }
  }

  // 3. Logic Buka Modal Detail
  async function openDetailModal(orderId: string) {
      setIsModalOpen(true);
      setLoadingDetail(true);
      try {
          // Ambil data lengkap item dari server
          const detail = await getOrderById(orderId);
          if (detail) {
              // @ts-ignore
              setSelectedOrder(detail);
          }
      } catch (error) {
          console.error("Gagal ambil detail:", error);
      } finally {
          setLoadingDetail(false);
      }
  }

  const stats = useMemo(() => ({
    total: orders.length,
    selesai: orders.filter(o => o.status === 'Selesai').length,
    diproses: orders.filter(o => o.status === 'Diproses').length,
    menunggu: orders.filter(o => o.status === 'Menunggu Pembayaran').length,
  }), [orders]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter(o => {
      const matchQ = !term ||
        o.id.toLowerCase().includes(term) ||
        (o.items !== undefined && o.items.toString().includes(term)) ||
        o.total.toString().includes(term) ||
        o.date.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'Semua' || o.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [orders, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (isChecking || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Riwayat Pesanan</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar transaksi Anda.</p>
          </div>
          {/* ... Search Bar (sama seperti sebelumnya) ... */}
        </header>

        {/* ... Stats Cards & Filter (sama seperti sebelumnya) ... */}

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-sm text-slate-600">ID Pesanan</th>
                  <th className="p-4 text-sm text-slate-600">Tanggal</th>
                  <th className="p-4 text-sm text-slate-600">Jml Item</th>
                  <th className="p-4 text-sm text-slate-600">Total Harga</th>
                  <th className="p-4 text-sm text-slate-600">Status</th>
                  <th className="p-4 text-sm text-slate-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((o, i) => (
                    <tr key={o.id} className={`border-t border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-4 font-bold text-[#123891]">{o.id}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-slate-600">{o.items ?? 0} Pcs</td>
                      <td className="p-4 font-semibold text-slate-800">Rp {o.total.toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          o.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                          o.status === 'Diproses' ? 'bg-purple-100 text-purple-700' :
                          o.status === 'Menunggu Pembayaran' ? 'bg-yellow-100 text-yellow-800' :
                          o.status === 'Dibatalkan' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {o.status === 'Menunggu Pembayaran' ? (
                            <button
                                onClick={() => handleAction(o.id, o.status)}
                                className="text-sm px-4 py-1.5 rounded-lg bg-[#123891] text-white hover:bg-[#0d2654] transition-all shadow-sm"
                            >
                                Bayar
                            </button>
                        ) : (
                            <button
                                onClick={() => handleAction(o.id, o.status)}
                                className="text-sm px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Detail
                            </button>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (sama seperti sebelumnya) */}
      </div>

      {/* === MODAL DETAIL PESANAN === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                {/* Header Modal */}
                <div className="bg-[#f8f9fb] border-b border-[#e8ebf3] px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[#0e121b]">Detail Pesanan</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                {/* Content Modal */}
                <div className="p-6">
                    {loadingDetail ? (
                        <div className="text-center py-8 text-gray-500">Memuat detail...</div>
                    ) : selectedOrder ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">ID Pesanan</span>
                                <span className="font-bold text-[#123891]">{selectedOrder.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Tanggal</span>
                                <span className="font-medium text-gray-800">{new Date(selectedOrder.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{selectedOrder.status}</span>
                            </div>

                            <div className="border-t border-gray-100 my-4 pt-4">
                                <p className="text-sm font-bold mb-3 text-gray-800">Rincian Barang</p>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <div>
                                                <p className="font-medium text-gray-700">{item.serviceName}</p>
                                                <p className="text-xs text-gray-400">{item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-600">x{item.qty}</p>
                                                {/* <p className="font-medium">Rp {item.price.toLocaleString('id-ID')}</p> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total Biaya</span>
                                <span className="text-xl font-bold text-[#123891]">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-red-500">Data tidak ditemukan.</p>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="bg-[#f8f9fb] border-t border-[#e8ebf3] px-6 py-4 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}