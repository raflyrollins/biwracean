<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_availabilities', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('ticket_class_id')->constrained('ticket_classes')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('price', 12, 2);
            $table->integer('available_stock');
            $table->integer('sold_stock')->default(0);
            $table->unique(['route_id', 'ticket_class_id', 'date']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_availabilities');
    }
};
