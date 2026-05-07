<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FaceRecognitionService
{
    public function health(): bool
    {
        $response = Http::timeout($this->timeoutSeconds())
            ->acceptJson()
            ->get($this->baseUrl().'/health');

        return $response->ok() && ($response->json('ok') === true);
    }

    /**
     * @return array<int, array{box: array<string,int>, encoding: array<int,float>}>
     */
    public function encode(UploadedFile $image): array
    {
        $response = Http::timeout($this->timeoutSeconds())
            ->acceptJson()
            ->attach('image', fopen($image->getRealPath(), 'r'), $image->getClientOriginalName())
            ->post($this->baseUrl().'/encode');

        if (! $response->ok()) {
            throw new RuntimeException($response->json('error') ?? 'Face service encode failed.');
        }

        $faces = $response->json('faces');
        if (! is_array($faces)) {
            return [];
        }

        return $faces;
    }

    /**
     * @param array<int, array{person_id:int, face_id:int|null, template: array<int,float>}> $candidates
     * @return array<int, array{person_id:int|null, face_id:int|null, distance:float, confidence:float}>
     */
    public function match(UploadedFile $probeImage, array $candidates): array
    {
        $candidatesJson = json_encode($candidates, JSON_THROW_ON_ERROR);

        $response = Http::timeout($this->timeoutSeconds())
            ->acceptJson()
            ->attach('image', fopen($probeImage->getRealPath(), 'r'), $probeImage->getClientOriginalName())
            ->post($this->baseUrl().'/match', [
                'candidates' => $candidatesJson,
            ]);

        if (! $response->ok()) {
            throw new RuntimeException($response->json('error') ?? 'Face service match failed.');
        }

        $matches = $response->json('matches');
        if (! is_array($matches)) {
            return [];
        }

        return $matches;
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.face_service.base_url'), '/');
    }

    private function timeoutSeconds(): int
    {
        $timeout = (int) config('services.face_service.timeout');
        return max(1, min(120, $timeout));
    }
}
