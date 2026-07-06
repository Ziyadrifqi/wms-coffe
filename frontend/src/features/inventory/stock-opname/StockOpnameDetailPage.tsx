import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { stockOpnameApi } from '../../../api/inventory.api';
import StatusBadge from '../../../components/common/StatusBadge';
import { getErrorMessage } from '../../../utils/getErrorMessage';

export default function StockOpnameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [qtyActual, setQtyActual] = useState<Record<string, number>>({});
const [notes, setNotes] = useState<Record<string, string>>({});
const [syncedOpnameId, setSyncedOpnameId] = useState<string | null>(null);

const { data, isLoading } = useQuery({
  queryKey: ['stock-opname', id],
  queryFn: () => stockOpnameApi.get(id!).then((res) => res.data.data),
  enabled: !!id,
});

// Sinkronisasi state input dari data — dijalankan saat render, dijaga oleh perbandingan ID
// (bukan di useEffect, sesuai rekomendasi React untuk pola "adjust state saat prop berubah")
if (data && data.id !== syncedOpnameId) {
  const qtyMap: Record<string, number> = {};
  const notesMap: Record<string, string> = {};
  data.items.forEach((item) => {
    qtyMap[item.id] = item.qty_actual;
    notesMap[item.id] = item.notes ?? '';
  });
  setQtyActual(qtyMap);
  setNotes(notesMap);
  setSyncedOpnameId(data.id);
}
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-opname', id] });
    queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      stockOpnameApi.updateItems(
        id!,
        Object.entries(qtyActual).map(([itemId, qty]) => ({
          id: itemId,
          qty_actual: qty,
          notes: notes[itemId] || undefined,
        }))
      ),
    onSuccess: () => {
      toast.success('Hasil hitung fisik berhasil disimpan');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const completeMutation = useMutation({
    mutationFn: () => stockOpnameApi.complete(id!),
    onSuccess: () => {
      toast.success('Stock opname selesai, stok telah disesuaikan');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="text-gray-400">Memuat data...</div>;
  if (!data) return <div className="text-gray-400">Data tidak ditemukan.</div>;

  const isEditable = data.status === 'in_progress';

  return (
    <div>
      <button
        onClick={() => navigate('/inventory/stock-opnames')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.opname_number}</h1>
            <div className="mt-1"><StatusBadge status={data.status} /></div>
          </div>

          {isEditable && (
            <div className="flex gap-2">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex-1 sm:flex-none border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Selesaikan opname? Stok akan otomatis disesuaikan berdasarkan selisih dan tidak bisa diubah lagi.')) {
                    completeMutation.mutate();
                  }
                }}
                disabled={completeMutation.isPending}
                className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                {completeMutation.isPending ? 'Memproses...' : 'Selesaikan Opname'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-500">Gudang</span>
            <p className="font-medium text-gray-900">{data.warehouse.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Tanggal Opname</span>
            <p className="font-medium text-gray-900">{data.opname_date}</p>
          </div>
        </div>

        {data.items.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Tidak ada material dengan stok di gudang ini.
          </div>
        ) : (
          <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Material</th>
                  <th className="text-right px-3 py-2">Qty Sistem</th>
                  <th className="text-right px-3 py-2">Qty Fisik</th>
                  <th className="text-right px-3 py-2">Selisih</th>
                  <th className="text-left px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item) => {
                  const currentQty = qtyActual[item.id] ?? item.qty_actual;
                  const difference = currentQty - item.qty_system;

                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2 whitespace-nowrap">{item.material.name}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{item.qty_system}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {isEditable ? (
                          <input
                            type="number"
                            step="0.01"
                            value={qtyActual[item.id] ?? ''}
                            onChange={(e) =>
                              setQtyActual((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                          />
                        ) : (
                          item.qty_actual
                        )}
                      </td>
                      <td
                        className={`px-3 py-2 text-right whitespace-nowrap font-medium ${
                          difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        {difference > 0 ? '+' : ''}{difference}
                      </td>
                      <td className="px-3 py-2">
                        {isEditable ? (
                          <input
                            type="text"
                            value={notes[item.id] ?? ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Opsional"
                            className="w-full min-w-[140px] px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        ) : (
                          item.notes ?? '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}