<?php

namespace App\Http\Controllers\Api;

use App\Services\FaceRecognitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class FaceBiometricsController
{
    public function __construct(private readonly FaceRecognitionService $faceService)
    {
    }

    public function enroll(Request $request)
    {
        $validated = $request->validate([
            'person_id' => ['required', 'integer', 'min:1'],
            'image' => ['required', 'file', 'image', 'max:10240'],
            'source' => ['nullable', 'string', 'max:50'],
            'captured_at' => ['nullable', 'date'],
        ]);

        $personId = (int) $validated['person_id'];
        $personExists = DB::table('people')->where('id', $personId)->exists();
        if (! $personExists) {
            throw ValidationException::withMessages(['person_id' => 'Person not found.']);
        }

        $image = $request->file('image');
        if (! $image) {
            throw ValidationException::withMessages(['image' => 'Image file required.']);
        }

        try {
            $faces = $this->faceService->encode($image);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Face service unavailable. Start the Python service and ensure face_recognition is installed.',
                'error' => $e->getMessage(),
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }
        if (count($faces) === 0) {
            return response()->json([
                'message' => 'No face detected in the image.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $first = $faces[0];
        $encoding = $first['encoding'] ?? null;
        if (! is_array($encoding) || count($encoding) !== 128) {
            throw new RuntimeException('Face service returned an invalid encoding.');
        }

        $path = $image->store('private/biometrics/faces', ['disk' => 'local']);

        $id = DB::table('biometric_faces')->insertGetId([
            'person_id' => $personId,
            'image_path' => $path,
            'template' => json_encode($encoding, JSON_THROW_ON_ERROR),
            'template_version' => 'face_recognition_128_v1',
            'source' => $validated['source'] ?? 'upload',
            'captured_at' => $validated['captured_at'] ?? now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'id' => $id,
            'person_id' => $personId,
            'image_path' => $path,
            'template_version' => 'face_recognition_128_v1',
        ]);
    }

    public function match(Request $request)
    {
        $validated = $request->validate([
            'image' => ['required', 'file', 'image', 'max:10240'],
            'case_id' => ['nullable', 'integer', 'min:1'],
            'top_k' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $probe = $request->file('image');
        if (! $probe) {
            throw ValidationException::withMessages(['image' => 'Image file required.']);
        }

        $candidateRows = DB::table('biometric_faces')
            ->select(['id', 'person_id', 'template'])
            ->whereNotNull('template')
            ->orderByDesc('id')
            ->limit(500)
            ->get();

        $candidates = [];
        foreach ($candidateRows as $row) {
            $template = $row->template;

            // 'template' can be stored as JSON array or JSON object; normalize to 128-float array.
            $decoded = is_string($template) ? json_decode($template, true) : $template;
            if (is_array($decoded) && array_key_exists('encoding', $decoded)) {
                $decoded = $decoded['encoding'];
            }

            if (! is_array($decoded) || count($decoded) !== 128) {
                continue;
            }

            $candidates[] = [
                'person_id' => (int) $row->person_id,
                'face_id' => (int) $row->id,
                'template' => array_map('floatval', $decoded),
            ];
        }

        if (count($candidates) === 0) {
            return response()->json([
                'message' => 'No enrolled faces found. Enroll faces first using /api/biometrics/face/enroll.',
                'matches' => [],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $probePath = $probe->store('private/biometrics/probes', ['disk' => 'local']);

        try {
            $matches = $this->faceService->match($probe, $candidates);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Face service unavailable. Start the Python service and ensure face_recognition is installed.',
                'error' => $e->getMessage(),
                'matches' => [],
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $topK = (int) ($validated['top_k'] ?? 10);
        $caseId = isset($validated['case_id']) ? (int) $validated['case_id'] : null;

        $saved = [];
        foreach (array_slice($matches, 0, $topK) as $match) {
            $candidatePersonId = isset($match['person_id']) ? (int) $match['person_id'] : null;
            $confidence = isset($match['confidence']) ? (float) $match['confidence'] : null;

            $matchId = DB::table('biometric_matches')->insertGetId([
                'modality' => 'face',
                'case_id' => $caseId,
                'candidate_person_id' => $candidatePersonId,
                'created_by_user_id' => null,
                'probe_path' => $probePath,
                'confidence' => $confidence,
                'matched_at' => now(),
                'details' => json_encode([
                    'distance' => $match['distance'] ?? null,
                    'face_id' => $match['face_id'] ?? null,
                ], JSON_THROW_ON_ERROR),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $saved[] = ['match_id' => $matchId] + $match;
        }

        return response()->json([
            'probe_path' => $probePath,
            'matches' => $saved,
        ]);
    }
}
