<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_purchases', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('buyer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->string('payment_ref')->nullable();
            $table->string('status')->default('pending'); // pending | paid | free
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['buyer_id', 'product_id']);
            $table->index(['buyer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_purchases');
    }
};
