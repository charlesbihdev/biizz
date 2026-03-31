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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_address')->nullable()->after('customer_phone');
            $table->string('delivery_city')->nullable()->after('delivery_address');
            $table->string('delivery_region')->nullable()->after('delivery_city');
            $table->string('delivery_country')->nullable()->after('delivery_region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_address',
                'delivery_city',
                'delivery_region',
                'delivery_country',
            ]);
        });
    }
};
