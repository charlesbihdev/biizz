<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            // Stores the storage path within the private bucket (e.g. businesses/1/files/abc.pdf)
            // url remains for backwards compatibility with any existing public references
            $table->string('path')->nullable()->after('url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            $table->dropColumn('path');
        });
    }
};
