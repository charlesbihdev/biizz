<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_invoices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();

            $table->string('tier', 16);
            $table->string('gateway', 20)->default('paystack');
            $table->string('reference', 64)->unique();
            $table->string('provider_transaction_id', 64)->nullable();
            $table->string('gateway_invoice_id', 64)->nullable();

            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('GHS');
            $table->string('status', 20)->default('pending');

            $table->timestamp('period_start')->nullable();
            $table->timestamp('period_end')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->jsonb('metadata')->default('{}');
            $table->timestamps();

            $table->index(['business_id', 'created_at']);
            $table->index('status');
            $table->index('gateway_invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_invoices');
    }
};
