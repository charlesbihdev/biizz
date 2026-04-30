<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('digital_category')->nullable()->default('Others');
            $table->string('delivery_mode', 20)->nullable();
            $table->string('external_url', 2048)->nullable();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('promo_video', 2048)->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('compare_at_price', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('metadata')->default('{}');
            $table->json('tags')->default('[]');
            $table->timestamps();

            $table->unique(['business_id', 'slug']);
            $table->index('business_id');
            $table->index(['business_id', 'category_id']);
            $table->index(['business_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
