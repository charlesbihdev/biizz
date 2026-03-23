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
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('images')->default('[]');    // [{url, alt, order}]
            $table->jsonb('metadata')->default('{}'); // flexible per-product extra data
            $table->timestamps();

            $table->index('business_id');
            $table->index(['business_id', 'is_active']); // most common query pattern
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
