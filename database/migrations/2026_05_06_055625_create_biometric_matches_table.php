<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('biometric_matches', function (Blueprint $table) {
            $table->id();
            $table->string('modality')->index();
            $table->foreignId('case_id')->nullable()->constrained('cases')->nullOnDelete();
            $table->foreignId('candidate_person_id')->nullable()->constrained('people')->nullOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('probe_path')->nullable();
            $table->decimal('confidence', 5, 2)->nullable()->index();
            $table->timestamp('matched_at')->nullable()->index();

            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['modality', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biometric_matches');
    }
};
