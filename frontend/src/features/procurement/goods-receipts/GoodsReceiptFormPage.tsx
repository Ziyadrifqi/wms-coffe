import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { purchaseOrderApi, goodsReceiptApi } from '../../../api/procurement.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const itemSchema = z.object({
  purchase_order_item_id: z.string(),
  material_id: z.string(),
  material_name: z.string(),
  max_qty: z.number(),
  qty_received: z.coerce.number().min(0.01, 'Qty minimal 0.01'),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
});

const schema = z.object({
  purchase_order_id: z.string().min(1),
  receipt_date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function GoodsReceiptFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get('po_id') ?? '';

  const { data: po } = useQuery({
    queryKey: ['purchase-order', poId],
    queryFn: () => purchaseOrderApi.get(poId).then((res) => res.data.data),
    enabled: !!poId,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchase_order_id: poId,
      receipt_date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [],
    },
  });

  const { fields } = useFieldArray({ control, name: 'items' });

  // Isi item otomatis dari sisa qty PO yang belum diterima
  useEffect(() => {
    if (po) {
      const remainingItems = po.items
        .filter((item) => item.qty_received < item.qty_ordered)
        .map((item) => ({
          purchase_order_item_id: item.id,
          material_id: item.material.id,
          material_name: item.material.name,
          max_qty: item.qty_ordered - item.qty_received,
          qty_received: item.qty_ordered - item.qty_received,
          expiry_date: '',
          batch_number: '',
        }));

      reset({
        purchase_order_id: po.id,
        receipt_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: remainingItems,
      });
    }
  }, [po, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormOutput) =>
      goodsReceiptApi.create({
        purchase_order_id: data.purchase_order_id,
        receipt_date: data.receipt_date,
        notes: data.notes,
        items: data.items.map((item) => ({
          purchase_order_item_id: item.purchase_order_item_id,
          material_id: item.material_id,
          qty_received: item.qty_received,
          expiry_date: item.expiry_date || undefined,
          batch_number: item.batch_number || undefined,
        })),
      }),
    onSuccess: () => {
      toast.success('Goods Receipt berhasil dibuat, stok telah diperbarui');
      navigate(`/procurement/purchase-orders/${poId}`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: FormOutput) => mutation.mutate(data);

  if (!po) return <div className="text-gray-400">Memuat data PO...</div>;

  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400">
        Semua item pada PO ini sudah diterima sepenuhnya.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Goods Receipt</h1>
      <p className="text-sm text-gray-500 mb-6">Untuk PO: {po.po_number} — {po.supplier.name}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terima</label>
          <input
            type="date"
            {...register('receipt_date')}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          {errors.receipt_date && <p className="text-red-500 text-xs mt-1">{errors.receipt_date.message}</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Item Diterima</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 p-3 rounded-md grid grid-cols-4 gap-3">
              <div className="col-span-4 sm:col-span-1 flex items-center text-sm font-medium text-gray-700">
                {field.material_name}
                <span className="text-xs text-gray-400 ml-1">(sisa {field.max_qty})</span>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Qty Diterima</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.qty_received`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {errors.items?.[index]?.qty_received && (
                  <p className="text-red-500 text-xs mt-1">{errors.items[index]?.qty_received?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Tgl Kadaluarsa (opsional)</label>
                <input
                  type="date"
                  {...register(`items.${index}.expiry_date`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">No. Batch (opsional)</label>
                <input
                  type="text"
                  {...register(`items.${index}.batch_number`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/procurement/purchase-orders/${poId}`)}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Konfirmasi Penerimaan'}
          </button>
        </div>
      </form>
    </div>
  );
}