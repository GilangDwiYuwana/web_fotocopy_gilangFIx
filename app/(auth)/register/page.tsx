'use client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar Akun</h2>
        <form onSubmit={(e) => { e.preventDefault(); router.push('/login'); }} className="space-y-4">
          <input type="text" placeholder="Nama Lengkap" className="w-full p-3 border rounded-lg" required />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-[#123891] text-white py-3 rounded-lg font-bold">Daftar</button>
        </form>
      </div>
    </div>
  );
}