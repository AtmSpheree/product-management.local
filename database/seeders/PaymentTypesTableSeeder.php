<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('payment_types')->insert([
            ['name' => 'default', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'not_own_shift', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
