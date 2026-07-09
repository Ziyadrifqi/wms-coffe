import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { purchaseOrderApi, goodsReceiptApi } from '../../../api/procurement.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import Button from '../../../components/common/Button';
import { TextField } from '../../../components/common/FormField';

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

  if (!po) return <div className="text-espresso/30 text-sm">Memuat data PO...</div>;

  if (fields.length === 0) {
    return (
      <div className="bg-cream rounded-2xl border border-espresso/8 p-8 text-center text-espresso/40 text-sm">
        Semua item pada PO ini sudah diterima sepenuhnya.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-espresso mb-1">Goods Receipt</h1>
      <p className="text-sm text-espresso/45 mb-6">Untuk PO: <span className="font-mono">{po.po_number}</span> — {po.supplier.name}</p>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 space-y-6 shadow-sm shadow-espresso/[0.02]">
        <TextField label="Tanggal Terima" type="date" {...register('receipt_date')} error={errors.receipt_date?.message} className="max-w-xs" />

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-espresso/55 tracking-wide uppercase">Item Diterima</h3>

          <div className="bg-latte/40 rounded-xl border border-espresso/8 border-dashed p-3 sm:p-4 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-cream p-3 rounded-lg border border-espresso/6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 flex items-center text-sm font-medium text-espresso">
                  {field.material_name}
                  <span className="text-xs text-espresso/35 ml-1.5 font-mono">(sisa {field.max_qty})</span>
                </div>

                <div>
                  <label className="block text-[11px] text-espresso/40 uppercase tracking-wide mb-1">Qty Diterima</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.qty_received`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-caramel/40"
                  />
                  {errors.items?.[index]?.qty_received && (
                    <p className="text-clay text-xs mt-1">{errors.items[index]?.qty_received?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-espresso/40 uppercase tracking-wide mb-1">Tgl Kadaluarsa</label>
                  <input
                    type="date"
                    {...register(`items.${index}.expiry_date`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-espresso/40 uppercase tracking-wide mb-1">No. Batch</label>
                  <input
                    type="text"
                    {...register(`items.${index}.batch_number`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-espresso/55 mb-1.5 tracking-wide uppercase">Catatan</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate(`/procurement/purchase-orders/${poId}`)}>
            Batal
          </Button>
          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Konfirmasi Penerimaan'}
          </Button>
        </div>
      </form>
    </div>
  );
}