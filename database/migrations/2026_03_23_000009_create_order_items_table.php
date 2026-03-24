<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            // restrictOnDelete: cannot delete a product that has been ordered

            // Snapshot fields — immutable receipt data
            $table->string('product_name');              // name at time of order
            $table->decimal('unit_price', 12, 2);        // price at time of order
            $table->unsignedInteger('quantity');
            $table->decimal('subtotal', 12, 2);          // unit_price * quantity, stored for perf

            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
