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
        Schema::create('stock', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('material_id')->constrained('materials');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->foreignUuid('warehouse_location_id')->nullable()->constrained('warehouse_locations');
            $table->decimal('qty', 14, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->string('batch_number')->nullable();
            $table->timestamps();

            // satu material di satu lokasi+batch = satu baris (biar gampang update qty)
            $table->unique(['material_id', 'warehouse_id', 'warehouse_location_id', 'batch_number'], 'stock_unique_location_batch');
            $table->index(['material_id', 'warehouse_id']);
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};
