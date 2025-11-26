// ...existing code...
'use client'

import React, { useState } from 'react'

type Service = {
  id: string
  name: string
  price: number
}

const initialServices: Service[] = [
  { id: 's1', name: 'Kertas HVS A4', price: 500 },
  { id: 's2', name: 'Warna', price: 1000 },
  { id: 's3', name: 'Ukuran A3', price: 750 },
  { id: 's4', name: 'Finishing', price: 250 },
  { id: 's5', name: 'Jumlah Halaman', price: 100 },
]

export default function AdminPricingPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [saving, setSaving] = useState(false)

  function updatePrice(id: string, value: number) {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, price: Math.max(0, value) } : s)))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // replace with real API call
      await new Promise(res => setTimeout(res, 600))
      // console.log('saved', services)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f9fb] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col max-w-full">
        <header className="flex items-center justify-between border-b border-solid border-b-[#e8ebf3] px-8 py-3">
          <div className="flex items-center gap-4 text-[#0e121b]">
            <div className="w-10 h-10 flex items-center justify-center rounded bg-white">
              <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#0e121b] text-lg font-bold">CetakDigital</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="h-10 px-3 rounded-lg bg-[#e8ebf3] text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
            </button>

            <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAf3axQohr9QpykmPd4KhXefpJGs-HHzElA-fWGhMN4mIKT5tgvyAvqkY8RAC3dLJfMCGiU4trHUNNn4GBmbGRk6HnuM_9ZzpSqwob97S5yptKPHDjISEZluSNf9iDq_KWpJxZ3S6AoaY4dI5aGy2P8b7qP5RLdVkbZCrgYM3ygFsyNmkxsW3v-7e6t0mtu-NWsi_IfvV66slDHkTQ2FBGI-JNvE1NHomlFD1eMA9xP5bZw3alBJ0cOxKGg99DS0atWYIz_AmcZSfew)' }} />
          </div>
        </header>

        <main className="px-10 py-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-[#0e121b]">Daftar Harga</h1>
            </div>

            <div className="rounded-lg border border-[#d0d7e6] bg-[#f8f9fb] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fb]">
                    <th className="px-4 py-3 text-left text-[#0e121b] w-3/4 text-sm font-medium">Komponen</th>
                    <th className="px-4 py-3 text-left text-[#0e121b] w-1/4 text-sm font-medium">Harga</th>
                  </tr>
                </thead>

                <tbody>
                  {services.map(s => (
                    <tr key={s.id} className="border-t border-t-[#d0d7e6]">
                      <td className="h-16 px-4 py-2 text-[#0e121b] text-sm flex items-center">
                        {s.name}
                      </td>

                      <td className="h-16 px-4 py-2 text-sm text-[#4f6596]">
                        <div className="flex items-center gap-3">
                          <span className="text-[#4f6596]">Rp</span>
                          <input
                            type="number"
                            min={0}
                            value={s.price}
                            onChange={(e) => updatePrice(s.id, Number(e.target.value || 0))}
                            className="w-36 bg-white border border-[#d0d7e6] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            aria-label={`Harga ${s.name}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setServices(initialServices)}
                className="min-w-[84px] h-10 rounded-lg px-4 bg-[#e8ebf3] text-[#0e121b] text-sm font-bold"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="min-w-[84px] h-10 rounded-lg px-4 bg-[#123891] text-white text-sm font-bold disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </main>

        <footer className="flex justify-center py-6">
          <div className="w-full max-w-4xl text-center text-sm text-gray-500">
            © {new Date().getFullYear()} CetakDigital
          </div>
        </footer>
      </div>
    </div>
  )
}