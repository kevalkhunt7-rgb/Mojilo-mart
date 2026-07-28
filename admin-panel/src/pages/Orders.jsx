import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  Eye, 
  RefreshCw,
  Clock,
  MoreVertical,
  CheckCircle,
  Truck,
  Printer,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CartItem3DViewer from '../components/CartItem3DViewer';

const getFullImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanBackendUrl = backendUrl.replace(/\/api$/, '');
  return url.startsWith('/') ? `${cleanBackendUrl}${url}` : `${cleanBackendUrl}/${url}`;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewModes, setPreviewModes] = useState({});

  const getLayerDetails = (customization) => {
    if (!customization) return [];
    
    // 1. Check if customization has populated layers from database Layer model
    if (Array.isArray(customization.layers) && customization.layers.length > 0) {
      return customization.layers.map((l, idx) => {
        const rawSrc = l.imageConfig?.src || l.imageConfig?.originalUrl || l.imageConfig?.processedUrl || l.src || l.url || l.originalSrc || null;
        return {
          id: l.layerId || l._id || idx,
          view: (l.printAreaName || 'Front').charAt(0).toUpperCase() + (l.printAreaName || 'Front').slice(1),
          type: l.type === 'Text' || l.type === 'text' ? 'Text' : 'Image/Graphic',
          text: l.textConfig?.text || null,
          fontFamily: l.textConfig?.fontFamily || null,
          fontWeight: l.textConfig?.fontWeight || null,
          fontStyle: l.textConfig?.fontStyle || null,
          fontSize: l.textConfig?.fontSize || null,
          color: l.textConfig?.fillColor || null,
          src: getFullImageUrl(rawSrc),
          widthInches: ((l.width || 100) / 50).toFixed(1),
          heightInches: ((l.height || 100) / 50).toFixed(1)
        };
      });
    }

    if (!customization) return [];
    const layers = [];
    let design = customization.editableDesignJSON;

    if (typeof design === 'string') {
      try { design = JSON.parse(design); } catch (e) { design = null; }
    }

    if (typeof design === 'object' && design !== null) {
      Object.keys(design).forEach(view => {
        const objects = Array.isArray(design[view])
          ? design[view]
          : (design[view]?.objects || []);

        objects.forEach((obj, idx) => {
          const w = (obj.width || 50) * (obj.scaleX || 1);
          const h = (obj.height || 50) * (obj.scaleY || 1);
          const wInches = (w / 50).toFixed(1);
          const hInches = (h / 50).toFixed(1);
          const rawSrc = obj.src || obj.originalSrc || obj.url || null;
          
          layers.push({
            id: obj.id || `${view}-${idx}`,
            view: view.charAt(0).toUpperCase() + view.slice(1),
            type: (obj.type === 'image' || obj.type === 'img') ? 'Image/Graphic' : 'Text',
            text: obj.text || null,
            fontFamily: obj.fontFamily || null,
            fontWeight: obj.fontWeight || (obj.bold ? 'bold' : null),
            fontStyle: obj.fontStyle || (obj.italic ? 'italic' : null),
            fontSize: obj.fontSize || null,
            color: obj.fill || null,
            src: getFullImageUrl(rawSrc),
            widthInches: wInches,
            heightInches: hInches
          });
        });
      });
    }

    if (layers.length === 0 && Array.isArray(customization.layers)) {
      customization.layers.forEach((l, idx) => {
        const w = (l.width || 50) * (l.scaleX || 1);
        const h = (l.height || 50) * (l.scaleY || 1);
        const wInches = (w / 50).toFixed(1);
        const hInches = (h / 50).toFixed(1);
        const rawSrc = l.imageConfig?.src || l.imageConfig?.processedUrl || l.imageConfig?.originalUrl || l.src || l.url || null;

        layers.push({
          id: l.layerId || l._id || `layer-${idx}`,
          view: (l.printAreaName || 'Front').charAt(0).toUpperCase() + (l.printAreaName || 'Front').slice(1),
          type: l.type || 'Image/Graphic',
          text: l.textConfig?.text || null,
          fontFamily: l.textConfig?.fontFamily || null,
          fontWeight: l.textConfig?.fontWeight || null,
          fontStyle: l.textConfig?.fontStyle || null,
          fontSize: l.textConfig?.fontSize || null,
          color: l.textConfig?.fillColor || null,
          src: getFullImageUrl(rawSrc),
          widthInches: wInches,
          heightInches: hInches
        });
      });
    }
    
    return layers;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders', { withCredentials: true });
      const raw = res.data?.data;
      const items = Array.isArray(raw) ? raw : (Array.isArray(raw?.orders) ? raw.orders : []);
      setOrders(items);
    } catch (err) {
      toast.error('Failed to load orders registry');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      setActiveMenuId(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  // Compile totals dynamically
  const getStatusCount = (statusName) => {
    return safeOrders.filter(o => o?.orderStatus?.toLowerCase() === statusName.toLowerCase()).length;
  };

  const statusSummaries = [
    { label: 'Delivered', count: getStatusCount('delivered') || getStatusCount('completed'), icon: CheckCircle, iconWrap: 'bg-emerald-50 text-emerald-600', dotBg: 'bg-emerald-500', labelColor: 'text-emerald-600' },
    { label: 'Shipped', count: getStatusCount('shipped'), icon: Truck, iconWrap: 'bg-indigo-50 text-indigo-600', dotBg: 'bg-indigo-500', labelColor: 'text-indigo-600' },
    { label: 'Printing', count: getStatusCount('printing'), icon: Printer, iconWrap: 'bg-amber-50 text-amber-600', dotBg: 'bg-amber-500', labelColor: 'text-amber-600' },
    { label: 'Pending', count: getStatusCount('pending'), icon: Clock, iconWrap: 'bg-slate-100 text-slate-500', dotBg: 'bg-slate-400', labelColor: 'text-slate-500' },
    { label: 'Refunded', count: getStatusCount('refunded'), icon: RotateCcw, iconWrap: 'bg-red-50 text-red-600', dotBg: 'bg-red-500', labelColor: 'text-red-600' },
  ];

  // Filtering
  const filteredOrders = safeOrders.filter((order) => {
    if (!order) return false;
    const query = searchQuery.toLowerCase();
    const orderIdMatches = order._id?.toLowerCase().includes(query) || order.orderNumber?.toLowerCase().includes(query);
    const customerMatches = order.user?.name?.toLowerCase().includes(query) || order.shippingAddress?.fullName?.toLowerCase().includes(query);
    return orderIdMatches || customerMatches;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return toast.info('No order data to export');
    const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Total Amount', 'Payment Status', 'Fulfillment Status'];
    const rows = orders.map(o => [
      o._id,
      o.user?.name || o.shippingAddress?.fullName || 'Guest',
      o.user?.email || 'N/A',
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
      o.totalAmount,
      o.paymentStatus,
      o.orderStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mojilo_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders database exported successfully!');
  };

  // Safe image download — works for blob:, data:, and https: URLs without fetch() errors
  const handleDownloadImage = (imageUrl, fileName = 'design.png') => {
    if (!imageUrl) return;
    const url = getFullImageUrl(imageUrl);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Safe image preview in new tab — avoids "Not allowed to load local resource" for blob: and data: URLs
  const handleOpenGraphicPreview = (imageUrl) => {
    if (!imageUrl) return;
    const url = getFullImageUrl(imageUrl);
    if (!url) return;

    if (url.startsWith('blob:') || url.startsWith('data:')) {
      // For local-scheme URLs: open blank window and inject <img> via document.write
      const newWin = window.open('');
      if (newWin) {
        newWin.document.write(`<!DOCTYPE html><html><head><title>Graphic Preview</title>
          <style>body{margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh}
          img{max-width:90vw;max-height:90vh;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,.5);border-radius:8px}</style>
          </head><body><img src="${url}" alt="Design Preview"/></body></html>`);
        newWin.document.close();
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusColorClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'printing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'refunded':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'packed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'qc check':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Shared dropdown menu used by both the desktop table row and the mobile card
  const StatusMenu = ({ order }) => (
    <div className="absolute right-0 mt-1 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5 animate-in fade-in duration-100 text-left">
      <p className="text-[9px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider border-b border-slate-100 mb-1">Set State</p>
      {['pending', 'printing', 'packed', 'qc check', 'shipped', 'delivered', 'refunded', 'cancelled'].map((st) => (
        <button
          key={st}
          onClick={() => handleUpdateStatus(order._id, st)}
          className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors uppercase"
        >
          {st}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-[1600px] mx-auto pb-12 px-3 sm:px-0">
      <ToastContainer />
      
      {/* --- TOP BAR TITLE & ACTIONS --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">Checkout Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} total orders recorded</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={fetchOrders}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-500"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white px-3 sm:px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 text-slate-700 transition-colors flex-1 sm:flex-none justify-center"
          >
            <Download size={14} className="text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- HORIZONTAL STATUS SUMMARY CARD BARS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {statusSummaries.map((summary, idx) => {
          const Icon = summary.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${summary.iconWrap}`}>
                <Icon size={16} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] leading-none font-mono">{summary.count}</h3>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${summary.dotBg}`} />
                  <span className={summary.labelColor}>{summary.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MAIN DATA CONTAINER PANEL --- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* --- TOOLBAR FILTERS --- */}
        <div className="p-4 flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by order ID, number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/10 text-[#0f172a] placeholder-[#94a3b8]"
            />
          </div>
        </div>

        {/* --- LOADING / EMPTY STATES --- */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm text-slate-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Search size={22} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm italic">No checkout records match filters</p>
          </div>
        ) : (
          <>
            {/* --- DESKTOP / TABLET TABLE (md and up) --- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40 border-b border-slate-100">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Items Count</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Payment</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-center">Fulfillment States Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Order ID */}
                      <td className="py-4 px-6 font-mono text-[11px] text-indigo-600 font-bold">
                        {order.orderNumber || order._id?.slice(-8).toUpperCase()}
                      </td>
                      
                      {/* Customer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shadow-sm uppercase shrink-0">
                            {order.user?.name ? order.user.name[0] : (order.shippingAddress?.fullName ? order.shippingAddress.fullName[0] : 'G')}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-700 block leading-none truncate">{order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">{order.user?.email || 'No email'}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Date */}
                      <td className="py-4 px-6 text-slate-400 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                      </td>
                      
                      {/* Items */}
                      <td className="py-4 px-6 text-slate-500 font-semibold">
                        {order.items?.length || 0} items
                      </td>
                      
                      {/* Amount */}
                      <td className="py-4 px-6 font-bold text-slate-800 font-mono">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      
                      {/* Payment status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {order.paymentStatus?.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Order status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColorClass(order.orderStatus)}`}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {order.orderStatus?.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Actions dropdown */}
                      <td className="py-4 px-6 text-center">
                        {/* position:relative lives on this div, not the <td> — table cells with
                            border-collapse don't reliably form a containing block for absolutely
                            positioned children in every browser, which lets the dropdown escape
                            the cell and anchor far to the right of the (wide, scrollable) table. */}
                        <div className="relative inline-block">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                              title="Inspect Order & Print Assets"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === order._id ? null : order._id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>

                          {activeMenuId === order._id && <StatusMenu order={order} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARD LIST (below md) --- */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shadow-sm uppercase shrink-0">
                        {order.user?.name ? order.user.name[0] : (order.shippingAddress?.fullName ? order.shippingAddress.fullName[0] : 'G')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700 text-xs truncate">{order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}</p>
                        <p className="text-[10px] font-mono text-indigo-600 font-bold">{order.orderNumber || order._id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                          title="Inspect Order & Print Assets"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === order._id ? null : order._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                      {activeMenuId === order._id && <StatusMenu order={order} />}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColorClass(order.orderStatus)}`}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {order.orderStatus?.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {order.paymentStatus?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold mb-0.5">Date</p>
                      <p className="text-slate-600 font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold mb-0.5">Items</p>
                      <p className="text-slate-600 font-semibold">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold mb-0.5">Amount</p>
                      <p className="text-slate-800 font-bold font-mono">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- ORDER INSPECTOR / PRINT ASSET DETAILED MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
                  <Printer className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="truncate">Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8).toUpperCase()} Inspector</span>
                </h2>
                <p className="text-[10px] text-slate-400">Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold transition-all cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              
              {/* Left Panel: Customer, Shipping, Timeline (4 cols) */}
              <div className="lg:col-span-4 space-y-5">
                {/* Customer Details */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Customer Details</h3>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'Guest'}</p>
                    <p className="text-slate-500">{selectedOrder.user?.email || 'No email provided'}</p>
                    <p className="text-slate-500">{selectedOrder.shippingAddress?.phone || 'No phone'}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Shipping Address</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed">
                    <p className="font-semibold">{selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.name}</p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Country: {selectedOrder.shippingAddress?.country || 'IN'}</p>
                  </div>
                </div>

                {/* Order Summary & Pricing */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pricing Summary</h3>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold">₹{selectedOrder.subTotal?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping:</span>
                      <span className="font-mono font-semibold">₹{selectedOrder.shippingCharges?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tax Amount (18%):</span>
                      <span className="font-mono font-semibold">₹{selectedOrder.taxAmount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="border-t border-slate-200/60 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-800 dark:text-slate-100 text-sm">
                      <span>Total Paid:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Order Items and Canvas Layer Inspector (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered Items & Printable Assets</h3>
                
                {selectedOrder.items?.map((item, itemIdx) => {
                  const layers = getLayerDetails(item.customization);
                  
                  return (
                    <div key={item._id || itemIdx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                      {/* Item Info Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.productName}</h4>
                          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">{item.variantDescription || `Size: ${item.size} / Color: ${item.color}`}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">₹{item.price} × {item.quantity}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Subtotal: ₹{item.price * item.quantity}</p>
                        </div>
                      </div>

                      {/* Display Customization details if they exist */}
                      {item.customization ? (
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-4">
                          <div className="flex flex-col md:flex-row gap-5">
                            
                            {/* Live Mockup / 3D Model Previews */}
                            <div className="w-full md:w-1/3 space-y-2">
                              {(() => {
                                const isCustomProduct = Boolean(
                                  item.isTemplate ||
                                  item.clothingType ||
                                  item.customization?.decalUrl ||
                                  item.customization?.previewUrl ||
                                  item.customization?.previews?.front ||
                                  (Array.isArray(item.customization?.layers) && item.customization?.layers.length > 0) ||
                                  item.customization?.editableDesignJSON
                                );

                                const displayProductImage =
                                  item.image ||
                                  item.imageUrl ||
                                  item.product?.images?.[0]?.url ||
                                  (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null) ||
                                  item.product?.image ||
                                  item.productVariant?.images?.[0]?.url ||
                                  item.customization?.previewUrl ||
                                  item.customization?.previews?.front ||
                                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';

                                return (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        {isCustomProduct ? "Live Customization Preview" : "Product Image"}
                                      </span>
                                      {isCustomProduct && (
                                        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                          <button
                                            onClick={() => setPreviewModes(prev => ({ ...prev, [item._id || itemIdx]: '3d' }))}
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                                              (previewModes[item._id || itemIdx] || '3d') === '3d'
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                            }`}
                                          >
                                            3D Model
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="aspect-square bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex items-center justify-center relative group min-h-[200px] sm:min-h-[220px]">
                                      {isCustomProduct && (previewModes[item._id || itemIdx] || '3d') === '3d' ? (
                                        <CartItem3DViewer item={item} />
                                      ) : (
                                        <img
                                          src={displayProductImage}
                                          alt={item.productName || "Product Preview"}
                                          crossOrigin="anonymous"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5-11 11"/></svg>';
                                          }}
                                          className="max-h-full max-w-full object-contain p-2"
                                        />
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                              
                              {/* ZIP / JSON Downloads */}
                              <div className="grid grid-cols-2 gap-2">
                                {/* <button
                                  onClick={() => {
                                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                                      JSON.stringify(item.customization.editableDesignJSON, null, 2)
                                    )}`;
                                    const dl = document.createElement("a");
                                    dl.setAttribute("href", jsonString);
                                    dl.setAttribute("download", `customization_layers_${item._id}.json`);
                                    dl.click();
                                  }}
                                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-750 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                  <Download size={10} /> JSON Config
                                </button> */}
                              
                              </div>
                            </div>

                            {/* Detailed Layers & Dimensions List */}
                            <div className="flex-1 space-y-2 min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Layer Geometry Dimensions (inches)</span>
                              
                              {layers.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No customizable layer coordinates registered.</p>
                              ) : (
                                <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-x-auto">
                                  <table className="w-full text-left text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 font-bold">
                                        <th className="py-2 px-3">Area</th>
                                        <th className="py-2 px-3">Type</th>
                                        <th className="py-2 px-3">Layer Detail</th>
                                        <th className="py-2 px-3 text-right">Print Size</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                                      {layers.map((layer) => (
                                        <tr key={layer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                          <td className="py-2 px-3 font-semibold text-slate-500 whitespace-nowrap">{layer.view}</td>
                                          <td className="py-2 px-3">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap ${
                                              layer.type === 'Text' 
                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' 
                                                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                            }`}>
                                              {layer.type}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3 max-w-[160px] sm:max-w-[220px]">
                                             {layer.type === 'Text' ? (
                                               <div className="flex flex-col gap-0.5">
                                                 <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block" title={layer.text}>"{layer.text}"</span>
                                                 <span className="text-[9px] text-slate-400">
                                                   Font: <span className="font-semibold text-slate-600 dark:text-slate-300">{layer.fontFamily || 'Default'}</span>
                                                   {layer.fontWeight && ` • ${layer.fontWeight}`}
                                                   {layer.fontStyle && ` • ${layer.fontStyle}`}
                                                   {layer.fontSize && ` • ${layer.fontSize}px`}
                                                 </span>
                                               </div>
                                             ) : (
                                               <div className="flex items-center gap-1.5">
                                                 {layer.src ? (
                                                   <>
                                                     <img 
                                                       src={layer.src} 
                                                       alt="thumbnail" 
                                                       crossOrigin="anonymous"
                                                       onClick={() => handleOpenGraphicPreview(layer.src)}
                                                       title="Click to view full preview"
                                                       onError={(e) => {
                                                         e.target.onerror = null;
                                                         e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5-11 11"/></svg>';
                                                       }}
                                                       className="w-6 h-6 object-contain rounded bg-slate-50 border border-slate-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                                                     />
                                                     <button
                                                       type="button"
                                                       onClick={() => handleDownloadImage(layer.src, `layer-${layer.id || 'graphic'}.png`)}
                                                       className="text-indigo-500 hover:underline text-[10px] font-bold bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
                                                     >
                                                       Download Graphic
                                                     </button>
                                                   </>
                                                 ) : (
                                                   <span className="italic text-slate-400">Custom Graphic</span>
                                                 )}
                                               </div>
                                             )}
                                           </td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                            {layer.widthInches}" × {layer.heightInches}"
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Team Roster / Bulk Order Table */}
                          {(item.customization?.isBulkRoster || (Array.isArray(item.customization?.roster) && item.customization.roster.length > 0)) && (
                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                  <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                                    Team Roster / Bulk Order Details ({item.customization.roster?.length || 0} Players)
                                  </h5>
                                </div>
                                <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Bulk Roster Order
                                </span>
                              </div>

                              <div className="border border-indigo-200/60 dark:border-indigo-800/60 rounded-lg overflow-x-auto bg-white dark:bg-slate-900">
                                <table className="w-full text-left text-[11px]">
                                  <thead>
                                    <tr className="bg-indigo-100/50 dark:bg-indigo-900/40 border-b border-indigo-200/60 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 font-bold">
                                      <th className="py-2 px-3">#</th>
                                      <th className="py-2 px-3">Player Name</th>
                                      <th className="py-2 px-3">Player Number</th>
                                      <th className="py-2 px-3 text-right">Size</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-indigo-100/40 dark:divide-indigo-900/30 text-slate-800 dark:text-slate-200 font-medium">
                                    {item.customization.roster?.map((player, pIdx) => (
                                      <tr key={pIdx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20">
                                        <td className="py-1.5 px-3 text-slate-400 font-mono text-[10px]">{pIdx + 1}</td>
                                        <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-100">
                                          {player.playerName || <span className="text-slate-400 italic">N/A</span>}
                                        </td>
                                        <td className="py-1.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                          {player.playerNumber ? `#${player.playerNumber}` : <span className="text-slate-400 font-normal italic">N/A</span>}
                                        </td>
                                        <td className="py-1.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                          <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px]">
                                            {player.size || item.size || 'M'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                          <p className="text-xs text-slate-400 italic">Standard Blank Garment (No Custom Print Required)</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}