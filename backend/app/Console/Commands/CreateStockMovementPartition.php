<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateStockMovementPartition extends Command
{
    protected $signature = 'stock-movements:create-partition {--months=3}';
    protected $description = 'Buat partisi stock_movements untuk bulan-bulan ke depan';

    public function handle(): void
    {
        $monthsAhead = (int) $this->option('months');

        for ($i = 0; $i < $monthsAhead; $i++) {
            $month = now()->addMonths($i)->startOfMonth();
            $partitionName = 'stock_movements_' . $month->format('Y_m');
            $startDate = $month->format('Y-m-d');
            $endDate = $month->copy()->addMonth()->format('Y-m-d');

            DB::statement("
                CREATE TABLE IF NOT EXISTS {$partitionName}
                PARTITION OF stock_movements
                FOR VALUES FROM ('{$startDate}') TO ('{$endDate}')
            ");

            $this->info("Partisi {$partitionName} siap ({$startDate} s/d {$endDate})");
        }
    }
}
