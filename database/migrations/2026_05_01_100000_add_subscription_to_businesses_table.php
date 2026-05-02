<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->string('subscription_tier', 20)->default('free')->after('is_active');
            $table->timestamp('subscription_expires_at')->nullable()->after('subscription_tier');
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_expires_at');
            $table->index('subscription_tier');
        });

        Schema::create('subscription_changes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('from_tier', 20);
            $table->string('to_tier', 20);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['business_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_changes');

        Schema::table('businesses', function (Blueprint $table): void {
            $table->dropIndex(['subscription_tier']);
            $table->dropColumn(['subscription_tier', 'subscription_expires_at', 'trial_ends_at']);
        });
    }
};
