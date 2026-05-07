<?php

use App\Http\Controllers\Api\DatabaseReadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FaceBiometricsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['local.only'])->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/db/{resource}', [DatabaseReadController::class, 'index']);

    Route::post('/biometrics/face/enroll', [FaceBiometricsController::class, 'enroll']);
    Route::post('/biometrics/face/match', [FaceBiometricsController::class, 'match']);
});
