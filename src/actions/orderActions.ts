'use server';

import { prisma } from '@/src/lib/prisma'; 
import { revalidatePath } from 'next/cache';

// --- TIPE DATA FRONTEND ---
export type FrontendOrder = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  items?: any[];
};

// ==========================================
// 1. AMBIL SEMUA PESANAN (UNTUK ADMIN)
// ==========================================
export async function getOrders(): Promise<FrontendOrder[]> {
  const orders = await prisma.orders.findMany({
    include: {
      users: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return orders.map((o) => {
    return {
      id: o.order_id,
      customer: o.users.name,
      date: o.created_at.toISOString().split('T')[0],
      total: Number(o.total_amount),
      status: mapStatus(o.status, o.payment_status),
    };
  });
}

// ==========================================
// 2. AMBIL DETAIL SATU PESANAN (UNTUK ADMIN & HALAMAN PEMBAYARAN)
// ==========================================
export async function getOrderById(orderIdString: string) {
  const order = await prisma.orders.findUnique({
    where: { order_id: orderIdString },
    include: {
      users: true,
      order_items: {
        include: {
          services: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.order_id,
    customerName: order.users.name,
    customerEmail: order.users.email,
    date: order.created_at.toISOString().split('T')[0],
    total: Number(order.total_amount),
    status: mapStatus(order.status, order.payment_status),
    items: order.order_items.map((item) => ({
      serviceName: item.services.name,
      // Perbaikan merah: Jika category null, pakai string kosong
      category: (item.services.category || '').toString(),
      qty: item.quantity,
      price: Number(item.unit_price), 
      total: Number(item.total_price)
    })),
  };
}

// ==========================================
// 3. UPDATE STATUS PESANAN (UNTUK ADMIN)
// ==========================================
export async function updateOrderStatus(orderIdString: string, newStatus: string) {
  const order = await prisma.orders.findUnique({
    where: { order_id: orderIdString },
  });

  if (!order) return;

  let dataToUpdate: any = {};

  switch (newStatus) {
    case 'Menunggu Pembayaran':
      dataToUpdate = { status: 'Menunggu', payment_status: 'Pending' };
      break;
    case 'Dibayar':
      dataToUpdate = { payment_status: 'Paid' };
      break;
    case 'Diproses':
      dataToUpdate = { status: 'Diproses' };
      break;
    case 'Selesai':
      dataToUpdate = { status: 'Selesai' };
      break;
    case 'Dibatalkan':
      dataToUpdate = { status: 'Dibatalkan', payment_status: 'Failed' };
      break;
  }

  await prisma.orders.update({
    where: { id: order.id },
    data: dataToUpdate,
  });

  revalidatePath('/admin/orders');
}

// ==========================================
// 4. HAPUS PESANAN (UNTUK ADMIN)
// ==========================================
export async function deleteOrder(orderIdString: string) {
  try {
    const order = await prisma.orders.findUnique({
      where: { order_id: orderIdString },
    });

    if (!order) return { success: false, message: 'Pesanan tidak ditemukan' };

    await prisma.orders.delete({
      where: { id: order.id },
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Gagal menghapus pesanan:', error);
    return { success: false, message: 'Gagal menghapus data' };
  }
}

// ==========================================
// 5. BUAT PESANAN BARU (UNTUK CUSTOMER)
// ==========================================
export async function createOrder(data: {
  userId: number;
  items: { serviceId: number; qty: number; price: number }[];
  total: number;
}) {
  const orderIdString = `ORD-${Date.now()}`;

  const newOrder = await prisma.orders.create({
    data: {
      order_id: orderIdString,
      user_id: data.userId,
      total_amount: data.total,
      status: 'Menunggu',
      payment_status: 'Pending',
      
      order_items: {
        create: data.items.map(item => ({
          service_id: item.serviceId,
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.price * item.qty
        }))
      }
    }
  });

  return newOrder.order_id;
}

// ==========================================
// 6. AMBIL DAFTAR LAYANAN (DROPDOWN)
// ==========================================
export async function getServicesForOrder() {
  const services = await prisma.services.findMany({
    where: { is_active: true },
    orderBy: { price: 'asc' }
  });

  return services.map(s => ({
    id: s.id, 
    name: s.name,
    // PERBAIKAN DI SINI: Tambahkan ( || '') agar aman dari null
    category: (s.category || '').toString().toLowerCase(), 
    price: Number(s.price)
  }));
}

// ==========================================
// 7. AMBIL PESANAN KHUSUS USER TERTENTU (RIWAYAT)
// ==========================================
export async function getUserOrders(userId: number) {
  const orders = await prisma.orders.findMany({
    where: { user_id: userId },
    include: {
      order_items: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return orders.map((o) => {
    const totalItems = o.order_items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      id: o.order_id,
      date: o.created_at.toISOString(),
      items: totalItems,
      total: Number(o.total_amount),
      status: mapStatus(o.status, o.payment_status),
    };
  });
}

// --- HELPER FUNCTION ---
function mapStatus(dbStatus: string | null, paymentStatus: string | null): FrontendOrder['status'] {
  if (dbStatus === 'Dibatalkan') return 'Dibatalkan';
  if (dbStatus === 'Selesai') return 'Selesai';
  if (dbStatus === 'Diproses') return 'Diproses';
  if (paymentStatus === 'Paid') return 'Dibayar';
  return 'Menunggu Pembayaran';
}