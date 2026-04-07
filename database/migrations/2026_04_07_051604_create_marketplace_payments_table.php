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
        Schema::create('marketplace_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('marketplace_purchase_id')->constrained()->cascadeOnDelete();

            $table->string('gateway', 20)->default('paystack');
            $table->string('reference')->unique();
            $table->string('transaction_id')->nullable();
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('GHS');
            $table->string('status', 20)->default('pending'); // pending | success | failed
            $table->jsonb('metadata')->default('{}');
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->index('marketplace_purchase_id');
            $table->index(['marketplace_purchase_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_payments');
    }
};
