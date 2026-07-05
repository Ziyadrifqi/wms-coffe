<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\MasterData\MaterialController;
use App\Http\Controllers\Api\V1\MasterData\SupplierController;
use App\Http\Controllers\Api\V1\MasterData\WarehouseController;
use App\Http\Controllers\Api\V1\MasterData\UnitController;
use App\Http\Controllers\Api\V1\MasterData\CategoryController;
use App\Http\Controllers\Api\V1\Procurement\GoodsReceiptController;
use App\Http\Controllers\Api\V1\Procurement\PurchaseOrderController;
use App\Http\Controllers\Api\V1\Production\ProductionRequestController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::prefix('master-data')->group(function () {
            Route::apiResource('suppliers', SupplierController::class);
            Route::apiResource('warehouses', WarehouseController::class);
            Route::apiResource('materials', MaterialController::class);

            Route::get('categories', [CategoryController::class, 'index']);
            Route::get('units', [UnitController::class, 'index']);
        });

        Route::prefix('procurement')->group(function () {
            Route::apiResource('purchase-orders', PurchaseOrderController::class)->except(['destroy']);
            Route::post('purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
            Route::post('purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
            Route::post('purchase-orders/{purchaseOrder}/reject', [PurchaseOrderController::class, 'reject']);

            Route::apiResource('goods-receipts', GoodsReceiptController::class)->only(['index', 'store', 'show']);
        });

        Route::prefix('production')->group(function () {
            Route::apiResource('requests', ProductionRequestController::class)->except(['destroy', 'update']);
            Route::post('requests/{productionRequest}/approve', [ProductionRequestController::class, 'approve']);
            Route::post('requests/{productionRequest}/reject', [ProductionRequestController::class, 'reject']);
            Route::post('requests/{productionRequest}/fulfill', [ProductionRequestController::class, 'fulfill']);
        });
    });
});
