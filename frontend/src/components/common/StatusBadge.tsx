const statusStyles: Record<string, string> = {
  draft: 'bg-espresso/8 text-espresso/50',
  pending: 'bg-honey-light text-honey',
  in_progress: 'bg-honey-light text-honey',
  approved: 'bg-caramel/10 text-caramel-dark',
  rejected: 'bg-clay-light text-clay',
  completed: 'bg-moss-light text-moss',
  fulfilled: 'bg-moss-light text-moss',
  cancelled: 'bg-espresso/8 text-espresso/40',
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
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] ?? 'bg-espresso/8 text-espresso/50'}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}