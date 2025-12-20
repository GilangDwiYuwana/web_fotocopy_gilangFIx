'use server';

// Menggunakan relative path agar aman dari error alias
import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. AMBIL DETAIL ORDER (Untuk Halaman Pembayaran)
// ==========================================
export async function getPaymentDetails(orderIdString: string) {
  const order = await prisma.orders.findUnique({
    where: { order_id: orderIdString },
    include: {
      users: true, // Ambil nama user untuk ditampilkan
    },
  });

  if (!order) return null;

  return {
    id: order.id, // ID Int database
    orderId: order.order_id, // ID String (#ORD...)
    totalAmount: Number(order.total_amount),
    status: order.payment_status,
    customerName: order.users.name,
    userId: order.users.id
  };
}

// ==========================================
// 2. SIMPAN BUKTI PEMBAYARAN (KONFIRMASI)
// ==========================================
export async function submitPaymentProof(
  orderIdInt: number, 
  userIdInt: number, 
  amount: number,
  fileName: string // Nama file yang sudah diupload (misal: ORD-123.jpg)
) {
  // A. Buat record di tabel payments
  // Kita simpan path lengkap ke kolom 'proof_url'
  await prisma.payments.create({
    data: {
      order_id: orderIdInt,
      user_id: userIdInt,
      amount: amount,
      payment_method: 'DANA',
      status: 'Pending', // Status pembayaran pending menunggu cek admin
      
      // SIMPAN KE KOLOM PROOF_URL (Bukan notes lagi)
      proof_url: `/uploads/${fileName}`, 
      
      notes: 'Pembayaran via Website',
      payment_date: new Date(),
    }
  });

  // B. Update status di tabel orders
  // Ubah status jadi 'Diproses' atau tetap 'Menunggu' sampai admin memverifikasi
  await prisma.orders.update({
    where: { id: orderIdInt },
    data: {
      payment_status: 'Pending', 
      status: 'Diproses' 
    }
  });

  revalidatePath(`/pembayaran`);
  revalidatePath(`/pesanan/riwayat`);
}