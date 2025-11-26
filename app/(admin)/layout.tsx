import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fb] font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0e121b] text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">CetakDigital <span className="text-xs bg-blue-600 px-2 py-1 rounded">Admin</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
            Kelola Pesanan
          </Link>
          <Link href="/admin/pricing" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
            Atur Harga
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
            Pengguna
          </Link>
          
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/login" className="flex items-center gap-3 p-3 text-red-400 hover:bg-gray-800 rounded-lg transition">
            Keluar
          </Link>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}