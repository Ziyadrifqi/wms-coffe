const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  fulfilled: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending: 'Menunggu Approval',
  in_progress: 'Sedang Berlangsung',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
  fulfilled: 'Terpenuhi',
  cancelled: 'Dibatalkan',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}