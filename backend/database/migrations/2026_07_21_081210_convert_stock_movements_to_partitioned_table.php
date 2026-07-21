<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Rename tabel lama jadi backup sementara
        DB::statement('ALTER TABLE stock_movements RENAME TO stock_movements_old');

        // 2. Buat tabel baru yang partitioned by RANGE (created_at)
        DB::statement("
            CREATE TABLE stock_movements (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL,
                warehouse_id UUID NOT NULL,
                type VARCHAR(20) NOT NULL,
                reference_type VARCHAR(30) NOT NULL,
                reference_id UUID NULL,
                qty NUMERIC(14,2) NOT NULL,
                qty_before NUMERIC(14,2) NOT NULL,
                qty_after NUMERIC(14,2) NOT NULL,
                created_by UUID NOT NULL,
                notes TEXT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT now(),
                PRIMARY KEY (id, created_at)
            ) PARTITION BY RANGE (created_at)
        ");

        // 3. Buat partisi untuk 3 bulan ke belakang, bulan ini, dan 6 bulan ke depan
        $startMonth = now()->subMonths(3)->startOfMonth();
        $endMonth = now()->addMonths(6)->startOfMonth();

        $current = $startMonth->copy();
        while ($current <= $endMonth) {
            $this->createPartitionForMonth($current);
            $current->addMonth();
        }

        // 4. Pindahkan data lama ke tabel baru (kalau ada)
        DB::statement('
            INSERT INTO stock_movements
            SELECT * FROM stock_movements_old
        ');

        // 5. Buat index di tabel partitioned (otomatis ter-apply ke semua partisi anak)
        DB::statement('CREATE INDEX stock_movements_material_warehouse_idx ON stock_movements (material_id, warehouse_id)');
        DB::statement('CREATE INDEX stock_movements_created_at_idx ON stock_movements (created_at)');
        DB::statement('CREATE INDEX stock_movements_reference_idx ON stock_movements (reference_type, reference_id)');

        // 6. Hapus tabel lama
        DB::statement('DROP TABLE stock_movements_old');

        // 7. Tambahkan kembali foreign key constraints
        DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_material_id_foreign FOREIGN KEY (material_id) REFERENCES materials(id)');
        DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)');
        DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_foreign FOREIGN KEY (created_by) REFERENCES users(id)');
    }

    private function createPartitionForMonth(\Carbon\Carbon $month): void
    {
        $partitionName = 'stock_movements_' . $month->format('Y_m');
        $startDate = $month->format('Y-m-d');
        $endDate = $month->copy()->addMonth()->format('Y-m-d');

        DB::statement("
            CREATE TABLE IF NOT EXISTS {$partitionName}
            PARTITION OF stock_movements
            FOR VALUES FROM ('{$startDate}') TO ('{$endDate}')
        ");
    }

    public function down(): void
    {
        throw new \RuntimeException('Rollback untuk migration partitioning tidak didukung. Gunakan backup database (backup_before_partition.sql).');
    }
};
