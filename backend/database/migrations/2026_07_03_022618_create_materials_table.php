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
        Schema::create('materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku')->unique();
            $table->string('name');
            $table->foreignUuid('category_id')->constrained('categories');
            $table->foreignUuid('unit_id')->constrained('units');
            $table->decimal('min_stock', 12, 2)->default(0);   // untuk alert low stock
            $table->boolean('is_perishable')->default(false);   // ada expiry_date atau tidak
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('name'); // untuk search
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
