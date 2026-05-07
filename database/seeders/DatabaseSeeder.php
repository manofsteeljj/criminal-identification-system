<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! app()->environment('local')) {
            return;
        }

        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test Employee',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]
        );

        // ---- Domain seed data (stored in DB, safe for local demos) ----

        DB::table('people')->updateOrInsert(
            ['external_id' => 'P-0001'],
            [
                'first_name' => 'John',
                'middle_name' => null,
                'last_name' => 'Doe',
                'date_of_birth' => '1990-04-12',
                'sex' => 'M',
                'nationality' => 'Unknown',
                'national_id_number' => 'ID-0001',
                'phone' => null,
                'address' => '12 Market Street, District 4',
                'notes' => 'Seeded demo subject.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('people')->updateOrInsert(
            ['external_id' => 'P-0002'],
            [
                'first_name' => 'Maria',
                'middle_name' => null,
                'last_name' => 'Santos',
                'date_of_birth' => '1987-09-03',
                'sex' => 'F',
                'nationality' => 'Unknown',
                'national_id_number' => 'ID-0002',
                'phone' => null,
                'address' => '88 Riverside Ave',
                'notes' => 'Seeded demo subject.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $person1Id = (int) DB::table('people')->where('external_id', 'P-0001')->value('id');
        $person2Id = (int) DB::table('people')->where('external_id', 'P-0002')->value('id');

        DB::table('cases')->updateOrInsert(
            ['case_number' => 'CASE-2026-0001'],
            [
                'title' => 'Downtown Burglary Pattern',
                'status' => 'open',
                'summary' => 'Series of late-night commercial break-ins.',
                'assigned_officer_user_id' => $user->id,
                'opened_at' => now()->subDays(10),
                'closed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('cases')->updateOrInsert(
            ['case_number' => 'CASE-2026-0002'],
            [
                'title' => 'Warehouse Theft',
                'status' => 'open',
                'summary' => 'Inventory shrinkage investigation.',
                'assigned_officer_user_id' => $user->id,
                'opened_at' => now()->subDays(3),
                'closed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $case1Id = (int) DB::table('cases')->where('case_number', 'CASE-2026-0001')->value('id');
        $case2Id = (int) DB::table('cases')->where('case_number', 'CASE-2026-0002')->value('id');

        DB::table('case_person')->updateOrInsert(
            ['case_id' => $case1Id, 'person_id' => $person1Id, 'role' => 'suspect'],
            ['created_at' => now(), 'updated_at' => now()]
        );
        DB::table('case_person')->updateOrInsert(
            ['case_id' => $case2Id, 'person_id' => $person2Id, 'role' => 'suspect'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        DB::table('criminal_records')->updateOrInsert(
            ['record_number' => 'REC-0001'],
            [
                'person_id' => $person1Id,
                'status' => 'active',
                'risk_level' => 'medium',
                'charges_summary' => 'Breaking and entering; Possession of burglary tools',
                'convictions_summary' => '1 prior conviction',
                'last_updated_at' => now()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('criminal_records')->updateOrInsert(
            ['record_number' => 'REC-0002'],
            [
                'person_id' => $person2Id,
                'status' => 'active',
                'risk_level' => 'high',
                'charges_summary' => 'Theft; Receiving stolen property',
                'convictions_summary' => '0 prior convictions',
                'last_updated_at' => now()->subDays(2),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('incident_reports')->updateOrInsert(
            ['incident_number' => 'INC-2026-0101'],
            [
                'case_id' => $case1Id,
                'reported_by_user_id' => $user->id,
                'occurred_at' => now()->subDays(8),
                'location' => 'Downtown - 3rd Ave',
                'severity' => 'high',
                'description' => 'Forced entry reported; CCTV review pending.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('incident_reports')->updateOrInsert(
            ['incident_number' => 'INC-2026-0102'],
            [
                'case_id' => $case2Id,
                'reported_by_user_id' => $user->id,
                'occurred_at' => now()->subDays(2),
                'location' => 'Industrial Zone - Warehouse 12',
                'severity' => 'medium',
                'description' => 'Missing inventory discovered during audit.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Biometric match rows (used by dashboard results view). These are NOT computed from images yet;
        // they are stored DB rows that simulate prior match results.
        if (! DB::table('biometric_matches')->where('modality', 'face')->where('candidate_person_id', $person2Id)->exists()) {
            DB::table('biometric_matches')->insert([
                'modality' => 'face',
                'case_id' => $case1Id,
                'candidate_person_id' => $person2Id,
                'created_by_user_id' => $user->id,
                'probe_path' => null,
                'confidence' => 92.50,
                'matched_at' => now()->subHours(6),
                'details' => json_encode(['engine' => 'demo', 'note' => 'Seeded result']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (! DB::table('biometric_matches')->where('modality', 'fingerprint')->where('candidate_person_id', $person1Id)->exists()) {
            DB::table('biometric_matches')->insert([
                'modality' => 'fingerprint',
                'case_id' => $case2Id,
                'candidate_person_id' => $person1Id,
                'created_by_user_id' => $user->id,
                'probe_path' => null,
                'confidence' => 88.10,
                'matched_at' => now()->subHours(2),
                'details' => json_encode(['engine' => 'demo', 'note' => 'Seeded result']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
