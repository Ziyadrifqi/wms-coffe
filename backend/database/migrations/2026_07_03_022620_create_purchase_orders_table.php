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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('po_number')->unique();
            $table->foreignUuid('supplier_id')->constrained('suppliers');
            $table->foreignUuid('warehouse_id')->constrained('warehouses');
            $table->foreignUuid('created_by')->constrained('users');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'])
                ->default('draft');
            $table->date('order_date');
            $table->date('expected_date')->nullable();
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
