<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('theme_id', 50)->default('classic');
            $table->jsonb('theme_settings')->default('{}');
            $table->text('paystack_secret')->nullable();   // AES-256 encrypted
            $table->text('junipay_secret')->nullable();    // AES-256 encrypted
            $table->string('meta_pixel_id', 50)->nullable();
            $table->boolean('ai_enabled')->default(false);
            $table->timestamps();
        });

        // GIN index for high-performance jsonb queries on theme_settings
        DB::statement('CREATE INDEX businesses_theme_settings_gin ON businesses USING GIN (theme_settings)');
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
