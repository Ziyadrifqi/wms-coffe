<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('material_id')->constrained('materials');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->enum('type', ['in', 'out', 'transfer', 'adjustment']);
            $table->enum('reference_type', [
                'goods_receipt',
                'production_request',
                'stock_opname',
                'transfer',
                'manual'
            ]);
            $table->uuid('reference_id')->nullable(); // polymorphic-like, id dari tabel sumber
            $table->decimal('qty', 14, 2);            // bisa negatif untuk 'out'
            $table->decimal('qty_before', 14, 2);
            $table->decimal('qty_after', 14, 2);
            $table->foreignUuid('created_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent(); // tanpa updated_at, movement immutable

            $table->index(['material_id', 'warehouse_id']);
            $table->index('created_at'); // penting untuk partitioning nanti
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
