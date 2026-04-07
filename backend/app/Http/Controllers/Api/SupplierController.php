<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $suppliers = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return response()->json($suppliers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:150',
            'email'   => 'nullable|email|unique:suppliers,email',
            'phone'   => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'city'    => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes'   => 'nullable|string',
        ]);

        $supplier = Supplier::create($data);

        return response()->json($supplier, 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json($supplier);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'email'     => 'nullable|email|unique:suppliers,email,' . $supplier->id,
            'phone'     => 'nullable|string|max:30',
            'address'   => 'nullable|string|max:255',
            'city'      => 'nullable|string|max:100',
            'country'   => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string',
        ]);

        $supplier->update($data);

        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete(); // SoftDelete

        return response()->json(['message' => 'Fournisseur archivé.']);
    }
}
