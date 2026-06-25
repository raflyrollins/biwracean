<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sailing_legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sailing_id')->constrained('sailings')->cascadeOnDelete();
            $table->foreignId('origin_port_id')->constrained('ports')->cascadeOnDelete();
            $table->foreignId('destination_port_id')->constrained('ports')->cascadeOnDelete();
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete();
            $table->unsignedTinyInteger('leg_order');
            $table->time('departure_time')->nullable();
            $table->time('arrival_time')->nullable();
            $table->unique(['sailing_id', 'leg_order']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sailing_legs');
    }
};
