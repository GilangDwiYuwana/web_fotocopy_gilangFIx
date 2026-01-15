'use server';

// Gunakan relative path untuk menghindari masalah alias
import { prisma } from '@/src/lib/prisma'; 
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// --- TIPE DATA FRONTEND ---
export type FrontendOrder = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Menunggu Pembayaran' | 'Dibayar' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  items?: any[];
  fileUrl?: string;          // Link Dokumen (PDF yang mau dicetak)
  paymentProofUrl?: string;  // Link Bukti Transfer (Struk pembayaran)
  notes?: string;            // <--- TAMBAHAN: Field untuk pesan/catatan
};

// ==========================================
// 1. FUNGSI UPLOAD FILE KE SERVER (REAL)
// ==========================================
export async function uploadOrderFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('Tidak ada file yang diupload');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Buat nama file unik agar tidak bentrok
  const uniqueName = `ORD-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  
  // Tentukan folder penyimpanan: root_project/public/uploads
  const uploadDir = join(process.cwd(), 'public/uploads');
  
  // Buat folder jika belum ada (agar tidak error)
  await mkdir(uploadDir, { recursive: true });

  // Path lengkap file
  const path = join(uploadDir, uniqueName);
  
  // Tulis file ke disk
  await writeFile(path, buffer);
  
  // Kembalikan URL publik yang bisa diakses browser
  return `/uploads/${uniqueName}`;
}

// ==========================================
// 2. AMBIL SEMUA PESANAN (UNTUK ADMIN)
// ==========================================
export async function getOrders(): Promise<FrontendOrder[]> {
  const orders = await prisma.orders.findMany({
    include: {
      users: true,
      payments: true, // Ambil data payments untuk cek bukti transfer
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return orders.map((o) => {
    // Logika mengambil Bukti Transfer dari kolom proof_url
    const paymentWithProof = o.payments
        .filter(p => p.proof_url)
        .sort((a, b) => b.id - a.id)[0];
    
    const proofUrl = paymentWithProof?.proof_url || undefined;

    return {
      id: o.order_id,
      customer: o.users.name,
      date: o.created_at.toISOString().split('T')[0],
      total: Number(o.total_amount),
      status: mapStatus(o.status, o.payment_status),
      
      // Dokumen yang mau dicetak
      fileUrl: o.file_url || undefined, 
      
      // Bukti Transfer
      paymentProofUrl: proofUrl, 

      // Catatan
      notes: o.notes || '-',
    };
  });
}

// ==========================================
// 3. AMBIL DETAIL SATU PESANAN
// ==========================================
export async function getOrderById(orderIdString: string) {
  const order = await prisma.orders.findUnique({
    where: { order_id: orderIdString },
    include: {
      users: true,
      payments: true, 
      order_items: {
        include: {
          services: true,
        },
      },
    },
  });

  if (!order) return null;

  const paymentWithProof = order.payments
        .filter(p => p.proof_url)
        .sort((a, b) => b.id - a.id)[0];
  
  const proofUrl = paymentWithProof?.proof_url || undefined;

  return {
    id: order.order_id,
    customerName: order.users.name,
    customerEmail: order.users.email,
    date: order.created_at.toISOString().split('T')[0],
    total: Number(order.total_amount),
    status: mapStatus(order.status, order.payment_status),
    
    fileUrl: order.file_url || undefined,
    paymentProofUrl: proofUrl,
    notes: order.notes || '-',

    items: order.order_items.map((item) => ({
      serviceName: item.services.name,
      category: (item.services.category || '').toString(),
      qty: item.quantity,
      price: Number(item.unit_price), 
      total: Number(item.total_price)
    })),
  };
}

// ==========================================
// 4. BUAT PESANAN BARU
// ==========================================
export async function createOrder(data: {
  userId: number;
  items: { serviceId: number; qty: number; price: number }[];
  total: number;
  fileUrl: string; 
  notes?: string; // <--- FIELD CATATAN DITAMBAHKAN DI SINI
}) {
  const orderIdString = `ORD-${Date.now()}`;

  const newOrder = await prisma.orders.create({
    data: {
      order_id: orderIdString,
      user_id: data.userId,
      total_amount: data.total,
      status: 'Menunggu',
      payment_status: 'Pending',
      file_url: data.fileUrl, 
      notes: data.notes, // <--- DISIMPAN KE DATABASE
      
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
// 5. UPDATE STATUS PESANAN
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
// 6. HAPUS PESANAN
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
// 7. AMBIL DAFTAR LAYANAN
// ==========================================
export async function getServicesForOrder() {
  const services = await prisma.services.findMany({
    where: { is_active: true },
    orderBy: { price: 'asc' }
  });

  return services.map(s => ({
    id: s.id, 
    name: s.name,
    category: (s.category || '').toString().toLowerCase(), 
    price: Number(s.price)
  }));
}

// ==========================================
// 8. AMBIL RIWAYAT USER
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