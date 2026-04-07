<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Gestion Stock
|--------------------------------------------------------------------------
*/

// ── Authentification (public) ──────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Routes protégées (Sanctum) ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Categories (lecture libre, écriture admin)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // Products (lecture libre, écriture admin)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/alerts/low-stock', [ProductController::class, 'alerts']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Suppliers (lecture libre, écriture admin)
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // Departments (lecture libre, écriture admin & storekeeper)
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::middleware('role:admin,storekeeper')->group(function () {
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::put('/departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);
    });

    // Users Management (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    });




    // Stock Movements (réservé aux gestionnaires)
    Route::middleware('role:admin,storekeeper')->group(function () {
        Route::get('/movements', [StockMovementController::class, 'index']);
        Route::post('/movements', [StockMovementController::class, 'store']);
        Route::get('/movements/summary', [StockMovementController::class, 'summary']);
        Route::get('/movements/{stockMovement}', [StockMovementController::class, 'show']);
    });

    // ── Portail Fournisseur ───────────────────────────────────────────────
    Route::middleware('role:supplier')->group(function () {
        Route::get('/supplier/me', [\App\Http\Controllers\Api\SupplierPortalController::class, 'me']);
        Route::get('/supplier/movements', [\App\Http\Controllers\Api\SupplierPortalController::class, 'movements']);
    });
});
