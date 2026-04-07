<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product', 'user', 'supplier', 'department']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('product', function ($qb) use ($q) {
                $qb->where('name', 'like', "%$q%")
                   ->orWhere('sku', 'like', "%$q%");
            });
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }



        if ($request->filled('date_from')) {
            $query->whereDate('movement_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('movement_date', '<=', $request->date_to);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $movements = $query->orderByDesc('movement_date')
                           ->orderByDesc('id')
                           ->paginate($request->get('per_page', 10));

        return response()->json($movements);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'supplier_id'   => 'nullable|exists:suppliers,id',
            'department_id' => 'required_if:type,out|nullable|exists:departments,id',
            'type'          => 'required|in:in,out',
            'quantity'      => 'required|integer|min:1',
            'reason'        => 'nullable|string|max:255',
            'movement_date' => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        // Business rules
        if ($data['type'] === 'in') {
            $data['department_id'] = null;
            $data['client_id']     = null;
        }

        // Vérifie que le stock ne devient pas négatif pour une sortie
        if ($data['type'] === 'out') {
            $product      = Product::findOrFail($data['product_id']);
            $currentStock = $product->current_stock;

            if ($data['quantity'] > $currentStock) {
                return response()->json([
                    'message' => "Stock insuffisant. Stock disponible : {$currentStock}",
                    'errors'  => ['quantity' => ["La quantité demandée ({$data['quantity']}) dépasse le stock disponible ({$currentStock})."]],
                ], 422);
            }
        }

        // Pas de fournisseur pour une sortie
        if ($data['type'] === 'out') {
            $data['supplier_id'] = null;
        }

        $data['user_id'] = $request->user()->id;

        $movement = StockMovement::create($data);
        $movement->load(['product', 'user', 'supplier', 'department']);

        return response()->json($movement, 201);
    }

    public function show(StockMovement $stockMovement): JsonResponse
    {
        return response()->json($stockMovement->load(['product', 'user', 'supplier', 'department']));
    }

    // Résumé par produit
    public function summary(Request $request): JsonResponse
    {
        $productId = $request->product_id;

        $summary = DB::table('stock_movements')
            ->where('product_id', $productId)
            ->selectRaw('
                SUM(CASE WHEN type = "in"  THEN quantity ELSE 0 END) as total_in,
                SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as total_out,
                COUNT(*) as total_movements
            ')
            ->first();

        $summary->current_stock = $summary->total_in - $summary->total_out;

        return response()->json($summary);
    }
}
