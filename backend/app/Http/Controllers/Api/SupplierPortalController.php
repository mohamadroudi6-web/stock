<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierPortalController extends Controller
{
    /**
     * Récupérer les informations du profil fournisseur lié à l'utilisateur
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('supplier'));
    }

    /**
     * Récupérer les mouvements de stock liés au fournisseur (uniquement les entrées "in")
     */
    public function movements(Request $request): JsonResponse
    {
        $supplierId = $request->user()->supplier_id;

        if (!$supplierId) {
            return response()->json(['message' => 'L\'utilisateur n\'est rattaché à aucun fournisseur.'], 403);
        }

        $movements = StockMovement::with(['product'])
            ->where('supplier_id', $supplierId)
            ->where('type', 'in')
            // Optionnel : on peut filtrer par produit si besoin via $request->product_id
            ->orderByDesc('movement_date')
            ->paginate($request->get('per_page', 15));

        return response()->json($movements);
    }
}
