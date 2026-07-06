import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { purchaseOrderApi } from '../../../api/procurement.api';
import StatusBadge from '../../../components/common/StatusBadge';
import { useAuthStore } from '../../../stores/authStore';
import { getErrorMessage } from '../../../utils/getErrorMessage';

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderApi.get(id!).then((res) => res.data.data),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  };

  const submitMutation = useMutation({
    mutationFn: () => purchaseOrderApi.submit(id!),
    onSuccess: () => {
      toast.success('PO berhasil diajukan untuk approval');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => purchaseOrderApi.approve(id!),
    onSuccess: () => {
      toast.success('PO berhasil disetujui');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => purchaseOrderApi.reject(id!),
    onSuccess: () => {
      toast.success('PO ditolak');
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="text-gray-400">Memuat data...</div>;
  if (!data) return <div className="text-gray-400">Data tidak ditemukan.</div>;

  return (
    <div>
      <button
        onClick={() => navigate('/procurement/purchase-orders')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.po_number}</h1>
            <div className="mt-1"><StatusBadge status={data.status} /></div>
          </div>

          <div className="flex gap-2">
            {data.status === 'draft' && hasPermission('purchase-order.edit') && (
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Ajukan Approval
              </button>
            )}

            {data.status === 'pending' && hasPermission('purchase-request.approve') && (
              <>
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Setujui
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Tolak
                </button>
              </>
            )}

            {data.status === 'approved' && hasPermission('goods-receipt.create') && (
              <button
                onClick={() => navigate(`/procurement/goods-receipts/new?po_id=${data.id}`)}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Buat Goods Receipt
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-500">Supplier</span>
            <p className="font-medium text-gray-900">{data.supplier.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Gudang</span>
            <p className="font-medium text-gray-900">{data.warehouse.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Tanggal Order</span>
            <p className="font-medium text-gray-900">{data.order_date}</p>
          </div>
          <div>
            <span className="text-gray-500">Dibuat oleh</span>
            <p className="font-medium text-gray-900">{data.created_by}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Material</th>
                <th className="text-right px-3 py-2">Qty Order</th>
                <th className="text-right px-3 py-2">Qty Diterima</th>
                <th className="text-right px-3 py-2">Harga Satuan</th>
                <th className="text-right px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{item.material.name}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{item.qty_ordered}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{item.qty_received}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">Rp {Number(item.unit_price).toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right font-semibold text-gray-900">
          Total: Rp {Number(data.total_amount).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  );
}