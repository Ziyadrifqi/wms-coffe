import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { purchaseOrderApi } from '../../../api/procurement.api';
import StatusBadge from '../../../components/common/StatusBadge';
import Button from '../../../components/common/Button';
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
    onSuccess: () => { toast.success('PO berhasil diajukan untuk approval'); invalidate(); },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => purchaseOrderApi.approve(id!),
    onSuccess: () => { toast.success('PO berhasil disetujui'); invalidate(); },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () => purchaseOrderApi.reject(id!),
    onSuccess: () => { toast.success('PO ditolak'); invalidate(); },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="text-espresso/30 text-sm">Memuat data...</div>;
  if (!data) return <div className="text-espresso/30 text-sm">Data tidak ditemukan.</div>;

  return (
    <div>
      <button
        onClick={() => navigate('/procurement/purchase-orders')}
        className="flex items-center gap-1 text-sm text-espresso/50 hover:text-espresso mb-4"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Kartu bergaya struk — sobekan atas */}
      <div className="relative">
        <div className="absolute -top-2 left-0 right-0 h-4 bg-latte" style={{
          maskImage: 'radial-gradient(circle at 8px 0, transparent 8px, black 8.5px)',
          maskSize: '16px 100%',
        }} />
        <div className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 shadow-sm shadow-espresso/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dashed border-espresso/12">
            <div>
              <h1 className="font-display text-xl font-medium text-espresso font-mono">{data.po_number}</h1>
              <div className="mt-1.5"><StatusBadge status={data.status} /></div>
            </div>

            <div className="flex gap-2">
              {data.status === 'draft' && hasPermission('purchase-order.edit') && (
                <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="flex-1 sm:flex-none">
                  Ajukan Approval
                </Button>
              )}

              {data.status === 'pending' && hasPermission('purchase-request.approve') && (
                <>
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
                </>
              )}

              {data.status === 'approved' && hasPermission('goods-receipt.create') && (
                <Button onClick={() => navigate(`/procurement/goods-receipts/new?po_id=${data.id}`)} className="flex-1 sm:flex-none">
                  Buat Goods Receipt
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="text-espresso/40 text-xs uppercase tracking-wide">Supplier</span>
              <p className="font-medium text-espresso mt-0.5">{data.supplier.name}</p>
            </div>
            <div>
              <span className="text-espresso/40 text-xs uppercase tracking-wide">Gudang</span>
              <p className="font-medium text-espresso mt-0.5">{data.warehouse.name}</p>
            </div>
            <div>
              <span className="text-espresso/40 text-xs uppercase tracking-wide">Tanggal Order</span>
              <p className="font-medium text-espresso mt-0.5 font-mono">{data.order_date}</p>
            </div>
            <div>
              <span className="text-espresso/40 text-xs uppercase tracking-wide">Dibuat oleh</span>
              <p className="font-medium text-espresso mt-0.5">{data.created_by}</p>
            </div>
          </div>

          <div className="overflow-x-auto mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-dashed border-espresso/15">
                <tr>
                  <th className="text-left px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Material</th>
                  <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Qty Order</th>
                  <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Qty Diterima</th>
                  <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Harga Satuan</th>
                  <th className="text-right px-3 py-2 text-xs text-espresso/40 uppercase tracking-wide">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-espresso/8">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 whitespace-nowrap font-sans">{item.material.name}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">{item.qty_ordered}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">{item.qty_received}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">Rp {Number(item.unit_price).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-mono">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right border-t border-dashed border-espresso/15 pt-3">
            <span className="font-display text-lg font-medium text-espresso">
              Total: Rp {Number(data.total_amount).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}