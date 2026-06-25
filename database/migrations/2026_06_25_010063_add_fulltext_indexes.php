<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE ships ADD FULLTEXT INDEX ships_search_fulltext (name, hull_number, description)');
        DB::statement('ALTER TABLE ports ADD FULLTEXT INDEX ports_search_fulltext (name, code, city, address)');
        DB::statement('ALTER TABLE ticket_classes ADD FULLTEXT INDEX ticket_classes_search_fulltext (name, code, description)');
        DB::statement('ALTER TABLE sailings ADD FULLTEXT INDEX sailings_search_fulltext (name)');
        DB::statement('ALTER TABLE users ADD FULLTEXT INDEX users_search_fulltext (name, email)');
    }

    public function down(): void
    {
        Schema::table('ships', function (Blueprint $table) {
            $table->dropIndex('ships_search_fulltext');
        });
        Schema::table('ports', function (Blueprint $table) {
            $table->dropIndex('ports_search_fulltext');
        });
        Schema::table('ticket_classes', function (Blueprint $table) {
            $table->dropIndex('ticket_classes_search_fulltext');
        });
        Schema::table('sailings', function (Blueprint $table) {
            $table->dropIndex('sailings_search_fulltext');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_search_fulltext');
        });
    }
};
