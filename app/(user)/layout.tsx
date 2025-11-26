import Link from 'next/link';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fb] font-sans text-[#0e121b]">
      {/* NAVBAR */}
      <header className="flex items-center justify-between border-b border-[#e8ebf3] px-10 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold tracking-tight">CetakDigital</h2>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium hover:text-[#123891]">Beranda</Link>
          <Link href="/pesanan/riwayat" className="text-sm font-medium hover:text-[#123891]">Riwayat</Link>
          <Link href="/pesanan/buat" className="px-4 py-2 bg-[#123891] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition">
            Buat Pesanan
          </Link>
          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
             {/* Placeholder Avatar */}
             <div className="w-full h-full bg-[#123891] flex items-center justify-center text-white font-bold">U</div>
          </div>
        </nav>
      </header>

      {/* KONTEN */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}