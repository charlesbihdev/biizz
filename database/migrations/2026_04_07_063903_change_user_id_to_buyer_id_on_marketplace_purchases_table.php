<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('marketplace_purchases', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
            $table->renameColumn('user_id', 'buyer_id');
            $table->foreign('buyer_id')->references('id')->on('buyers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('marketplace_purchases', function (Blueprint $table): void {
            $table->dropForeign(['buyer_id']);
            $table->renameColumn('buyer_id', 'user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
