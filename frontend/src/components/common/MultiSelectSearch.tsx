import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectSearchProps {
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectSearch({ options, selectedIds, onChange, placeholder = 'Pilih...' }: MultiSelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((sid) => sid !== id) : [...selectedIds, id]);
  };

  const removeSelected = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  const selectedLabels = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm text-left flex items-center justify-between gap-2"
      >
        <span className="flex flex-wrap gap-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-espresso/30">{placeholder}</span>
          ) : selectedLabels.length <= 2 ? (
            selectedLabels.map((opt) => (
              <span key={opt.id} className="flex items-center gap-1 bg-caramel/10 text-caramel-dark text-xs px-2 py-0.5 rounded-full">
                {opt.label}
                <X size={12} className="cursor-pointer" onClick={(e) => removeSelected(opt.id, e)} />
              </span>
            ))
          ) : (
            <span className="bg-caramel/10 text-caramel-dark text-xs px-2 py-0.5 rounded-full">{selectedLabels.length} dipilih</span>
          )}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-espresso/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-cream border border-espresso/10 rounded-lg shadow-xl shadow-espresso/10 max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-espresso/8 flex items-center gap-2">
            <Search size={14} className="text-espresso/30 shrink-0" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari material..."
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-espresso/30 text-center py-3">Tidak ditemukan</p>
            ) : (
              filteredOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-latte/50 cursor-pointer">
                  <input type="checkbox" checked={selectedIds.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="rounded accent-caramel" />
                  {opt.label}
                </label>
              ))
            )}
          </div>

          {selectedIds.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="text-xs text-clay hover:text-clay/80 text-left px-3 py-2 border-t border-espresso/8">
              Hapus semua pilihan
            </button>
          )}
        </div>
      )}
    </div>
  );
}