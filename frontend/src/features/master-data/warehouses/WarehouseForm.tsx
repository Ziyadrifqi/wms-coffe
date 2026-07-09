import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { warehouseApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { TextField, TextareaField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import type { Warehouse } from '../../../types/masterData';

const schema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  warehouse: Warehouse | null;
  onSuccess: () => void;
}

export default function WarehouseForm({ warehouse, onSuccess }: Props) {
  const isEdit = !!warehouse;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: warehouse?.code ?? '',
      name: warehouse?.name ?? '',
      address: warehouse?.address ?? '',
      is_active: warehouse?.is_active ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => (isEdit ? warehouseApi.update(warehouse!.id, data) : warehouseApi.create(data)),
    onSuccess: () => {
      toast.success(isEdit ? 'Warehouse berhasil diperbarui' : 'Warehouse berhasil ditambahkan');
      onSuccess();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <TextField label="Kode" placeholder="WH-MAIN" {...register('code')} error={errors.code?.message} />
      <TextField label="Nama" placeholder="Gudang Utama" {...register('name')} error={errors.name?.message} />
      <TextareaField label="Alamat" rows={2} {...register('address')} />

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