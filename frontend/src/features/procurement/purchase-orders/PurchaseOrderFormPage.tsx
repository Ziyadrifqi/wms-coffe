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

  const onSubmit = (data: FormOutput) => mutation.mutate(data);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Purchase Order</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              {...register('supplier_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Pilih supplier</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gudang Tujuan</label>
            <select
              {...register('warehouse_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Pilih gudang</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Order</label>
            <input
              type="date"
              {...register('order_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Diharapkan (opsional)</label>
            <input
              type="date"
              {...register('expected_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Item Material</h3>
            <button
              type="button"
              onClick={() => append({ material_id: '', qty_ordered: 1, unit_price: 0 })}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-2 sm:items-start bg-gray-50 p-3 rounded-md">
                <div className="flex-1">
                  <select
                    {...register(`items.${index}.material_id`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Pilih material</option>
                    {materials?.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.items?.[index]?.material_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.items[index]?.material_id?.message}</p>
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    {...register(`items.${index}.qty_ordered`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="w-full sm:w-36">
                  <input
                    type="number"
                    step="1"
                    placeholder="Harga satuan"
                    {...register(`items.${index}.unit_price`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30 mt-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {errors.items?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.items.message}</p>
          )}

          <div className="text-right mt-3 text-sm font-semibold text-gray-700">
            Total: Rp {grandTotal.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/procurement/purchase-orders')}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan sebagai Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}