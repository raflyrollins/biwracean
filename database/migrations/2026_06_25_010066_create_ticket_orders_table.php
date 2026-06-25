<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('sailing_id')->constrained('sailings')->cascadeOnDelete();
            $table->foreignId('sailing_leg_id')->constrained('sailing_legs')->cascadeOnDelete();
            $table->foreignId('ticket_class_id')->constrained('ticket_classes')->cascadeOnDelete();
            $table->string('booking_code')->unique();
            $table->integer('quantity');
            $table->decimal('total_price', 12, 2);
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->enum('status', ['pending', 'paid', 'validated', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_orders');
    }
};
