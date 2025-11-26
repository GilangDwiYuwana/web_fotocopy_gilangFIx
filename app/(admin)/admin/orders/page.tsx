// ...existing code...
'use client'

import React, { useMemo, useState } from 'react'

type Order = {
  id: string
  customer: string
  date: string
  total: number
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan'
}

const INITIAL_ORDERS: Order[] = [
  { id: '#12345', customer: 'Sarah Chen', date: '2024-07-26', total: 250000, status: 'Diproses' },
  { id: '#12346', customer: 'Budi Santoso', date: '2024-07-25', total: 150000, status: 'Dibayar' },
  { id: '#12347', customer: 'Aisyah Rahman', date: '2024-07-24', total: 300000, status: 'Selesai' },
  { id: '#12348', customer: 'David Lee', date: '2024-07-23', total: 100000, status: 'Dibatalkan' },
  { id: '#12349', customer: 'Rina Putri', date: '2024-07-22', total: 200000, status: 'Diproses' },
  { id: '#12350', customer: 'Fajar Nugroho', date: '2024-07-21', total: 180000, status: 'Dibayar' },
  { id: '#12351', customer: 'Dewi Lestari', date: '2024-07-20', total: 220000, status: 'Selesai' },
  { id: '#12352', customer: 'Kevin Tan', date: '2024-07-19', total: 120000, status: 'Dibatalkan' },
  { id: '#12353', customer: 'Maya Sari', date: '2024-07-18', total: 280000, status: 'Diproses' },
  { id: '#12354', customer: 'Rizki Pratama', date: '2024-07-17', total: 160000, status: 'Dibayar' },
]

const STATUS_OPTIONS: Order['status'][] = [
  'Menunggu Pembayaran',
  'Dibayar',
  'Diproses',
  'Selesai',
  'Dibatalkan',
]

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [q, setQ] = useState('')
  const [statusFilter] = useState<string>('Semua Status') // placeholder for UI; extend if needed

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term && statusFilter === 'Semua Status') return orders
    return orders.filter((o) => {
      const matchesQuery =
        !term ||
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.date.toLowerCase().includes(term) ||
        o.total.toString().includes(term)
      const matchesStatus = statusFilter === 'Semua Status' || o.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [orders, q, statusFilter])

  function updateStatus(id: string, newStatus: Order['status']) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    // TODO: persist change to backend
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f9fb] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8ebf3] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e121b]">
            <div className="w-10 h-10 flex items-center justify-center rounded bg-white">
              <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#0e121b] text-lg font-bold leading-tight tracking-[-0.015em]">CetakDigital</h2>
          </div>

          <div className="flex flex-1 justify-end gap-8">
            <button className="flex items-center justify-center rounded-lg h-10 bg-[#e8ebf3] text-[#0e121b] px-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
            </button>

            <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAZv9vry04tXf8QO9PtAdQ6kAgNni8WVm89sV1X-47kKNIl_1o0hk4yj4ZLavKTzIS_X7L135hGoe59WiKqJqEMVTVQaU-H8rId0Q2kXYyA4mhKXwxAOqGkfs1E8POnnms6j4gjXE1C4L4aL_XYQKEe6TG5aOC2nWrwqYtyK0wRfHpNHGVwzhC1wqLMg1b0pCBqrM5Mb4o27ik5qYxRJo76xAFGJiDnoK3zu3wpsPjlqfy4x2enfEBv1mbFhxe7zisow72jA-cKIxDP)' }} />
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e121b] tracking-light text-[32px] font-bold leading-tight">Pesanan Masuk</p>
                <p className="text-[#4f6596] text-sm">Kelola semua pesanan yang masuk dari pelanggan.</p>
              </div>
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#4f6596] flex bg-[#e8ebf3] items-center justify-center pl-4 rounded-l-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                  </div>
                  <input
                    placeholder="Cari pesanan..."
                    className="form-input flex w-full min-w-0 flex-1 rounded-lg text-[#0e121b] border-none bg-[#e8ebf3] h-full placeholder:text-[#4f6596] px-4 text-base"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-3 p-3 flex-wrap pr-4">
              <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e8ebf3] pl-4 pr-2">
                <p className="text-[#0e121b] text-sm font-medium">Semua Status</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
              </button>
              <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e8ebf3] pl-4 pr-2">
                <p className="text-[#0e121b] text-sm font-medium">Tanggal</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
              </button>
              <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e8ebf3] pl-4 pr-2">
                <p className="text-[#0e121b] text-sm font-medium">Urutkan</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
              </button>
            </div>

            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-lg border border-[#d0d7e6] bg-[#f8f9fb] w-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fb]">
                      <th className="table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-120 px-4 py-3 text-left text-[#0e121b] text-sm font-medium">ID Pesanan</th>
                      <th className="table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-240 px-4 py-3 text-left text-[#0e121b] text-sm font-medium">Pelanggan</th>
                      <th className="table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-360 px-4 py-3 text-left text-[#0e121b] text-sm font-medium">Tanggal</th>
                      <th className="table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-480 px-4 py-3 text-left text-[#0e121b] text-sm font-medium">Total</th>
                      <th className="table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-600 px-4 py-3 text-left text-[#0e121b] text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-t border-t-[#d0d7e6]">
                        <td className="h-[72px] px-4 py-2 text-[#0e121b] text-sm font-normal">{o.id}</td>
                        <td className="h-[72px] px-4 py-2 text-[#4f6596] text-sm">{o.customer}</td>
                        <td className="h-[72px] px-4 py-2 text-[#4f6596] text-sm">{o.date}</td>
                        <td className="h-[72px] px-4 py-2 text-[#4f6596] text-sm">Rp {o.total.toLocaleString('id-ID')}</td>
                        <td className="h-[72px] px-4 py-2 text-sm">
                          <select
                            className="w-full rounded-lg bg-white border border-[#d0d7e6] px-3 py-1 text-sm"
                            value={o.status}
                            onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-sm text-gray-500">Tidak ada pesanan</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <style>{`
                @container (max-width:120px){.table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-120{display:none}}
                @container (max-width:240px){.table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-240{display:none}}
                @container (max-width:360px){.table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-360{display:none}}
                @container (max-width:480px){.table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-480{display:none}}
                @container (max-width:600px){.table-440dca16-0659-42eb-a615-cb8e04e49cbc-column-600{display:none}}
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// ...existing code...