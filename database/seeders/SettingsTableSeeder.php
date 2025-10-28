<?php

namespace Database\Seeders;

use App\Models\PaymentType;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (PaymentType::all() as $model) {
            $setting = new Setting(['price' => 10.0]);
            $setting->payment_type_id = $model->id;
            $setting->save();
        }
    }
}
