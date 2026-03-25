<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->string('favicon_url', 2048)->nullable()->after('logo_url');
            $table->string('seo_title')->nullable()->after('description');
            $table->string('seo_description', 300)->nullable()->after('seo_title');
            $table->string('seo_image', 2048)->nullable()->after('seo_description');
            $table->boolean('show_branding')->default(true)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table): void {
            $table->dropColumn(['favicon_url', 'seo_title', 'seo_description', 'seo_image', 'show_branding']);
        });
    }
};
