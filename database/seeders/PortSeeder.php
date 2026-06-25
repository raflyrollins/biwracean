<?php

namespace Database\Seeders;

use App\Models\Port;
use Illuminate\Database\Seeder;

class PortSeeder extends Seeder
{
    public function run(): void
    {
        Port::create([
            'name' => 'Pelabuhan Tanjung Priok',
            'code' => 'TPK',
            'city' => 'Jakarta',
            'address' => 'Jl. Pelabuhan No. 1, Tanjung Priok, Jakarta Utara',
        ]);

        Port::create([
            'name' => 'Pelabuhan Tanjung Perak',
            'code' => 'TPR',
            'city' => 'Surabaya',
            'address' => 'Jl. Tanjung Perak Barat, Surabaya',
        ]);

        Port::create([
            'name' => 'Pelabuhan Belawan',
            'code' => 'BLW',
            'city' => 'Medan',
            'address' => 'Jl. Pelabuhan Belawan, Medan',
        ]);

        Port::create([
            'name' => 'Pelabuhan Makassar',
            'code' => 'MKS',
            'city' => 'Makassar',
            'address' => 'Jl. Pelabuhan Makassar, Sulawesi Selatan',
        ]);

        Port::create([
            'name' => 'Pelabuhan Benoa',
            'code' => 'BNO',
            'city' => 'Denpasar',
            'address' => 'Jl. Pelabuhan Benoa, Bali',
        ]);

        Port::create([
            'name' => 'Pelabuhan Batam Centre',
            'code' => 'BMC',
            'city' => 'Batam',
            'address' => 'Jl. Batam Centre, Batam, Kepulauan Riau',
        ]);
    }
}
