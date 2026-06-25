<?php

namespace Database\Seeders;

use App\Models\Ship;
use App\Models\ShipTicketClass;
use Illuminate\Database\Seeder;

class ShipSeeder extends Seeder
{
    public function run(): void
    {
        $ship1 = Ship::create([
            'name' => 'KM. Bahari Express 1',
            'hull_number' => 'BE-001',
            'capacity' => 500,
            'ship_type' => 'passenger',
            'description' => 'Kapal cepat penumpang untuk rute antar pulau dengan fasilitas AC dan hiburan onboard.',
            'status' => 'active',
        ]);

        ShipTicketClass::create(['ship_id' => $ship1->id, 'ticket_class_id' => 1, 'seat_count' => 300, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship1->id, 'ticket_class_id' => 2, 'seat_count' => 100, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship1->id, 'ticket_class_id' => 3, 'seat_count' => null, 'bedroom_count' => 10]);
        ShipTicketClass::create(['ship_id' => $ship1->id, 'ticket_class_id' => 4, 'seat_count' => null, 'bedroom_count' => 5]);

        $ship2 = Ship::create([
            'name' => 'KM. Samudera Jaya',
            'hull_number' => 'SJ-002',
            'capacity' => 1200,
            'ship_type' => 'vehicle_ferry',
            'description' => 'Kapal feri besar untuk penyeberangan kendaraan roda dua, roda empat, dan bus.',
            'status' => 'active',
        ]);

        ShipTicketClass::create(['ship_id' => $ship2->id, 'ticket_class_id' => 1, 'seat_count' => 600, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship2->id, 'ticket_class_id' => 2, 'seat_count' => 200, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship2->id, 'ticket_class_id' => 3, 'seat_count' => null, 'bedroom_count' => 20]);
        ShipTicketClass::create(['ship_id' => $ship2->id, 'ticket_class_id' => 5, 'seat_count' => 200, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship2->id, 'ticket_class_id' => 6, 'seat_count' => 100, 'bedroom_count' => null]);

        $ship3 = Ship::create([
            'name' => 'KM. Nusantara Indah',
            'hull_number' => 'NI-003',
            'capacity' => 800,
            'ship_type' => 'passenger',
            'description' => 'Kapal penumpang kelas ekonomi dengan rute pelabuhan utama nusantara.',
            'status' => 'active',
        ]);

        ShipTicketClass::create(['ship_id' => $ship3->id, 'ticket_class_id' => 1, 'seat_count' => 500, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship3->id, 'ticket_class_id' => 2, 'seat_count' => 150, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship3->id, 'ticket_class_id' => 4, 'seat_count' => null, 'bedroom_count' => 8]);

        $ship4 = Ship::create([
            'name' => 'KM. Logistik Nusantara',
            'hull_number' => 'LN-004',
            'capacity' => 2000,
            'ship_type' => 'cargo',
            'description' => 'Kapal kargo untuk pengangkutan barang dan logistik antar pulau.',
            'status' => 'active',
        ]);

        ShipTicketClass::create(['ship_id' => $ship4->id, 'ticket_class_id' => 5, 'seat_count' => 300, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship4->id, 'ticket_class_id' => 6, 'seat_count' => 150, 'bedroom_count' => null]);

        $ship5 = Ship::create([
            'name' => 'KM. Wisata Bahari',
            'hull_number' => 'WB-005',
            'capacity' => 350,
            'ship_type' => 'passenger',
            'description' => 'Kapal wisata dengan fasilitas premium, kafe, dan dek observasi.',
            'status' => 'inactive',
        ]);

        ShipTicketClass::create(['ship_id' => $ship5->id, 'ticket_class_id' => 2, 'seat_count' => 80, 'bedroom_count' => null]);
        ShipTicketClass::create(['ship_id' => $ship5->id, 'ticket_class_id' => 3, 'seat_count' => null, 'bedroom_count' => 20]);
        ShipTicketClass::create(['ship_id' => $ship5->id, 'ticket_class_id' => 4, 'seat_count' => null, 'bedroom_count' => 10]);
    }
}
