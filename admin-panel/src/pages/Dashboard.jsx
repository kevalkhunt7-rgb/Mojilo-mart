import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {

  ShoppingCart,
  Users,
  Package,
  Clock,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  IndianRupee
} from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('2026');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/dashboard', { withCredentials: true });
      setData(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to retrieve dashboard analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Compiling real-time dashboard analytics...</p>
      </div>
    );
  }

  // Aggregate stats
  const topStats = [
    {
      title: 'TOTAL REVENUE',
      value: `₹${(data.revenue || 0).toLocaleString('en-IN')}`,
      trend: 'Live calculations',
      icon: IndianRupee,
      bgIcon: 'bg-indigo-600'
    },
    {
      title: 'TOTAL ORDERS',
      value: String(data.totalOrders || 0),
      trend: 'Completed checkouts',
      icon: ShoppingCart,
      bgIcon: 'bg-purple-600'
    },
    {
      title: 'CUSTOMERS',
      value: String(data.totalCustomers || 0),
      trend: 'Registered customer profiles',
      icon: Users,
      bgIcon: 'bg-blue-600'
    },
    {
      title: 'PRODUCTS',
      value: String(data.totalProducts || 0),
      trend: 'Active catalog items',
      icon: Package,
      bgIcon: 'bg-teal-600'
    },
  ];

  const subStats = [
    {
      title: 'LOW STOCK WARNINGS',
      value: String(data.lowStockCount || 0),
      footer: 'Variants below threshold limit',
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      bgIcon: 'bg-orange-100'
    },
    {
      title: 'TOTAL CATALOG PRODUCTS',
      value: String(data.totalProducts || 0),
      footer: 'Active designable blanks',
      icon: Package,
      iconColor: 'text-teal-600',
      bgIcon: 'bg-teal-100'
    }
  ];

  // Process monthly timeline data for SVG chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyValues = Array(12).fill(0);
  const monthlyOrdersCount = Array(12).fill(0);

  if (data.monthlySales && Array.isArray(data.monthlySales)) {
    data.monthlySales.forEach((item) => {
      // item._id = { month: 12, year: 2026 }
      const monthIdx = item._id?.month - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlyValues[monthIdx] = item.sales || 0;
        monthlyOrdersCount[monthIdx] = item.count || 0;
      }
    });
  }

  const maxSaleValue = Math.max(...monthlyValues, 10000);
  const maxOrderValue = Math.max(...monthlyOrdersCount, 10);

  // Generate SVG path for revenue chart
  const getSvgPathPoints = () => {
    const width = 1000;
    const height = 100;
    const points = monthlyValues.map((val, idx) => {
      const x = (idx / 11) * width;
      const y = height - (val / maxSaleValue) * height * 0.8 - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Store Overview</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Real-time summaries of transactions, inventory alerts, and user registrations.</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl transition-all text-slate-500 active:scale-95"
          title="Reload Statistics"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-start hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{stat.title}</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</h3>
              <p className="text-[10px] font-semibold text-indigo-600">{stat.trend}</p>
            </div>
            <div className={`${stat.bgIcon} p-3 rounded-xl text-white shadow-sm`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Sub Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subStats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-start hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{stat.title}</p>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{stat.footer}</p>
            </div>
            <div className={`${stat.bgIcon} ${stat.iconColor} p-2.5 rounded-xl shadow-inner`}>
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800">Revenue Overview Timeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated from dynamic billing values</p>
            </div>
            <div className="text-xs bg-[#eef2ff] border border-indigo-100 text-indigo-600 font-semibold px-2.5 py-1 rounded-md">
              FY {yearFilter}
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="relative h-60 w-full flex flex-col justify-between pt-4">
            <div className="absolute inset-x-0 bottom-[35px] left-12 right-0 h-40">
              <svg viewBox="0 0 1000 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path
                  d={getSvgPathPoints()}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Gridlines */}
            {[maxSaleValue, maxSaleValue * 0.66, maxSaleValue * 0.33, 0].map((val, idx) => (
              <div key={idx} className="w-full flex items-center text-[10px] text-slate-400">
                <span className="w-12 text-left font-mono">₹{Math.round(val).toLocaleString('en-IN')}</span>
                <div className="flex-1 border-t border-dashed border-slate-100"></div>
              </div>
            ))}

            {/* Months labels */}
            <div className="flex justify-between pl-12 text-[10px] text-slate-400 font-semibold mt-1">
              {months.map((m, idx) => (
                <span key={idx} className="w-full text-center">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Order status distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Fulfillment States</h2>
            <p className="text-xs text-slate-400 mt-0.5">Summary of total order categories</p>
          </div>

          <div className="flex justify-center items-center h-40">
            <div className="w-32 h-32 rounded-full border-[12px] border-indigo-600 relative flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{data.totalOrders}</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Orders</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1.5 border-slate-100">
              <span className="text-slate-500 font-semibold">Active Customers</span>
              <span className="font-bold text-slate-800 font-mono">{data.totalCustomers}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-100">
              <span className="text-slate-500 font-semibold">Low Stock Warnings</span>
              <span className="font-bold text-rose-500 font-mono">{data.lowStockCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Total Revenue Collected</span>
              <span className="font-bold text-green-600 font-mono">₹{data.revenue?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800">Recent Checkout Requests</h3>
          {data.latestOrders?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No checkouts recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-bold uppercase tracking-wider pb-2">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Gross Total</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {data.latestOrders?.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[10px] text-indigo-650">{ord._id}</td>
                      <td className="py-2.5 font-semibold text-slate-800">{ord.user?.name || 'Guest User'}</td>
                      <td className="py-2.5 font-bold text-slate-700">₹{ord.totalAmount}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ord.orderStatus === 'completed' || ord.orderStatus === 'delivered'
                            ? 'bg-green-50 text-green-600'
                            : ord.orderStatus === 'cancelled'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}>
                          {ord.orderStatus?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800">Newly Registered Customers</h3>
          {data.latestCustomers?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No customers registered yet</p>
          ) : (
            <div className="space-y-3">
              {data.latestCustomers?.map((cust) => (
                <div key={cust._id} className="flex justify-between items-center text-xs hover:bg-slate-50/60 p-1.5 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-[10px]">
                      {cust.name ? cust.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{cust.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cust.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-full text-slate-400 font-mono">
                    ID: {cust._id?.slice(-6)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}