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
        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('gr_number')->unique();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->foreignUuid('received_by')->constrained('users');
            $table->date('receipt_date');
            $table->enum('status', ['draft', 'confirmed'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('purchase_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goods_receipts');
    }
};
