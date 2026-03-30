<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->string('password')->nullable()->after('email');
            $table->string('google_id')->nullable()->after('password');
            $table->string('avatar')->nullable()->after('google_id');
            $table->timestamp('email_verified_at')->nullable()->after('avatar');
            $table->rememberToken()->after('email_verified_at');

            // Same Google account logging into two different businesses = two separate customer records
            $table->unique(['business_id', 'google_id']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->dropUnique(['business_id', 'google_id']);
            $table->dropColumn(['password', 'google_id', 'avatar', 'email_verified_at', 'remember_token']);
        });
    }
};
