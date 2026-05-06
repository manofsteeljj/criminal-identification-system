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
        Schema::create('criminal_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->string('record_number')->unique();
            $table->string('status')->default('active')->index();
            $table->string('risk_level')->nullable()->index();

            $table->text('charges_summary')->nullable();
            $table->text('convictions_summary')->nullable();
            $table->timestamp('last_updated_at')->nullable()->index();
            $table->timestamps();

            $table->index(['person_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criminal_records');
    }
};
