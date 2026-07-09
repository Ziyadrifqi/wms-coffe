import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { stockOpnameApi } from '../../../api/inventory.api';
import { warehouseApi } from '../../../api/masterData.api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { SelectField, TextField } from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-espresso mb-6">Buat Stock Opname</h1>

      <div className="bg-honey-light border border-honey/20 text-honey text-sm rounded-lg p-4 mb-6">
        Sistem akan otomatis mengisi daftar material berdasarkan stok yang tercatat saat ini di gudang yang dipilih.
        Anda tinggal memasukkan hasil hitung fisik di halaman berikutnya.
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 space-y-4 max-w-md shadow-sm shadow-espresso/[0.02]"
      >
        <SelectField label="Gudang" {...register('warehouse_id')} error={errors.warehouse_id?.message}>
          <option value="">Pilih gudang</option>
          {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </SelectField>

        <TextField label="Tanggal Opname" type="date" {...register('opname_date')} error={errors.opname_date?.message} />

        <div className="flex gap-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/inventory/stock-opnames')}>
            Batal
          </Button>
          <Button type="submit" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? 'Membuat...' : 'Mulai Opname'}
          </Button>
        </div>
      </form>
    </div>
  );
}