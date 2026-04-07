<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Vérifie que l'utilisateur possède l'un des rôles autorisés.
     * Usage : middleware('role:admin') ou middleware('role:admin,storekeeper')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès interdit. Droits insuffisants.',
            ], 403);
        }

        return $next($request);
    }
}
