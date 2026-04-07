<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%$q%")
                   ->orWhere('sku', 'like', "%$q%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filtre produits en alerte seulement
        if ($request->boolean('low_stock')) {
            $query->whereRaw('(
                SELECT COALESCE(SUM(CASE WHEN type="in" THEN quantity ELSE 0 END), 0)
                     - COALESCE(SUM(CASE WHEN type="out" THEN quantity ELSE 0 END), 0)
                FROM stock_movements
                WHERE stock_movements.product_id = products.id
            ) <= products.min_qty');
        }

        $products = $query->orderBy('name')
                          ->paginate($request->get('per_page', 10));


        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sku'         => 'required|string|max:50|unique:products,sku',
            'name'        => 'required|string|max:200',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'nullable|numeric|min:0',
            'min_qty'     => 'required|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $product = Product::create($data);
        $product->load('category');
        $product->current_stock = 0;

        return response()->json($product, 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');

        return response()->json($product);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'sku'         => 'required|string|max:50|unique:products,sku,' . $product->id,
            'name'        => 'required|string|max:200',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'nullable|numeric|min:0',
            'min_qty'     => 'required|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $product->update($data);
        $product->load('category');

        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete(); // SoftDelete

        return response()->json(['message' => 'Produit archivé.']);
    }

    public function alerts(): JsonResponse
    {
        $products = Product::with('category')
            ->where('is_active', true)
            ->whereRaw('(
                SELECT COALESCE(SUM(CASE WHEN type="in" THEN quantity ELSE 0 END), 0)
                     - COALESCE(SUM(CASE WHEN type="out" THEN quantity ELSE 0 END), 0)
                FROM stock_movements
                WHERE stock_movements.product_id = products.id
            ) <= products.min_qty')
            ->get();


        return response()->json([
            'success' => true,
            'data'    => $products,
            'message' => 'Produits en alerte de stock bas récupérés avec succès.'
        ]);
    }
}
