<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Utilisateurs ──────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Admin Système',
            'email'    => 'admin@stock.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        $storekeeper = User::create([
            'name'     => 'Mohammed Alami',
            'email'    => 'magasinier@stock.com',
            'password' => Hash::make('password'),
            'role'     => 'storekeeper',
        ]);

        // ── Catégories ────────────────────────────────────────────────────
        $categories = collect([
            ['name' => 'Électronique',   'description' => 'Produits électroniques et informatiques'],
            ['name' => 'Bureautique',    'description' => 'Fournitures de bureau'],
            ['name' => 'Outillage',      'description' => 'Outils et équipements'],
            ['name' => 'Consommables',   'description' => 'Produits consommables'],
        ])->map(fn ($c) => Category::create($c));

        // ── Fournisseurs ──────────────────────────────────────────────────
        $suppliers = collect([
            ['name' => 'TechMaroc SARL',     'email' => 'contact@techmaroc.ma',   'phone' => '+212 522 111 222', 'city' => 'Casablanca'],
            ['name' => 'Bureau Plus',         'email' => 'info@bureauplus.ma',     'phone' => '+212 537 333 444', 'city' => 'Rabat'],
            ['name' => 'Outils & Co',         'email' => 'ventes@outilsco.ma',     'phone' => '+212 528 555 666', 'city' => 'Agadir'],
            ['name' => 'Global Supplies Ltd', 'email' => 'order@globalsupplies.com','phone' => '+1 555 123 456',  'city' => 'New York', 'country' => 'USA'],
        ])->map(fn ($s) => Supplier::create($s));

        // ── Produits ──────────────────────────────────────────────────────
        $products = [
            ['sku' => 'ELEC-001', 'name' => 'Imprimante HP LaserJet Pro', 'category_id' => $categories[0]->id, 'unit' => 'pcs', 'price' => 2500, 'min_qty' => 3],
            ['sku' => 'ELEC-002', 'name' => 'Switch Réseau 24 Ports',     'category_id' => $categories[0]->id, 'unit' => 'pcs', 'price' => 1800, 'min_qty' => 2],
            ['sku' => 'ELEC-003', 'name' => 'Câble RJ45 Cat6 (100m)',     'category_id' => $categories[0]->id, 'unit' => 'rouleau', 'price' => 350, 'min_qty' => 5],
            ['sku' => 'BURO-001', 'name' => 'Ramette Papier A4 80g',      'category_id' => $categories[1]->id, 'unit' => 'ramette', 'price' => 35,  'min_qty' => 20],
            ['sku' => 'BURO-002', 'name' => 'Stylo Bille Bleu (boîte)',   'category_id' => $categories[1]->id, 'unit' => 'boîte',  'price' => 25,  'min_qty' => 10],
            ['sku' => 'BURO-003', 'name' => 'Cartouche Encre Noire HP',   'category_id' => $categories[1]->id, 'unit' => 'pcs',    'price' => 180, 'min_qty' => 5],
            ['sku' => 'OUTI-001', 'name' => 'Tournevis Set Professionnel','category_id' => $categories[2]->id, 'unit' => 'set',    'price' => 450, 'min_qty' => 5],
            ['sku' => 'CONS-001', 'name' => 'Gel Hydroalcoolique 5L',     'category_id' => $categories[3]->id, 'unit' => 'bidon',  'price' => 120, 'min_qty' => 10],
        ];

        foreach ($products as $p) {
            Product::create($p);
        }

        $allProducts = Product::all();

        // ── Mouvements de stock ───────────────────────────────────────────
        // Entrées initiales
        foreach ($allProducts as $index => $product) {
            StockMovement::create([
                'product_id'    => $product->id,
                'user_id'       => $admin->id,
                'supplier_id'   => $suppliers[$index % 4]->id,
                'type'          => 'in',
                'quantity'      => rand(10, 50),
                'reason'        => 'Stock initial',
                'movement_date' => now()->subDays(30),
            ]);
        }

        // Sorties aléatoires
        foreach ($allProducts->take(5) as $product) {
            StockMovement::create([
                'product_id'    => $product->id,
                'user_id'       => $storekeeper->id,
                'type'          => 'out',
                'quantity'      => rand(1, 3),
                'reason'        => 'Utilisation interne',
                'movement_date' => now()->subDays(rand(1, 15)),
            ]);
        }

        // Quelques mouvements récents
        StockMovement::create([
            'product_id'    => $allProducts->first()->id,
            'user_id'       => $storekeeper->id,
            'supplier_id'   => $suppliers->first()->id,
            'type'          => 'in',
            'quantity'      => 5,
            'reason'        => 'Réapprovisionnement',
            'movement_date' => now()->subDays(2),
        ]);

        // ── Utilisateur Fournisseur (Test) ──────────────────────────────────
        User::create([
            'name'        => 'Responsable Global Supplies',
            'email'       => 'supplier@global.com',
            'password'    => Hash::make('password'),
            'role'        => 'supplier',
            'supplier_id' => $suppliers[3]->id, // Global Supplies Ltd
        ]);
    }
}
