import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { materialApi, categoryApi, unitApi } from '../../../api/masterData.api';
import type { Material, Category, Unit } from '../../../types/masterData';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const schema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  unit_id: z.string().min(1, 'Satuan wajib dipilih'),
  min_stock: z.coerce.number().min(0, 'Minimal 0'),
  is_perishable: z.boolean(),
  is_active: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  material: Material | null;
  onSuccess: () => void;
}

export default function MaterialForm({ material, onSuccess }: Props) {
  const isEdit = !!material;

  // Fetch dropdown options
  const { data: categories } = useQuery({
    queryKey: ['categories', 'material'],
    queryFn: () =>
      categoryApi.list({ type: 'material', per_page: 100 }).then((res) => res.data.data as Category[]),
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => unitApi.list({ per_page: 100 }).then((res) => res.data.data as Unit[]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<FormInput, any, FormOutput>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      sku: material?.sku ?? '',
      name: material?.name ?? '',
      category_id: material?.category?.id ?? '',
      unit_id: material?.unit?.id ?? '',
      min_stock: material?.min_stock ?? 0,
      is_perishable: material?.is_perishable ?? false,
      is_active: material?.is_active ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormOutput) =>
      isEdit ? materialApi.update(material!.id, data) : materialApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Material berhasil diperbarui' : 'Material berhasil ditambahkan');
      onSuccess();
    },
    onError: (err: unknown) => {
  toast.error(getErrorMessage(err));
},
  });

  const onSubmit = (data: FormOutput) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
        <input
          {...register('sku')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="MAT-001"
        />
        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
        <input
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Biji Kopi Arabika"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select
          {...register('category_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih kategori</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
        <select
          {...register('unit_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih satuan</option>
          {units?.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.symbol})
            </option>
          ))}
        </select>
        {errors.unit_id && <p className="text-red-500 text-xs mt-1">{errors.unit_id.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
        <input
          type="number"
          step="0.01"
          {...register('min_stock')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.min_stock && <p className="text-red-500 text-xs mt-1">{errors.min_stock.message}</p>}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_perishable')} className="rounded" />
        <span className="text-sm text-gray-700">Mudah kadaluarsa (perishable)</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} className="rounded" />
        <span className="text-sm text-gray-700">Aktif</span>
      </label>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}