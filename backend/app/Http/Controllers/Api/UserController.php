<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (Admin only)
     */
    public function index(): JsonResponse
    {
        $users = User::with('supplier')->orderBy('name')->get();
        return response()->json($users);
    }

    /**
     * Créer un utilisateur (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users',
            'password'    => 'required|string|min:8',
            'role'        => ['required', Rule::in(['admin', 'storekeeper', 'supplier'])],
            'supplier_id' => 'nullable|required_if:role,supplier|exists:suppliers,id',
            'is_active'   => 'boolean',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        return response()->json($user->load('supplier'), 201);
    }

    /**
     * Afficher un utilisateur
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('supplier'));
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password'    => 'nullable|string|min:8',
            'role'        => ['sometimes', Rule::in(['admin', 'storekeeper', 'supplier'])],
            'supplier_id' => 'nullable|required_if:role,supplier|exists:suppliers,id',
            'is_active'   => 'boolean',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        return response()->json($user->load('supplier'));
    }

    /**
     * Supprimer (ou désactiver) un utilisateur
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
