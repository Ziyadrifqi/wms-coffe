import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { productionRequestApi } from '../../api/production.api';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function ProductionRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [fulfillQty, setFulfillQty] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['production-request', id],
    queryFn: () => productionRequestApi.get(id!).then((res) => res.data.data),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['production-request', id] });
    queryClient.invalidateQueries({ queryKey: ['production-requests'] });
  };

  const approveMutation = useMutation({
    mutationFn: () => productionRequestApi.approve(id!),
    onSuccess: () => { toast.success('Request berhasil disetujui'); invalidate(); },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => productionRequestApi.reject(id!),
    onSuccess: () => { toast.success('Request ditolak'); invalidate(); },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const fulfillMutation = useMutation({
    mutationFn: () =>
      productionRequestApi.fulfill(id!, {
        items: Object.entries(fulfillQty)
          .filter(([, qty]) => qty > 0)
          .map(([itemId, qty]) => ({ production_request_item_id: itemId, qty_fulfilled: qty })),
      }),
    onSuccess: () => {
      toast.success('Bahan berhasil dikeluarkan, stok telah diperbarui');
      setFulfillQty({});
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="text-espresso/30 text-sm">Memuat data...</div>;
  if (!data) return <div className="text-espresso/30 text-sm">Data tidak ditemukan.</div>;

  const canFulfill = data.status === 'approved' && hasPermission('production-request.view');

  return (
    <div>
      <button
        onClick={() => navigate('/production/requests')}
        className="flex items-center gap-1 text-sm text-espresso/50 hover:text-espresso mb-4"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 shadow-sm shadow-espresso/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dashed border-espresso/12">
          <div>
            <h1 className="font-display text-xl font-medium text-espresso font-mono">{data.request_number}</h1>
            <div className="mt-1.5"><StatusBadge status={data.status} /></div>
          </div>

          {data.status === 'pending' && hasPermission('production-request.approve') && (
            <div className="flex gap-2">
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1 sm:flex-none bg-moss text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-moss/90 active:scale-[0.98] transition-all"
              >
                Setujui
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="flex-1 sm:flex-none bg-clay text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-clay/90 active:scale-[0.98] transition-all"
              >
                Tolak
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-espresso/40 text-xs uppercase tracking-wide">Gudang</span>
            <p className="font-medium text-espresso mt-0.5">{data.warehouse.name}</p>
          </div>
          <div>
            <span className="text-espresso/40 text-xs uppercase tracking-wide">Tanggal Request</span>
            <p className="font-medium text-espresso mt-0.5 font-mono">{data.request_date}</p>
          </div>
          <div>
            <span className="text-espresso/40 text-xs uppercase tracking-wide">Diminta oleh</span>
            <p className="font-medium text-espresso mt-0.5">{data.requested_by}</p>
          </div>
          {data.approved_by && (
            <div>
              <span className="text-espresso/40 text-xs uppercase tracking-wide">Disetujui oleh</span>
              <p className="font-medium text-espresso mt-0.5">{data.approved_by}</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-dashed border-espresso/15">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Material</th>
                <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Qty Diminta</th>
                <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Qty Dikeluarkan</th>
                {canFulfill && <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Keluarkan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-espresso/8">
              {data.items.map((item) => {
                const remaining = item.qty_requested - item.qty_fulfilled;
                return (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 whitespace-nowrap font-sans">{item.material.name}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">{item.qty_requested}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">{item.qty_fulfilled}</td>
                    {canFulfill && (
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {remaining > 0 ? (
                          <input
                            type="number"
                            step="0.01"
                            max={remaining}
                            placeholder={`Maks ${remaining}`}
                            value={fulfillQty[item.id] ?? ''}
                            onChange={(e) => setFulfillQty((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                            className="w-28 px-2 py-1 bg-latte/50 border border-espresso/12 rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-caramel/40"
                          />
                        ) : (
                          <span className="text-espresso/30 text-xs">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.notes && (
          <div className="text-sm text-espresso/60 mb-4">
            <span className="text-espresso/40">Catatan: </span>{data.notes}
          </div>
        )}

        {canFulfill && (
          <Button
            onClick={() => fulfillMutation.mutate()}
            disabled={fulfillMutation.isPending || Object.values(fulfillQty).every((q) => !q)}
            fullWidth
            className="sm:w-auto"
          >
            {fulfillMutation.isPending ? 'Memproses...' : 'Keluarkan Bahan'}
          </Button>
        )}
      </div>
    </div>
  );
}