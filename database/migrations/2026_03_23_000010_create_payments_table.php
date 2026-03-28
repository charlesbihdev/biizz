<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();

            $table->string('gateway', 20);          // 'paystack' or 'junipay'
            $table->string('reference')->unique();   // our generated ref sent to provider
            $table->string('transaction_id')->nullable(); // provider's own transaction ID
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('GHS');
            $table->string('status', 20)->default('pending'); // pending/success/failed
            $table->timestamp('paid_at')->nullable();
            $table->jsonb('metadata')->default('{}');          // provider-specific response data

            $table->timestamps();

            $table->index('business_id');
            $table->index('order_id');
            $table->index(['business_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
