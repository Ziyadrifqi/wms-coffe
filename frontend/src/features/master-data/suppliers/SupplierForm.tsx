import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi } from '../../../api/masterData.api';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
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
    mutationFn: (data: FormData) =>
      isEdit ? supplierApi.update(supplier!.id, data) : supplierApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Supplier berhasil diperbarui' : 'Supplier berhasil ditambahkan');
      onSuccess();
    },
    onError: (err: any) => {
      const message = err.response?.data?.message ?? 'Terjadi kesalahan';
      toast.error(message);
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
        <input
          {...register('code')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="SUP-001"
        />
        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
        <input
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="PT Kopi Nusantara"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
        <input
          {...register('phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register('email')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <textarea
          {...register('address')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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