import React, { useEffect, useLayoutEffect, useState } from 'react';
import api from '../lib/axios';
import {
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  RefreshCw,
  IndianRupee,
} from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FONT_DISPLAY = "'Manrope', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter] = useState('2026');
  
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' && (
      document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
    )
  );

  useLayoutEffect(() => {
    const updateDark = () => {
      const darkActive = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      setIsDark(darkActive);
    };
    updateDark();

    const observer = new MutationObserver(updateDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
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
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 transition-colors"
        style={{ fontFamily: FONT_BODY }}
      >
        <div className="relative w-12 h-12">
          <span className="absolute inset-0 rounded-full border-[3px] border-slate-300 dark:border-slate-800" />
          <span className="absolute inset-0 rounded-full border-[3px] border-[#2A3466] dark:border-indigo-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Compiling today's numbers…</p>
      </div>
    );
  }

  const topStats = [
    {
      title: 'Total Revenue',
      value: `₹${(data.revenue || 0).toLocaleString('en-IN')}`,
      trend: 'Live calculations',
      icon: IndianRupee,
      accent: '#DDA23A',
      accentSoft: isDark ? 'rgba(221, 162, 58, 0.15)' : '#FBF1DE',
    },
    {
      title: 'Total Orders',
      value: (data.totalOrders || 0).toLocaleString('en-IN'),
      trend: 'Completed checkouts',
      icon: ShoppingCart,
      accent: isDark ? '#818CF8' : '#2A3466',
      accentSoft: isDark ? 'rgba(129, 140, 248, 0.15)' : '#E7E9F4',
    },
    {
      title: 'Customers',
      value: (data.totalCustomers || 0).toLocaleString('en-IN'),
      trend: 'Registered profiles',
      icon: Users,
      accent: '#2F8F72',
      accentSoft: isDark ? 'rgba(47, 143, 114, 0.15)' : '#E4F3EE',
    },
    {
      title: 'Products',
      value: (data.totalProducts || 0).toLocaleString('en-IN'),
      trend: 'Active catalog items',
      icon: Package,
      accent: isDark ? '#A78BFA' : '#6B5CA5',
      accentSoft: isDark ? 'rgba(167, 139, 250, 0.15)' : '#ECE9F6',
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyValues = Array(12).fill(0);

  if (Array.isArray(data.monthlySales)) {
    data.monthlySales.forEach((item) => {
      const monthIdx = (item._id?.month || 1) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlyValues[monthIdx] = item.sales || 0;
      }
    });
  }

  const CHART_W = 600;
  const CHART_H = 180;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 25;
  const PAD_LEFT = 10;
  const PAD_RIGHT = 10;

  const maxSaleValue = Math.max(...monthlyValues, 1000);

  const chartPoints = monthlyValues.map((val, idx) => {
    const x = PAD_LEFT + (idx / 11) * (CHART_W - PAD_LEFT - PAD_RIGHT);
    const normalizedY = (val / maxSaleValue) * (CHART_H - PAD_TOP - PAD_BOTTOM);
    const y = CHART_H - PAD_BOTTOM - normalizedY;
    return [x, y];
  });

  const buildSmoothPath = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0[0] + (p1[0] - p0[0]) * 0.5;
      const cp1y = p0[1];
      const cp2x = p0[0] + (p1[0] - p0[0]) * 0.5;
      const cp2y = p1[1];
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1[0]},${p1[1]}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(chartPoints);
  const areaPath = `${linePath} L ${CHART_W},${CHART_H} L 0,${CHART_H} Z`;
  const lastPoint = chartPoints[chartPoints.length - 1];

  const now = new Date();
  const currentDateLabel = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="max-w-[1600px] mx-auto space-y-6 transition-colors duration-200"
      style={{ fontFamily: FONT_BODY, color: isDark ? '#E2E8F0' : '#14162B' }}
    >
      <ToastContainer theme={isDark ? 'dark' : 'light'} />

      {/* Header */}
      <div
        className="flex justify-between items-center p-6 rounded-2xl border shadow-sm transition-colors"
        style={{
          backgroundColor: isDark ? '#181B2A' : '#ffffff',
          borderColor: isDark ? '#272B40' : '#e2e8f0'
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}
            >
              Store Overview
            </h1> 
            <span className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-[#E4F3EE] dark:bg-[#2F8F72]/20 border border-[#CBE8DC] dark:border-[#2F8F72]/30">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2F8F72] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2F8F72]" />
              </span>
              <span className="text-[10px] font-bold text-[#2F8F72] dark:text-[#4ADE80] tracking-wide uppercase">Live</span>
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {currentDateLabel} · transactions, inventory, and customer activity
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2.5 border rounded-xl transition-all active:scale-95 cursor-pointer"
          style={{
            backgroundColor: isDark ? '#1E2235' : '#ffffff',
            borderColor: isDark ? '#272B40' : '#e2e8f0',
            color: isDark ? '#CBD5E1' : '#64748B'
          }}
          title="Reload statistics"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {topStats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: isDark ? '#181B2A' : '#ffffff',
              borderColor: isDark ? '#272B40' : '#e2e8f0',
              borderTop: `3px solid ${stat.accent}`
            }}
          >
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                {stat.title}
              </p>
              <div className="p-2 rounded-lg" style={{ backgroundColor: stat.accentSoft, color: stat.accent }}>
                <stat.icon size={16} />
              </div>
            </div>
            <h3
              className="text-[28px] font-extrabold tracking-tight mt-2"
              style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}
            >
              {stat.value}
            </h3>
            <p className="text-[11px] font-semibold mt-1" style={{ color: stat.accent }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Low stock alert strip */}
      {(data.lowStockCount || 0) > 0 && (
        <div
          className="flex items-center gap-3 border rounded-2xl px-5 py-3.5 transition-colors"
          style={{
            backgroundColor: isDark ? '#2A2118' : '#FBF1DE',
            borderColor: isDark ? '#4D381E' : '#F0DFB8'
          }}
        >
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isDark ? '#181B2A' : '#FFFFFF',
              color: isDark ? '#F59E0B' : '#B8791F'
            }}
          >
            <AlertTriangle size={16} />
          </div>
          <p className="text-sm font-medium" style={{ color: isDark ? '#FCD34D' : '#7A5518' }}>
            <span className="font-bold">{data.lowStockCount}</span> variant{data.lowStockCount === 1 ? '' : 's'} below the stock threshold — worth a restock check.
          </p>
        </div>
      )}

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 p-6 rounded-2xl border shadow-sm space-y-1 transition-colors"
          style={{
            backgroundColor: isDark ? '#181B2A' : '#ffffff',
            borderColor: isDark ? '#272B40' : '#e2e8f0'
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}>
                Revenue Timeline
              </h2>
              <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Monthly billing totals</p>
            </div>
            <div
              className="text-xs font-semibold px-2.5 py-1 rounded-md border"
              style={{
                backgroundColor: isDark ? '#222846' : '#E2E8F0',
                borderColor: isDark ? '#333A63' : '#CBD5E1',
                color: isDark ? '#A5B4FC' : '#2A3466'
              }}
            >
              FY {yearFilter}
            </div>
          </div>
          <div
            className="h-px w-full my-4 opacity-60 dark:opacity-30"
            style={{ backgroundImage: `repeating-linear-gradient(90deg, ${isDark ? '#3D4468' : '#CBD5E1'} 0 6px, transparent 6px 11px)` }}
          />

          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="w-full h-56 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? '#818CF8' : '#2A3466'} stopOpacity={isDark ? '0.35' : '0.16'} />
                  <stop offset="100%" stopColor={isDark ? '#818CF8' : '#2A3466'} stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0.0, 0.33, 0.66, 1.0].map((f, idx) => (
                <line
                  key={idx}
                  x1="0"
                  x2={CHART_W}
                  y1={CHART_H - PAD_BOTTOM - f * (CHART_H - PAD_TOP - PAD_BOTTOM)}
                  y2={CHART_H - PAD_BOTTOM - f * (CHART_H - PAD_TOP - PAD_BOTTOM)}
                  stroke={isDark ? '#23283E' : '#E2E8F0'}
                  strokeWidth="1"
                />
              ))}

              <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
              <path d={linePath} fill="none" stroke={isDark ? '#818CF8' : '#2A3466'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {lastPoint && (
                <circle cx={lastPoint[0]} cy={lastPoint[1]} r="5" fill="#DDA23A" stroke={isDark ? '#181B2A' : '#FFFFFF'} strokeWidth="2.5" />
              )}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
              {[maxSaleValue, maxSaleValue * 0.66, maxSaleValue * 0.33, 0].map((val, idx) => (
                <span
                  key={idx}
                  className="absolute -translate-y-1/2 text-[10px] font-mono pr-2 transition-colors"
                  style={{
                    top: `${(idx / 3) * 100}%`,
                    fontFamily: FONT_MONO,
                    backgroundColor: isDark ? '#181B2A' : '#ffffff',
                    color: isDark ? '#94A3B8' : '#64748B'
                  }}
                >
                  ₹{Math.round(val).toLocaleString('en-IN')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-semibold pt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {months.map((m, idx) => (
              <span key={idx} className="w-full text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* At a glance */}
        <div
          className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-6 transition-colors"
          style={{
            backgroundColor: isDark ? '#181B2A' : '#ffffff',
            borderColor: isDark ? '#272B40' : '#e2e8f0'
          }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}>
              At a Glance
            </h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Snapshot of the store right now</p>
          </div>

          <div className="flex justify-center items-center py-2">
            <div
              className="w-32 h-32 rounded-full border-[10px] relative flex items-center justify-center transition-colors"
              style={{ borderColor: isDark ? '#6366F1' : '#2A3466' }}
            >
              <div className="text-center">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}
                >
                  {data.totalOrders}
                </span>
                <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Orders</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div
              className="flex justify-between items-center border-b pb-2.5"
              style={{ borderColor: isDark ? '#272B40' : '#E2E8F0' }}
            >
              <span className="font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Active customers</span>
              <span className="font-bold" style={{ fontFamily: FONT_MONO, color: isDark ? '#F8FAFC' : '#14162B' }}>{data.totalCustomers}</span>
            </div>
            <div
              className="flex justify-between items-center border-b pb-2.5"
              style={{ borderColor: isDark ? '#272B40' : '#E2E8F0' }}
            >
              <span className="font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Low stock warnings</span>
              <span className="font-bold" style={{ fontFamily: FONT_MONO, color: isDark ? '#F87171' : '#C74B4B' }}>{data.lowStockCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Revenue collected</span>
              <span className="font-bold" style={{ fontFamily: FONT_MONO, color: isDark ? '#34D399' : '#2F8F72' }}>
                ₹{data.revenue?.toLocaleString('en-IN') || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div
          className="p-6 rounded-2xl border shadow-sm space-y-4 transition-colors"
          style={{
            backgroundColor: isDark ? '#181B2A' : '#ffffff',
            borderColor: isDark ? '#272B40' : '#e2e8f0'
          }}
        >
          <h3 className="font-bold text-base" style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}>
            Recent Checkouts
          </h3>
          {data.latestOrders?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: isDark ? '#212538' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
              >
                <ShoppingCart size={18} />
              </div>
              <p className="text-xs font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>No checkouts yet — they'll show up here as orders come in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b font-bold uppercase tracking-wider"
                    style={{ borderColor: isDark ? '#272B40' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    <th className="pb-2.5">Order ID</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: isDark ? '#272B40' : '#E2E8F0' }}>
                  {data.latestOrders?.map((ord) => {
                    const status = ord.orderStatus;
                    const isDone = status === 'completed' || status === 'delivered';
                    const isCancelled = status === 'cancelled';
                    
                    const statusColor = isDone 
                      ? (isDark ? '#34D399' : '#2F8F72') 
                      : isCancelled 
                      ? (isDark ? '#F87171' : '#C74B4B') 
                      : (isDark ? '#FBBF24' : '#B8791F');
                    
                    const statusBg = isDone 
                      ? (isDark ? 'rgba(52, 211, 153, 0.15)' : '#E4F3EE') 
                      : isCancelled 
                      ? (isDark ? 'rgba(248, 113, 113, 0.15)' : '#FBEAEA') 
                      : (isDark ? 'rgba(251, 191, 36, 0.15)' : '#FBF1DE');

                    return (
                      <tr key={ord._id} className="transition-colors hover:bg-slate-100/50 dark:hover:bg-[#212538]/50">
                        <td className="py-3 text-[10px]" style={{ fontFamily: FONT_MONO, color: isDark ? '#A5B4FC' : '#6B5CA5' }}>
                          {ord._id?.slice(-8)}
                        </td>
                        <td className="py-3 font-semibold" style={{ color: isDark ? '#E2E8F0' : '#14162B' }}>{ord.user?.name || 'Guest User'}</td>
                        <td className="py-3 font-bold" style={{ fontFamily: FONT_MONO, color: isDark ? '#F8FAFC' : '#14162B' }}>
                          ₹{ord.totalAmount}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide"
                            style={{ color: statusColor, backgroundColor: statusBg }}
                          >
                            {status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest Customers */}
        <div
          className="p-6 rounded-2xl border shadow-sm space-y-4 transition-colors"
          style={{
            backgroundColor: isDark ? '#181B2A' : '#ffffff',
            borderColor: isDark ? '#272B40' : '#e2e8f0'
          }}
        >
          <h3 className="font-bold text-base" style={{ fontFamily: FONT_DISPLAY, color: isDark ? '#F8FAFC' : '#14162B' }}>
            Newly Registered Customers
          </h3>
          {data.latestCustomers?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: isDark ? '#212538' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
              >
                <Users size={18} />
              </div>
              <p className="text-xs font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>No customers yet — new sign-ups will appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {data.latestCustomers?.map((cust) => (
                <div
                  key={cust._id}
                  className="flex justify-between items-center text-xs p-2 rounded-xl transition-colors hover:bg-slate-100/50 dark:hover:bg-[#212538]/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                      style={{ fontFamily: FONT_DISPLAY, background: 'linear-gradient(135deg, #2A3466, #6B5CA5)' }}
                    >
                      {cust.name ? cust.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight" style={{ color: isDark ? '#E2E8F0' : '#14162B' }}>{cust.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{cust.email}</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{
                      fontFamily: FONT_MONO,
                      backgroundColor: isDark ? '#212538' : '#E2E8F0',
                      borderColor: isDark ? '#272B40' : '#CBD5E1',
                      color: isDark ? '#94A3B8' : '#64748B'
                    }}
                  >
                    ID · {cust._id?.slice(-6)}
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