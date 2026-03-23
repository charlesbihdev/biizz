<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->boolean('is_active')->default(true)->after('ai_enabled');
            $table->text('description')->nullable()->after('slug');
            $table->string('contact_email')->nullable()->after('description');
            $table->string('phone', 30)->nullable()->after('contact_email');
            $table->text('address')->nullable()->after('phone');
            $table->string('website')->nullable()->after('address');
            $table->jsonb('social_links')->default('{}')->after('website');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->dropColumn([
                'is_active', 'description', 'contact_email',
                'phone', 'address', 'website', 'social_links',
            ]);
        });
    }
};
