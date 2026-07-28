import inventoryService from '../services/inventoryService.js';
import Warehouse from '../models/Warehouse.js';
import Inventory from '../models/Inventory.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getWarehouses = asyncHandler(async (req, res) => {
  let warehouses = await Warehouse.find({});
  if (warehouses.length === 0) {
    // Seed a default warehouse so inventory features are fully functional
    const defaultWarehouse = await Warehouse.create({
      name: 'Main Warehouse',
      location: 'Central Distribution Center, NY',
      contactPhone: '123-456-7890',
      isActive: true
    });
    warehouses = [defaultWarehouse];
  }
  res.status(200).json(new ApiResponse(200, warehouses, 'Warehouses retrieved successfully'));
});

export const getWarehouseStock = asyncHandler(async (req, res) => {
  let { warehouseId } = req.query;
  
  if (!warehouseId) {
    let warehouses = await Warehouse.find({});
    if (warehouses.length === 0) {
      const defaultWarehouse = await Warehouse.create({
        name: 'Main Warehouse',
        location: 'Central Distribution Center, NY',
        contactPhone: '123-456-7890',
        isActive: true
      });
      warehouses = [defaultWarehouse];
    }
    warehouseId = warehouses[0]._id;
  }

  const stock = await inventoryService.getWarehouseStock(warehouseId);
  res.status(200).json(new ApiResponse(200, stock, 'Warehouse stock retrieved successfully'));
});

export const restockItems = asyncHandler(async (req, res) => {
  const { variantId, warehouseId, quantity, notes } = req.body;
  if (!variantId || !warehouseId || !quantity) {
    throw new ApiError(400, 'variantId, warehouseId, and quantity are required');
  }

  const result = await inventoryService.restockItems({
    variantId,
    warehouseId,
    quantity: Number(quantity),
    notes: notes || 'Admin Manual Restock'
  });

  res.status(200).json(new ApiResponse(200, result, 'Item restocked successfully'));
});

export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const alerts = await inventoryService.getLowStockAlerts();
  res.status(200).json(new ApiResponse(200, alerts, 'Low stock alerts retrieved successfully'));
});
