import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { purchaseOrderApi } from '../../../api/procurement.api';
import { supplierApi, warehouseApi, materialApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { TextField, SelectField, TextareaField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import type { Supplier, Warehouse, Material } from '../../../types/masterData';

const itemSchema = z.object({
  material_id: z.string().min(1, 'Pilih material'),
  qty_ordered: z.coerce.number().min(0.01, 'Qty minimal 0.01'),
  unit_price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
});

const schema = z.object({
  supplier_id: z.string().min(1, 'Pilih supplier'),
  warehouse_id: z.string().min(1, 'Pilih gudang'),
  order_date: z.string().min(1, 'Tanggal wajib diisi'),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Minimal 1 item'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => supplierApi.list({ per_page: 100, is_active: true }).then((res) => res.data.data as Supplier[]),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => warehouseApi.list({ per_page: 100, is_active: true }).then((res) => res.data.data as Warehouse[]),
  });

  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: () => materialApi.list({ per_page: 100, is_active: true }).then((res) => res.data.data as Material[]),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplier_id: '',
      warehouse_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_date: '',
      notes: '',
      items: [{ material_id: '', qty_ordered: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = useWatch({ control, name: 'items' });
  const grandTotal = watchItems?.reduce(
    (sum, item) => sum + (Number(item.qty_ordered) || 0) * (Number(item.unit_price) || 0),
    0
  ) ?? 0;

  const mutation = useMutation({
    mutationFn: (data: FormOutput) => purchaseOrderApi.create(data),
    onSuccess: () => {
      toast.success('Purchase Order berhasil dibuat');
      navigate('/procurement/purchase-orders');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-espresso mb-6">Buat Purchase Order</h1>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 space-y-6 shadow-sm shadow-espresso/[0.02]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Supplier" {...register('supplier_id')} error={errors.supplier_id?.message}>
            <option value="">Pilih supplier</option>
            {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectField>

          <SelectField label="Gudang Tujuan" {...register('warehouse_id')} error={errors.warehouse_id?.message}>
            <option value="">Pilih gudang</option>
            {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </SelectField>

          <TextField label="Tanggal Order" type="date" {...register('order_date')} error={errors.order_date?.message} />
          <TextField label="Tanggal Diharapkan (opsional)" type="date" {...register('expected_date')} />
        </div>

        <TextareaField label="Catatan" rows={2} {...register('notes')} />

        {/* ===== Item Material — gaya "struk kopi" ===== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-espresso/55 tracking-wide uppercase">Item Material</h3>
            <button
              type="button"
              onClick={() => append({ material_id: '', qty_ordered: 1, unit_price: 0 })}
              className="flex items-center gap-1 text-sm text-caramel hover:text-caramel-dark font-medium"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          <div className="bg-latte/40 rounded-xl border border-espresso/8 border-dashed p-3 sm:p-4 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-2 sm:items-start bg-cream p-3 rounded-lg border border-espresso/6">
                <div className="flex-1">
                  <select
                    {...register(`items.${index}.material_id`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40"
                  >
                    <option value="">Pilih material</option>
                    {materials?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  {errors.items?.[index]?.material_id && (
                    <p className="text-clay text-xs mt-1">{errors.items[index]?.material_id?.message}</p>
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    {...register(`items.${index}.qty_ordered`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40 font-mono"
                  />
                </div>

                <div className="w-full sm:w-36">
                  <input
                    type="number"
                    step="1"
                    placeholder="Harga satuan"
                    {...register(`items.${index}.unit_price`)}
                    className="w-full px-3 py-2 bg-latte/50 border border-espresso/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caramel/40 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="text-clay/60 hover:text-clay disabled:opacity-20 mt-2 sm:mt-2.5 self-end sm:self-start"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {errors.items?.message && <p className="text-clay text-xs">{errors.items.message}</p>}

            <div className="border-t border-dashed border-espresso/15 pt-3 flex justify-between items-center">
              <span className="text-xs text-espresso/40">Total {fields.length} item</span>
              <span className="font-display text-lg font-medium text-espresso">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/procurement/purchase-orders')}>
            Batal
          </Button>
          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan sebagai Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}