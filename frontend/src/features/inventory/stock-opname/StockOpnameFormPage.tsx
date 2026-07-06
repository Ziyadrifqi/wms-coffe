import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { stockOpnameApi } from '../../../api/inventory.api';
import { warehouseApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import type { Warehouse } from '../../../types/masterData';
import type { StockOpname } from '../../../types/inventory';

const schema = z.object({
  warehouse_id: z.string().min(1, 'Pilih gudang'),
  opname_date: z.string().min(1, 'Tanggal wajib diisi'),
});

type FormData = z.infer<typeof schema>;

export default function StockOpnameFormPage() {
  const navigate = useNavigate();

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => warehouseApi.list({ per_page: 100, is_active: true }).then((res) => res.data.data as Warehouse[]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouse_id: '',
      opname_date: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => stockOpnameApi.create(data),
    onSuccess: (res) => {
      const opname = (res.data as { data: StockOpname }).data;
      toast.success('Sesi opname berhasil dibuat, silakan isi hasil hitung fisik');
      navigate(`/inventory/stock-opnames/${opname.id}`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Stock Opname</h1>

      <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-md p-4 mb-6">
        Sistem akan otomatis mengisi daftar material berdasarkan stok yang tercatat saat ini di gudang yang dipilih.
        Anda tinggal memasukkan hasil hitung fisik di halaman berikutnya.
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4 max-w-md"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gudang</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Opname</label>
          <input
            type="date"
            {...register('opname_date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          {errors.opname_date && <p className="text-red-500 text-xs mt-1">{errors.opname_date.message}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/stock-opnames')}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Membuat...' : 'Mulai Opname'}
          </button>
        </div>
      </form>
    </div>
  );
}