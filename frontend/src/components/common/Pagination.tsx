interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 gap-3">
      <span className="text-xs text-espresso/40">Halaman {currentPage} dari {lastPage}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm border border-espresso/12 rounded-lg disabled:opacity-30 hover:bg-espresso/5 transition"
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-3 py-1.5 text-sm border border-espresso/12 rounded-lg disabled:opacity-30 hover:bg-espresso/5 transition"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}