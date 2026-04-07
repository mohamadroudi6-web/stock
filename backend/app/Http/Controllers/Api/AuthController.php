<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        // Supprime les anciens tokens et crée un nouveau
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    /**
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
