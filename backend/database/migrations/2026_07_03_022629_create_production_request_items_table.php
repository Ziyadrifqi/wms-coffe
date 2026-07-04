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
        Schema::create('production_request_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('production_request_id')->constrained('production_requests')->cascadeOnDelete();
            $table->foreignUuid('material_id')->constrained('materials');
            $table->decimal('qty_requested', 12, 2);
            $table->decimal('qty_fulfilled', 12, 2)->default(0);
            $table->timestamps();

            $table->index('production_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_request_items');
    }
};
