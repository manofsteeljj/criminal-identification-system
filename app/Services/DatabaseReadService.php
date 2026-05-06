<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;
use RuntimeException;

class DatabaseReadService
{
    /**
     * Paginate a safe, whitelisted dataset.
     */
    public function paginate(string $resource, int $perPage = 25): LengthAwarePaginator
    {
        $resources = $this->resources();

        if (! array_key_exists($resource, $resources)) {
            throw new InvalidArgumentException('Unknown resource.');
        }

        $definition = $resources[$resource];
        $table = $definition['table'];

        if (! Schema::hasTable($table)) {
            throw new RuntimeException('Table does not exist.');
        }

        $perPage = max(1, min(100, $perPage));

        $query = DB::table($table)->select($definition['columns']);

        foreach (($definition['orderBy'] ?? []) as $order) {
            $query->orderBy($order['column'], $order['direction']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Whitelisted readable resources.
     *
     * NOTE: Intentionally excludes sensitive columns like passwords, tokens, cache values, and job payloads.
     */
    private function resources(): array
    {
        return [
            'people' => [
                'table' => 'people',
                'columns' => [
                    'id',
                    'external_id',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'date_of_birth',
                    'sex',
                    'nationality',
                    'national_id_number',
                    'phone',
                    'address',
                    'notes',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'cases' => [
                'table' => 'cases',
                'columns' => [
                    'id',
                    'case_number',
                    'title',
                    'status',
                    'summary',
                    'assigned_officer_user_id',
                    'opened_at',
                    'closed_at',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'case-person' => [
                'table' => 'case_person',
                'columns' => ['id', 'case_id', 'person_id', 'role', 'created_at', 'updated_at'],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'criminal-records' => [
                'table' => 'criminal_records',
                'columns' => [
                    'id',
                    'person_id',
                    'record_number',
                    'status',
                    'risk_level',
                    'charges_summary',
                    'convictions_summary',
                    'last_updated_at',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'incident-reports' => [
                'table' => 'incident_reports',
                'columns' => [
                    'id',
                    'incident_number',
                    'case_id',
                    'reported_by_user_id',
                    'occurred_at',
                    'location',
                    'severity',
                    'description',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'biometric-matches' => [
                'table' => 'biometric_matches',
                'columns' => [
                    'id',
                    'modality',
                    'case_id',
                    'candidate_person_id',
                    'created_by_user_id',
                    'probe_path',
                    'confidence',
                    'matched_at',
                    'details',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'confidence', 'direction' => 'desc'],
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'evidence-files' => [
                'table' => 'evidence_files',
                'columns' => [
                    'id',

                    'case_id',
                    'incident_report_id',
                    'person_id',
                    'uploaded_by_user_id',

                    'file_path',
                    'mime_type',
                    'size_bytes',
                    'sha256',
                    'metadata',
                    'captured_at',
                    'created_at',
                    'updated_at',
                ],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'users' => [
                'table' => 'users',
                'columns' => ['id', 'name', 'email', 'email_verified_at', 'created_at', 'updated_at'],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'sessions' => [
                'table' => 'sessions',
                'columns' => ['id', 'user_id', 'ip_address', 'user_agent', 'last_activity'],
                'orderBy' => [
                    ['column' => 'last_activity', 'direction' => 'desc'],
                ],
            ],
            'jobs' => [
                'table' => 'jobs',
                'columns' => ['id', 'queue', 'attempts', 'reserved_at', 'available_at', 'created_at'],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'failed-jobs' => [
                'table' => 'failed_jobs',
                'columns' => ['id', 'uuid', 'connection', 'queue', 'failed_at'],
                'orderBy' => [
                    ['column' => 'id', 'direction' => 'desc'],
                ],
            ],
            'job-batches' => [
                'table' => 'job_batches',
                'columns' => ['id', 'name', 'total_jobs', 'pending_jobs', 'failed_jobs', 'created_at', 'finished_at'],
                'orderBy' => [
                    ['column' => 'created_at', 'direction' => 'desc'],
                ],
            ],
            'cache-keys' => [
                'table' => 'cache',
                'columns' => ['key', 'expiration'],
                'orderBy' => [
                    ['column' => 'expiration', 'direction' => 'desc'],
                ],
            ],
            'cache-locks' => [
                'table' => 'cache_locks',
                'columns' => ['key', 'owner', 'expiration'],
                'orderBy' => [
                    ['column' => 'expiration', 'direction' => 'desc'],
                ],
            ],
            'password-resets' => [
                'table' => 'password_reset_tokens',
                'columns' => ['email', 'created_at'],
                'orderBy' => [
                    ['column' => 'created_at', 'direction' => 'desc'],
                ],
            ],
        ];
    }
}
