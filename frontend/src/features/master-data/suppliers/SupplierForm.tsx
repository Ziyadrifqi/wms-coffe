import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { TextField, TextareaField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import type { Supplier } from '../../../types/masterData';

const schema = z.object({
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  supplier: Supplier | null;
  onSuccess: () => void;
}

export default function SupplierForm({ supplier, onSuccess }: Props) {
  const isEdit = !!supplier;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: supplier?.code ?? '',
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
      is_active: supplier?.is_active ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => (isEdit ? supplierApi.update(supplier!.id, data) : supplierApi.create(data)),
    onSuccess: () => {
      toast.success(isEdit ? 'Supplier berhasil diperbarui' : 'Supplier berhasil ditambahkan');
      onSuccess();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <TextField label="Kode" placeholder="SUP-001" {...register('code')} error={errors.code?.message} />
      <TextField label="Nama" placeholder="PT Kopi Nusantara" {...register('name')} error={errors.name?.message} />
      <TextField label="Telepon" {...register('phone')} />
      <TextField label="Email" {...register('email')} error={errors.email?.message} />
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