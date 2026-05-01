<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('marketplace_payments', function (Blueprint $table): void {
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->index(['business_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('marketplace_payments', function (Blueprint $table): void {
            $table->dropIndex(['business_id', 'created_at']);
            $table->dropConstrainedForeignId('business_id');
        });
    }
};
