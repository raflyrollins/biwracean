<?php

namespace Database\Seeders;

use App\Models\TicketClass;
use Illuminate\Database\Seeder;

class TicketClassSeeder extends Seeder
{
    public function run(): void
    {
        TicketClass::create([
            'name' => 'Ekonomi',
            'code' => 'ECO',
            'type' => 'seat',
            'seat_count' => 200,
            'bedroom_count' => null,
            'description' => 'Kelas ekonomi dengan kursi ergonomis yang dapat direbahkan.',
            'facilities' => "AC\nTV Layar Lebar\nSnack Ringan\nToilet",
        ]);

        TicketClass::create([
            'name' => 'Bisnis',
            'code' => 'BIS',
            'type' => 'seat',
            'seat_count' => 80,
            'bedroom_count' => null,
            'description' => 'Kelas bisnis dengan kursi premium dan ruang kaki yang luas.',
            'facilities' => "AC\nTV Pribadi\nMakan Siang\nMinuman Gratis\nToilet\nColokan Listrik",
        ]);

        TicketClass::create([
            'name' => 'Eksekutif',
            'code' => 'EKS',
            'type' => 'cabin',
            'seat_count' => 2,
            'bedroom_count' => 1,
            'description' => 'Kabin eksekutif dengan tempat tidur dan fasilitas pribadi.',
            'facilities' => "AC\nTempat Tidur Queen\nTV Pribadi\nKamar Mandi Dalam\nMakan Siang & Malam\nMinuman Gratis\nWiFi",
        ]);

        TicketClass::create([
            'name' => 'VIP',
            'code' => 'VIP',
            'type' => 'cabin',
            'seat_count' => 4,
            'bedroom_count' => 2,
            'description' => 'Suite VIP dengan dua kamar tidur dan ruang tamu terpisah.',
            'facilities' => "AC\n2 Kamar Tidur\nRuang Tamu\nKamar Mandi Dalam\nTV 50 Inch\nMakan Siang & Malam\nMinuman Premium\nWiFi Cepat\nDedicated Concierge",
        ]);

        TicketClass::create([
            'name' => 'Kelas Kendaraan - Motor',
            'code' => 'MTR',
            'type' => 'seat',
            'seat_count' => null,
            'bedroom_count' => null,
            'description' => 'Tiket untuk kendaraan roda dua (motor, sepeda).',
            'facilities' => "Parkir Aman\nArea Terlindung",
        ]);

        TicketClass::create([
            'name' => 'Kelas Kendaraan - Mobil',
            'code' => 'MBL',
            'type' => 'seat',
            'seat_count' => null,
            'bedroom_count' => null,
            'description' => 'Tiket untuk kendaraan roda empat (mobil, SUV, pickup).',
            'facilities' => "Parkir Aman\nArea Terlindung\nCCTV 24 Jam",
        ]);
    }
}
