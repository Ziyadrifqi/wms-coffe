<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\User\UserManagementController;
use App\Http\Controllers\Api\V1\MasterData\MaterialController;
use App\Http\Controllers\Api\V1\MasterData\SupplierController;
use App\Http\Controllers\Api\V1\MasterData\WarehouseController;
use App\Http\Controllers\Api\V1\MasterData\UnitController;
use App\Http\Controllers\Api\V1\MasterData\CategoryController;
use App\Http\Controllers\Api\V1\Procurement\GoodsReceiptController;
use App\Http\Controllers\Api\V1\Procurement\PurchaseOrderController;
use App\Http\Controllers\Api\V1\Production\ProductionRequestController;
use App\Http\Controllers\Api\V1\Inventory\StockOpnameController;
use App\Http\Controllers\Api\V1\Report\DashboardController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/change-password', [AuthController::class, 'changePassword']);

        Route::prefix('settings')->group(function () {
            Route::get('roles', [UserManagementController::class, 'roles']);
            Route::apiResource('users', UserManagementController::class)
                ->parameters(['users' => 'user'])
                ->except(['destroy']);
        });

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
            Route::apiResource('requests', ProductionRequestController::class)
                ->parameters(['requests' => 'production_request'])
                ->except(['destroy', 'update']);
            Route::post('requests/{productionRequest}/approve', [ProductionRequestController::class, 'approve']);
            Route::post('requests/{productionRequest}/reject', [ProductionRequestController::class, 'reject']);
            Route::post('requests/{productionRequest}/fulfill', [ProductionRequestController::class, 'fulfill']);
        });

        Route::prefix('inventory')->group(function () {
            Route::apiResource('stock-opnames', StockOpnameController::class)
                ->parameters(['stock-opnames' => 'stock_opname'])
                ->except(['destroy', 'update']);

            Route::put('stock-opnames/{stockOpname}/items', [StockOpnameController::class, 'updateItems']);
            Route::post('stock-opnames/{stockOpname}/complete', [StockOpnameController::class, 'complete']);
        });

        Route::prefix('dashboard')->group(function () {
            Route::get('kpis', [DashboardController::class, 'kpis']);
            Route::get('stock-trend', [DashboardController::class, 'stockTrend']);
            Route::get('low-stock', [DashboardController::class, 'lowStock']);
            Route::get('expiring-stock', [DashboardController::class, 'expiringStock']);
            Route::get('recent-activity', [DashboardController::class, 'recentActivity']);
        });
    });
});
