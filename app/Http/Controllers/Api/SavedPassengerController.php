<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedPassenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedPassengerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $passengers = $request->user()->savedPassengers()
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $passengers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'required|string|max:20',
            'gender' => 'required|string|in:L,P',
            'date_of_birth' => 'required|date',
        ]);

        $passenger = $request->user()->savedPassengers()->create($validated);

        return response()->json(['data' => $passenger], 201);
    }

    public function destroy(Request $request, SavedPassenger $savedPassenger): JsonResponse
    {
        if ($savedPassenger->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $savedPassenger->delete();

        return response()->json(['message' => 'Saved passenger deleted.']);
    }
}
