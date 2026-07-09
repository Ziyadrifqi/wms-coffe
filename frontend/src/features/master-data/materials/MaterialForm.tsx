import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { materialApi, categoryApi, unitApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { TextField, SelectField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import type { Material, Category, Unit } from '../../../types/masterData';

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

  const { data: categories } = useQuery({
    queryKey: ['categories', 'material'],
    queryFn: () => categoryApi.list({ type: 'material', per_page: 100 }).then((res) => res.data.data as Category[]),
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => unitApi.list({ per_page: 100 }).then((res) => res.data.data as Unit[]),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
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
    mutationFn: (data: FormOutput) => (isEdit ? materialApi.update(material!.id, data) : materialApi.create(data)),
    onSuccess: () => {
      toast.success(isEdit ? 'Material berhasil diperbarui' : 'Material berhasil ditambahkan');
      onSuccess();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <TextField label="SKU" placeholder="MAT-001" {...register('sku')} error={errors.sku?.message} />
      <TextField label="Nama" placeholder="Biji Kopi Arabika" {...register('name')} error={errors.name?.message} />

      <SelectField label="Kategori" {...register('category_id')} error={errors.category_id?.message}>
        <option value="">Pilih kategori</option>
        {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </SelectField>

      <SelectField label="Satuan" {...register('unit_id')} error={errors.unit_id?.message}>
        <option value="">Pilih satuan</option>
        {units?.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
      </SelectField>

      <TextField label="Stok Minimum" type="number" step="0.01" {...register('min_stock')} error={errors.min_stock?.message} />

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_perishable')} className="rounded accent-caramel" />
        <span className="text-sm text-espresso/70">Mudah kadaluarsa (perishable)</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('is_active')} className="rounded accent-caramel" />
        <span className="text-sm text-espresso/70">Aktif</span>
      </label>

      <Button type="submit" fullWidth disabled={mutation.isPending}>
        {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </form>
  );
}