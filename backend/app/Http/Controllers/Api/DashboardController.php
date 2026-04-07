<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Statistiques globales
        $totalProducts  = Product::where('is_active', true)->count();
        $totalMovements = StockMovement::count();

        // Total entrées / sorties ce mois
        $monthIn = StockMovement::where('type', 'in')
            ->whereMonth('movement_date', now()->month)
            ->whereYear('movement_date', now()->year)
            ->sum('quantity');

        $monthOut = StockMovement::where('type', 'out')
            ->whereMonth('movement_date', now()->month)
            ->whereYear('movement_date', now()->year)
            ->sum('quantity');

        // Produits en alerte (stock <= min_qty)
        $lowStockProducts = Product::with('category')
            ->where('is_active', true)
            ->whereRaw('(
                SELECT COALESCE(SUM(CASE WHEN type="in" THEN quantity ELSE 0 END), 0)
                     - COALESCE(SUM(CASE WHEN type="out" THEN quantity ELSE 0 END), 0)
                FROM stock_movements
                WHERE stock_movements.product_id = products.id
            ) <= products.min_qty')
            ->get()
            ->map(function ($product) {
                $product->current_stock = $product->current_stock;
                return $product;
            });

        // 5 derniers mouvements
        $recentMovements = StockMovement::with(['product', 'user'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Graphique : mouvements des 30 derniers jours
        $chartData = StockMovement::selectRaw('DATE(movement_date) as date, type, SUM(quantity) as total')
            ->where('movement_date', '>=', now()->subDays(29))
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats' => [
                'total_products'  => $totalProducts,
                'total_movements' => $totalMovements,
                'monthly_in'      => (int) $monthIn,
                'monthly_out'     => (int) $monthOut,
                'low_stock'       => $lowStockProducts->count(),
            ],
            'low_stock_products' => $lowStockProducts,
            'recent_movements'   => $recentMovements,
            'chart_data'         => $chartData,
        ]);
    }
}
