<?php

use App\Http\Controllers\Api\DatabaseReadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['local.only'])->group(function (): void {
    Route::get('/db/{resource}', [DatabaseReadController::class, 'index']);
});
