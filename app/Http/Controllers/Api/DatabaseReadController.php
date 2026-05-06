<?php

namespace App\Http\Controllers\Api;

use App\Services\DatabaseReadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class DatabaseReadController
{
    public function __construct(private readonly DatabaseReadService $databaseReadService)
    {
    }

    /**
     * Read all (paginated) rows for a whitelisted resource.
     */
    public function index(Request $request, string $resource): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 25);

        try {
            $paginator = $this->databaseReadService->paginate($resource, $perPage);
        } catch (InvalidArgumentException) {
            return response()->json(['message' => 'Unknown resource.'], 404);
        } catch (RuntimeException) {
            return response()->json(['message' => 'Resource table is not available.'], 404);
        }

        return response()->json($paginator);
    }
}
