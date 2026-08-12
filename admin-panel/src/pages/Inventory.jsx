import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Warehouse as WarehouseIcon, AlertTriangle, CheckCircle, Package, RefreshCcw, Landmark } from 'lucide-react';

const Inventory = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [stockList, setStockList] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    variantId: '',
    warehouseId: '',
    quantity: '',
    notes: '',
  });

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/inventory/warehouses');
      const list = res.data?.data || [];
      setWarehouses(list);
      if (list.length > 0) {
        setSelectedWarehouse(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch warehouses', err);
    }
  };

  const fetchStock = async (warehouseId) => {
    if (!warehouseId) return;
    setLoadingStock(true);
    try {
      const res = await api.get(`/inventory/stock?warehouseId=${warehouseId}`);
      setStockList(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load warehouse stock levels');
    } finally {
      setLoadingStock(false);
    }
  };

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await api.get('/inventory/alerts');
      setAlerts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load low-stock alerts', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStock(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      warehouseId: formData.warehouseId || selectedWarehouse,
      quantity: Number(formData.quantity)
    };

    try {
      await api.post('/inventory/restock', payload);
      toast.success('Inventory restocked successfully!');
      setIsRestockModalOpen(false);
      
      // Reset form
      setFormData({
        variantId: '',
        warehouseId: '',
        quantity: '',
        notes: '',
      });

      // Refresh
      fetchStock(selectedWarehouse);
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock quantity');
    }
  };

  const openRestockWithVariant = (variantId) => {
    setFormData({
      variantId,
      warehouseId: selectedWarehouse,
      quantity: '',
      notes: 'Admin Quick Adjust',
    });
    setIsRestockModalOpen(true);
  };

  // Search Logic
  const filteredStock = stockList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const prodName = item.variant?.product?.name || item.variant?.product?.title || '';
    const variantId = item.variant?._id || '';
    return prodName.toLowerCase().includes(term) || variantId.includes(term);
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Inventory & Warehouses</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Adjust variant stock levels, configure multi-warehousing, and inspect restock histories.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
         

          <button
            onClick={() => {
              setFormData({ variantId: '', warehouseId: selectedWarehouse, quantity: '', notes: '' });
              setIsRestockModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 active:scale-98"
          >
            <Plus size={16} /> Restock Item
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Cards */}
      {alerts.length > 0 && (
        <div className="bg-red-50/50 border border-red-200/60 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start justify-between shadow-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-sm">Critical Inventory Alert</h3>
              <p className="text-red-700 text-xs mt-0.5">
                We detected <strong>{alerts.length}</strong> items that have fallen below their recommended low stock warning levels.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
            {alerts.slice(0, 3).map((a, idx) => (
              <div key={idx} className="bg-white border border-red-100 rounded-xl p-2.5 text-[11px] min-w-[200px] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-slate-50 border overflow-hidden shrink-0 flex items-center justify-center">
                  {a.variant?.product?.images?.[0]?.url ? (
                    <img src={a.variant.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={14} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{a.variant?.product?.name || 'Item'}</p>
                  <p className="text-red-600 font-bold mt-0.5">Stock: {a.quantity} left</p>
                </div>
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-2 text-xs font-semibold text-red-800 flex items-center justify-center">
                +{alerts.length - 3} More
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Stock Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f1f5f9] flex justify-between items-center">
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by product name, variant ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs outline-none focus:border-[#4f46e5] focus:bg-white"
            />
          </div>
          <button 
            onClick={() => fetchStock(selectedWarehouse)} 
            className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500 transition-colors"
          >
            <RefreshCcw size={13} className={loadingStock ? 'animate-spin' : ''} />
          </button>
        </div>

        {loadingStock ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Calculating stock indices...</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No items in this warehouse.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Product Variant</th>
                  <th className="py-3 px-6">Attributes</th>
                  <th className="py-3 px-6">Current Stock</th>
                  <th className="py-3 px-6">Status Badge</th>
                  <th className="py-3 px-6 text-center">Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {filteredStock.map((item) => {
                  const variant = item.variant;
                  const isLow = item.quantity <= (item.lowStockThreshold || 10);
                  const isOut = item.quantity <= 0;

                  return (
                    <tr key={item._id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                            {variant?.product?.images?.[0]?.url ? (
                              <img src={variant.product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {variant?.product?.name || variant?.product?.title || 'Blank Blank'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">VAR_ID: {variant?._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {variant?.attributes && variant.attributes.length > 0 ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {variant.attributes.map((attr, index) => (
                              <span key={index} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-450 italic text-xs">No attributes</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {item.quantity} units
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isOut 
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : isLow
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock Alert' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openRestockWithVariant(variant?._id)}
                          className="bg-slate-50 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-indigo-50 active:scale-95"
                          title="Restock Variant"
                          disabled={!variant?._id}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <WarehouseIcon size={18} className="text-indigo-600" />
                <h3 className="font-bold text-lg text-[#0f172a]">Warehouse Restocking</h3>
              </div>
              <button 
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Product Variant ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 64b85c13e512401f8087ab9e"
                  value={formData.variantId}
                  onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-mono text-slate-800 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Target Warehouse</label>
                  <select
                    value={formData.warehouseId || selectedWarehouse}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Restock Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Restock Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Bulk factory shipment, replacement units"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-850 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Save Stock Levels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
