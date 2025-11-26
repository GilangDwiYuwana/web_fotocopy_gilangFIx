'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarAdmin() {
  const pathname = usePathname();
  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Kelola Pesanan', href: '/admin/orders' },
    { name: 'Atur Harga', href: '/admin/pricing' },
    { name: 'Kelola Pengguna', href: '/admin/users' },
    { name: 'Laporan Omset', href: '/admin/reports' },
  ];

  return (
    <aside className="w-64 bg-[#0e121b] text-white flex flex-col fixed h-full left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold">Admin Panel</h2></div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition ${pathname === item.href ? 'bg-[#123891]' : 'hover:bg-gray-800 text-gray-300'}`}>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800"><Link href="/login" className="text-red-400 hover:text-red-300">Keluar</Link></div>
    </aside>
  );
}