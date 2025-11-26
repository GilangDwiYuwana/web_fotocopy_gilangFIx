'use client';
export default function CancelModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] text-center">
        <h3 className="text-xl font-bold mb-4">Batalkan Pesanan?</h3>
        <p className="text-gray-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg font-bold">Tidak</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Ya, Batalkan</button>
        </div>
      </div>
    </div>
  );
}