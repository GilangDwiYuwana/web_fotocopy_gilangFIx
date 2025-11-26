// ...existing code...
'use client'

import React, { useMemo } from 'react'

type DayPoint = { label: string; value: number }

const SAMPLE_DATA: DayPoint[] = [
  { label: 'Senin', value: 1200000 },
  { label: 'Selasa', value: 850000 },
  { label: 'Rabu', value: 1500000 },
  { label: 'Kamis', value: 950000 },
  { label: 'Jumat', value: 400000 },
  { label: 'Sabtu', value: 1100000 },
  { label: 'Minggu', value: 700000 },
]

export default function AdminReportsPage() {
  const data = useMemo(() => SAMPLE_DATA, [])
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])
  const txCount = useMemo(() => 250, []) // replace with real value if available

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f9fb] overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between border-b border-solid border-b-[#e8ebf3] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e121b]">
            <div className="w-10 h-10 flex items-center justify-center rounded bg-white">
              <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#0e121b] text-lg font-bold leading-tight">CetakDigital</h2>
          </div>

          <div className="flex flex-1 justify-end gap-8 items-center">
            <button className="flex items-center justify-center rounded-lg h-10 bg-[#e8ebf3] text-[#0e121b] px-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
            </button>

            <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBGQ8uKBRZRm1fkZQ6atLS0e027ped1boUW4ihezhbj__IDUZBd6ZCtT3yPyHkcePNUnP0FjJqNlNQLYtYUUiR5ayyzZ1t6hHwQHfPzxDqTbMsxzK24aEAkqKUQTr3rkn98NoJSiNUx4OjTZqwhL_ccpS99Yl265_K3-NyL1X0WTAkSjrPeTgGPy-xJTESFlRis2tM5sJq2lt-I4yS654orSYLFlhk_dsIL4bloOts1BU7Pi0kPShj98K-h6DZOkNK8i4St1JRTi9wq)' }} />
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e121b] tracking-light text-[32px] font-bold leading-tight">Laporan Omset Mingguan</p>
            </div>

            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2">
                <p className="text-[#0e121b] text-base font-medium leading-normal">Total Omset per Hari</p>

                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                  {data.map((d) => {
                    const heightPercent = Math.round((d.value / max) * 100)
                    return (
                      <React.Fragment key={d.label}>
                        <div
                          className="w-full rounded-t-md bg-[#e8ebf3] border-t-2 border-[#4f6596] transition-all"
                          style={{ height: `${Math.max(6, heightPercent)}%` }}
                          title={`${d.label}: Rp ${d.value.toLocaleString('id-ID')}`}
                          aria-label={`${d.label} omset ${d.value}`}
                        />
                        <p className="text-[#4f6596] text-[13px] font-bold leading-normal">{d.label}</p>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e8ebf3]">
                <p className="text-[#0e121b] text-base font-medium leading-normal">Total Pendapatan</p>
                <p className="text-[#0e121b] text-2xl font-bold tracking-light">Rp {total.toLocaleString('id-ID')}</p>
              </div>

              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e8ebf3]">
                <p className="text-[#0e121b] text-base font-medium leading-normal">Jumlah Transaksi</p>
                <p className="text-[#0e121b] text-2xl font-bold tracking-light">{txCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}