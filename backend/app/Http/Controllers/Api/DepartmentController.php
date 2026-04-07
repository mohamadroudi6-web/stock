<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $departments = Department::orderBy('name')->get();
        return response()->json($departments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'Département créé avec succès',
            'department' => $department
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department): JsonResponse
    {
        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return response()->json([
            'message' => 'Département mis à jour avec succès',
            'department' => $department
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json([
            'message' => 'Département supprimé avec succès'
        ]);
    }
}
