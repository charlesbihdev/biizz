<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->string('subscription_gateway', 20)->default('paystack')->after('trial_ends_at');
            $table->string('subscription_customer_id', 64)->nullable()->after('subscription_gateway');
            $table->string('subscription_id', 64)->nullable()->after('subscription_customer_id');
            $table->string('paystack_email_token', 64)->nullable()->after('subscription_id');
            $table->string('subscription_status', 20)->default('inactive')->after('paystack_email_token');
            $table->timestamp('current_period_end')->nullable()->after('subscription_status');

            $table->unique('subscription_id');
            $table->index('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->dropUnique(['subscription_id']);
            $table->dropIndex(['subscription_status']);
            $table->dropColumn([
                'subscription_gateway',
                'subscription_customer_id',
                'subscription_id',
                'paystack_email_token',
                'subscription_status',
                'current_period_end',
            ]);
        });
    }
};
