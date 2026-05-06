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
        Schema::create('biometric_fingerprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();

            $table->string('finger')->nullable()->index();
            $table->string('image_path')->nullable();
            $table->json('template')->nullable();
            $table->string('template_version')->nullable();
            $table->string('source')->nullable()->index();

            $table->timestamp('captured_at')->nullable()->index();
            $table->timestamps();

            $table->index(['person_id', 'captured_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biometric_fingerprints');
    }
};
