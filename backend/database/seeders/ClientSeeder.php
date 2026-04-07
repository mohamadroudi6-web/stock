<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Acme Corp',
                'email' => 'contact@acme.com',
                'phone' => '0123456789',
                'address' => '123 Business Rd, Metropolis',
            ],
            [
                'name' => 'Global Solutions',
                'email' => 'info@globalsolutions.io',
                'phone' => '0987654321',
                'address' => '456 Innovation Ln, Tech City',
            ],
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@email.fr',
                'phone' => '0612345678',
                'address' => '789 Rue de la Paix, Paris',
            ],
            [
                'name' => 'Marketing Pro',
                'email' => 'hello@marketingpro.net',
                'phone' => '0555443322',
                'address' => '321 Creative Way, Design District',
            ],
            [
                'name' => 'Tech Logistics',
                'email' => 'support@techlogistics.com',
                'phone' => '0777889900',
                'address' => '159 Freight Ave, Port City',
            ],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }
    }
}
