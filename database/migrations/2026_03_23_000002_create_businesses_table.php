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

            // Brand identity
            $table->string('logo_url', 2048)->nullable();
            $table->string('favicon_url', 2048)->nullable();
            $table->string('tagline', 150)->nullable();

            // Store classification
            $table->enum('business_type', ['physical', 'digital'])->default('physical');
            $table->string('business_category', 60)->nullable();

            // Business profile
            $table->text('description')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 300)->nullable();
            $table->string('seo_image', 2048)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->jsonb('social_links')->default('{}');

            // Theme
            $table->string('theme_id', 50)->default('classic');
            $table->jsonb('theme_settings')->default('{}');

            // Payment integrations
            $table->string('default_payment_provider', 20)->nullable();
            $table->text('paystack_secret')->nullable();   // AES-256 encrypted
            $table->text('junipay_client_id')->nullable(); // Junipay client ID (plain text)
            $table->text('junipay_token_link')->nullable(); // Junipay token endpoint URL
            $table->text('junipay_secret')->nullable();    // AES-256 encrypted

            // Meta
            $table->string('meta_pixel_id', 50)->nullable();
            $table->boolean('ai_enabled')->default(false);
            $table->enum('customer_login_mode', ['none', 'checkout', 'full'])->default('checkout');
            $table->boolean('is_active')->default(false);
            $table->boolean('show_branding')->default(true);
            $table->timestamps();
        });

        // GIN index for high-performance jsonb queries — PostgreSQL only
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX businesses_theme_settings_gin ON businesses USING GIN (theme_settings)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
