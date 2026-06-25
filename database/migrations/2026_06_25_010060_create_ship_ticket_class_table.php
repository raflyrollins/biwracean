<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ship_ticket_class', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ship_id')->constrained('ships')->cascadeOnDelete();
            $table->foreignId('ticket_class_id')->constrained('ticket_classes')->cascadeOnDelete();
            $table->integer('seat_count')->nullable();
            $table->integer('bedroom_count')->nullable();
            $table->unique(['ship_id', 'ticket_class_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ship_ticket_class');
    }
};
