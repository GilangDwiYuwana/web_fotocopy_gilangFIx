'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-10 py-3 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="size-8 bg-[#123891] rounded-lg flex items-center justify-center text-white font-bold">CD</div>
        <h2 className="text-[#0e121b] text-lg font-bold tracking-tight">CetakDigital</h2>
      </div>
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-[#123891]">Beranda</Link>
        <Link href="/pesanan/buat" className="text-sm font-medium hover:text-[#123891]">Buat Pesanan</Link>
        <Link href="/pesanan/riwayat" className="text-sm font-medium hover:text-[#123891]">Riwayat</Link>
      </nav>
      <div className="flex gap-2">
        <Link href="/login"><button className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-bold">Masuk</button></Link>
        <Link href="/register"><button className="px-4 py-2 rounded-lg bg-[#123891] text-white text-sm font-bold">Daftar</button></Link>
      </div>
    </header>
  );
}