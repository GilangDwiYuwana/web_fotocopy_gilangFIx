'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('admin')) router.push('/admin/dashboard');
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">Masuk Akun</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-[#123891] text-white py-3 rounded-lg font-bold">Masuk</button>
        </form>
      </div>
    </div>
  );
}