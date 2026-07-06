import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { productionRequestApi } from '../../api/production.api';
import StatusBadge from '../../components/common/StatusBadge';
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
    onSuccess: () => {
      toast.success('Request berhasil disetujui');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => productionRequestApi.reject(id!),
    onSuccess: () => {
      toast.success('Request ditolak');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const fulfillMutation = useMutation({
    mutationFn: () =>
      productionRequestApi.fulfill(id!, {
        items: Object.entries(fulfillQty)
          .filter(([, qty]) => qty > 0)
          .map(([itemId, qty]) => ({
            production_request_item_id: itemId,
            qty_fulfilled: qty,
          })),
      }),
    onSuccess: () => {
      toast.success('Bahan berhasil dikeluarkan, stok telah diperbarui');
      setFulfillQty({});
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="text-gray-400">Memuat data...</div>;
  if (!data) return <div className="text-gray-400">Data tidak ditemukan.</div>;

  const canFulfill = data.status === 'approved' && hasPermission('production-request.view');

  return (
    <div>
      <button
        onClick={() => navigate('/production/requests')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.request_number}</h1>
            <div className="mt-1"><StatusBadge status={data.status} /></div>
          </div>

          {data.status === 'pending' && hasPermission('production-request.approve') && (
            <div className="flex gap-2">
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Setujui
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Tolak
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-500">Gudang</span>
            <p className="font-medium text-gray-900">{data.warehouse.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Tanggal Request</span>
            <p className="font-medium text-gray-900">{data.request_date}</p>
          </div>
          <div>
            <span className="text-gray-500">Diminta oleh</span>
            <p className="font-medium text-gray-900">{data.requested_by}</p>
          </div>
          {data.approved_by && (
            <div>
              <span className="text-gray-500">Disetujui oleh</span>
              <p className="font-medium text-gray-900">{data.approved_by}</p>
            </div>
          )}
        </div>

        <table className="w-full text-sm mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Material</th>
              <th className="text-right px-3 py-2">Qty Diminta</th>
              <th className="text-right px-3 py-2">Qty Dikeluarkan</th>
              {canFulfill && <th className="text-right px-3 py-2">Keluarkan Sekarang</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item) => {
              const remaining = item.qty_requested - item.qty_fulfilled;
              return (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.material.name}</td>
                  <td className="px-3 py-2 text-right">{item.qty_requested}</td>
                  <td className="px-3 py-2 text-right">{item.qty_fulfilled}</td>
                  {canFulfill && (
                    <td className="px-3 py-2 text-right">
                      {remaining > 0 ? (
                        <input
                          type="number"
                          step="0.01"
                          max={remaining}
                          placeholder={`Maks ${remaining}`}
                          value={fulfillQty[item.id] ?? ''}
                          onChange={(e) =>
                            setFulfillQty((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Selesai</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.notes && (
          <div className="text-sm text-gray-600 mb-4">
            <span className="text-gray-500">Catatan: </span>{data.notes}
          </div>
        )}

        {canFulfill && (
          <button
            onClick={() => fulfillMutation.mutate()}
            disabled={fulfillMutation.isPending || Object.values(fulfillQty).every((q) => !q)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {fulfillMutation.isPending ? 'Memproses...' : 'Keluarkan Bahan'}
          </button>
        )}
      </div>
    </div>
  );
}