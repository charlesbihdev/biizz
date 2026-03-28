<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('order_id', 20)->nullable()->unique()->after('id');
        });

        // Backfill existing rows with random codes
        $orders = DB::table('orders')->whereNull('order_id')->get(['id']);

        foreach ($orders as $order) {
            DB::table('orders')
                ->where('id', $order->id)
                ->update(['order_id' => strtoupper(Str::random(10))]);
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn('order_id');
        });
    }
};
