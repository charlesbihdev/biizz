<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            // restrictOnDelete: orders are financial records — deletion must be intentional

            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone', 50)->nullable();
            $table->decimal('total', 12, 2);
            $table->char('currency', 3)->default('GHS');
            $table->string('status', 30)->default('pending');
            $table->string('payment_ref')->nullable()->unique();
            $table->string('payment_provider', 20)->nullable();
            $table->string('source', 20)->default('storefront');
            $table->timestamps();

            $table->index('business_id');
            $table->index(['business_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
