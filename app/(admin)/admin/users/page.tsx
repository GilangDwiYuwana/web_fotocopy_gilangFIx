// ...existing code...
'use client'

import React, { useMemo, useState } from 'react'

type User = {
  id: string
  name: string
  email: string
  joinedAt: string
  active: boolean
}

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Clara Anderson', email: 'clara.anderson@email.com', joinedAt: '2023-01-15', active: true },
  { id: 'u2', name: 'Ethan Carter', email: 'ethan.carter@email.com', joinedAt: '2023-02-20', active: true },
  { id: 'u3', name: 'Olivia Bennett', email: 'olivia.bennett@email.com', joinedAt: '2023-03-10', active: false },
  { id: 'u4', name: 'Liam Foster', email: 'liam.foster@email.com', joinedAt: '2023-04-05', active: true },
  { id: 'u5', name: 'Sophia Hayes', email: 'sophia.hayes@email.com', joinedAt: '2023-05-12', active: true },
  { id: 'u6', name: 'Noah Jenkins', email: 'noah.jenkins@email.com', joinedAt: '2023-06-18', active: false },
  { id: 'u7', name: 'Ava Parker', email: 'ava.parker@email.com', joinedAt: '2023-07-22', active: true },
  { id: 'u8', name: 'Jackson Reed', email: 'jackson.reed@email.com', joinedAt: '2023-08-30', active: true },
  { id: 'u9', name: 'Isabella Scott', email: 'isabella.scott@email.com', joinedAt: '2023-09-14', active: false },
  { id: 'u10', name: 'Lucas Turner', email: 'lucas.turner@email.com', joinedAt: '2023-10-01', active: true },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [users, q])

  function toggleActive(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
    // persist to API if needed
  }

  function handleEdit(user: User) {
    // simple placeholder - replace with modal or navigation
    // eslint-disable-next-line no-alert
    alert(`Edit pengguna: ${user.name}`)
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
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e8ebf3] text-[#0e121b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
            </button>

            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAvBZpwZ9_l7IkSoUyTb8Lv_7CtKTuKWiB75ERy6i1bi7zG8N5ui-DuqbRJFRgQ7QKzQrPLC9Bj9t0VTDZMRdmtAWza3h0r1IFY4l_ofj4qyuBr9G8QYrF7Zuor2M6V51VzkZ4l5n5fExtchOugFYCqlX1FScXP8Asej7pV4TGmA2qzdrHstv_e3AwHG63N0NEtmA7NmFL28Ejp6X_zmf_VnUpVV6qi4mwj3SU9i6EA0lqW8eRpsBJ3Ix55SI36d_Cvt7Br4JSRvtzJ)' }} />
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e121b] tracking-light text-[32px] font-bold leading-tight">Manajemen Pengguna</p>
                <p className="text-[#4f6596] text-sm font-normal leading-normal">Kelola semua pengguna terdaftar di platform CetakDigital.</p>
              </div>
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#4f6596] flex bg-[#e8ebf3] items-center justify-center pl-4 rounded-l-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                  </div>
                  <input
                    placeholder="Cari pengguna..."
                    className="form-input flex w-full min-w-0 flex-1 rounded-lg text-[#0e121b] border-none bg-[#e8ebf3] h-full placeholder:text-[#4f6596] px-4 text-base font-normal"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-lg border border-[#d0d7e6] bg-[#f8f9fb]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fb]">
                      <th className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-120 px-4 py-3 text-left text-[#0e121b] w-[400px] text-sm font-medium">Nama</th>
                      <th className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-240 px-4 py-3 text-left text-[#0e121b] w-[400px] text-sm font-medium">Email</th>
                      <th className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-360 px-4 py-3 text-left text-[#0e121b] w-[400px] text-sm font-medium">Tanggal Bergabung</th>
                      <th className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-480 px-4 py-3 text-left text-[#0e121b] w-60 text-sm font-medium">Status</th>
                      <th className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-600 px-4 py-3 text-left text-[#0e121b] w-60 text-[#4f6596] text-sm font-medium">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-t border-t-[#d0d7e6]">
                        <td className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-120 h-[72px] px-4 py-2 text-[#0e121b] text-sm font-normal">{u.name}</td>
                        <td className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-240 h-[72px] px-4 py-2 text-[#4f6596] text-sm font-normal">{u.email}</td>
                        <td className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-360 h-[72px] px-4 py-2 text-[#4f6596] text-sm font-normal">{u.joinedAt}</td>
                        <td className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-480 h-[72px] px-4 py-2 text-sm font-normal">
                          <button
                            onClick={() => toggleActive(u.id)}
                            className="flex w-full h-8 items-center justify-center rounded-lg bg-[#e8ebf3] text-[#0e121b] text-sm font-medium"
                            aria-pressed={u.active}
                          >
                            <span className="truncate">{u.active ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>
                        <td className="table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-600 h-[72px] px-4 py-2 text-[#4f6596] text-sm font-bold">
                          <button onClick={() => handleEdit(u)} className="text-[#4f6596]">Edit</button>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-sm text-gray-500">Tidak ada pengguna</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <style>{`
                @container (max-width:120px){.table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-120{display:none}}
                @container (max-width:240px){.table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-240{display:none}}
                @container (max-width:360px){.table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-360{display:none}}
                @container (max-width:480px){.table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-480{display:none}}
                @container (max-width:600px){.table-f01358f3-8e83-42ed-b971-0c7bca396fe6-column-600{display:none}}
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// ...existing code...