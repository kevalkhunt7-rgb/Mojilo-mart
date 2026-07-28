import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

/* ─── Helpers ────────────────────────────────────────────────────── */
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

function isValidHex(str) {
  return /^#[0-9A-Fa-f]{3,8}$/.test(str.trim());
}

function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-xl backdrop-blur-sm border transition-all duration-300
            ${t.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400'
              : t.type === 'error'
              ? 'bg-red-500/95 text-white border-red-400'
              : 'bg-indigo-500/95 text-white border-indigo-400'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

/* ─── Color Picker Popover ───────────────────────────────────────── */
function ColorPickerPopover({ onAdd }) {
  const [hex, setHex] = useState('#');
  const [nativeColor, setNativeColor] = useState('#3b82f6');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNativeChange = (e) => {
    const val = e.target.value;
    setNativeColor(val);
    setHex(val.toUpperCase());
  };

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHex(val);
    if (isValidHex(val)) setNativeColor(val);
  };

  const handleAdd = () => {
    const final = hex.startsWith('#') ? hex.trim() : `#${hex.trim()}`;
    if (!isValidHex(final)) return;
    onAdd(final.toUpperCase());
    setHex('#');
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        id="btn-add-color"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Color
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-40 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-64">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pick a Color</p>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="color"
              value={nativeColor}
              onChange={handleNativeChange}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5"
            />
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-slate-400 mb-1 block">HEX Code</label>
              <input
                type="text"
                value={hex}
                onChange={handleHexChange}
                placeholder="#FFFFFF"
                maxLength={9}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          {isValidHex(hex) && (
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg border-2 border-slate-200 shadow-inner"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs text-slate-500 font-mono">{hex.toUpperCase()}</span>
            </div>
          )}
          <button
            type="button"
            disabled={!isValidHex(hex)}
            onClick={handleAdd}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Add Swatch
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Single Template Card ───────────────────────────────────────── */
function TemplateCard({ template, onSave, saving }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(template)));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(template)));
    setDirty(false);
  }, [template]);

  const update = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  /* ── Colors ── */
  const addColor = (hex) => {
    if (draft.availableColors.includes(hex)) return;
    update({ availableColors: [...draft.availableColors, hex] });
  };

  const removeColor = (hex) => {
    update({ availableColors: draft.availableColors.filter((c) => c !== hex) });
  };

  /* ── Sizes ── */
  const getSizeRow = (sz) =>
    draft.sizes.find((s) => s.size === sz) || { size: sz, enabled: false, priceAddon: 0 };

  const toggleSize = (sz) => {
    const exists = draft.sizes.find((s) => s.size === sz);
    let newSizes;
    if (exists) {
      newSizes = draft.sizes.map((s) =>
        s.size === sz ? { ...s, enabled: !s.enabled } : s
      );
    } else {
      newSizes = [...draft.sizes, { size: sz, enabled: true, priceAddon: 0 }];
    }
    update({ sizes: newSizes });
  };

  const setPriceAddon = (sz, val) => {
    const exists = draft.sizes.find((s) => s.size === sz);
    let newSizes;
    if (exists) {
      newSizes = draft.sizes.map((s) =>
        s.size === sz ? { ...s, priceAddon: parseFloat(val) || 0 } : s
      );
    } else {
      newSizes = [...draft.sizes, { size: sz, enabled: false, priceAddon: parseFloat(val) || 0 }];
    }
    update({ sizes: newSizes });
  };

  const isSaving = saving === draft._id;

  return (
    <div className={`bg-white border rounded-2xl shadow-sm transition-all duration-200
      ${dirty ? 'border-indigo-300 shadow-indigo-100 shadow-md' : 'border-slate-200'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{draft.name}</h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{draft.key}</span>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-semibold text-slate-500">Active</span>
          <button
            type="button"
            onClick={() => update({ isActive: !draft.isActive })}
            className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
              ${draft.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block w-4 h-4 mt-0.5 ml-0.5 bg-white rounded-full shadow transition-transform duration-200
              ${draft.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
      </div>

      <div className="p-5 space-y-6">
        {/* Base Price */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Base Price (₹)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">₹</span>
            <input
              id={`price-${draft._id}`}
              type="number"
              min="0"
              step="1"
              value={draft.basePrice}
              onChange={(e) => update({ basePrice: parseFloat(e.target.value) || 0 })}
              className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
            {dirty && (
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Available Colors */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            Available Colors ({draft.availableColors.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {draft.availableColors.map((color) => (
              <div key={color} className="group relative flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-xl border-2 border-white shadow-md ring-1 ring-slate-200 cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="text-[9px] font-mono text-slate-400 leading-none">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                    text-[9px] font-bold leading-none shadow"
                  title="Remove color"
                >
                  ×
                </button>
              </div>
            ))}

            <ColorPickerPopover onAdd={addColor} />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            Sizes & Price Add-ons
          </label>
          <div className="space-y-1.5">
            {ALL_SIZES.map((sz) => {
              const row = getSizeRow(sz);
              return (
                <div
                  key={sz}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                    ${row.enabled
                      ? 'bg-indigo-50 border border-indigo-100'
                      : 'bg-slate-50 border border-slate-100 opacity-60'}`}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    id={`size-toggle-${draft._id}-${sz}`}
                    onClick={() => toggleSize(sz)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${row.enabled
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-300 text-transparent'}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  {/* Size badge */}
                  <span className={`w-10 text-center text-xs font-bold rounded-lg py-1
                    ${row.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {sz}
                  </span>

                  {/* Price add-on */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] text-slate-400 font-semibold">+₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={row.priceAddon}
                      onChange={(e) => setPriceAddon(sz, e.target.value)}
                      disabled={!row.enabled}
                      className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold
                        text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40
                        text-right bg-white transition-all"
                    />
                  </div>

                  {row.priceAddon > 0 && row.enabled && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      +₹{row.priceAddon}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="px-5 pb-5">
        <button
          type="button"
          id={`save-btn-${draft._id}`}
          onClick={() => onSave(draft)}
          disabled={!dirty || isSaving}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
            ${dirty && !isSaving
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : dirty ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          ) : (
            'Up to date'
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function ApparelTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // _id of template currently saving
  const [error, setError] = useState(null);
  const { toasts, push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/admin/apparel-templates');
        setTemplates(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (draft) => {
    setSaving(draft._id);
    try {
      const res = await axios.put(`/api/admin/apparel-templates/${draft._id}`, {
        basePrice: draft.basePrice,
        availableColors: draft.availableColors,
        sizes: draft.sizes,
        isActive: draft.isActive,
      });
      const updated = res.data?.data;
      setTemplates((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      push(`"${updated.name}" saved successfully`, 'success');
    } catch (err) {
      push(err.response?.data?.message || 'Failed to save template', 'error');
    } finally {
      setSaving(null);
    }
  };

  const activeCount  = templates.filter((t) => t.isActive).length;
  const inactiveCount = templates.filter((t) => !t.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast toasts={toasts} />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                </svg>
              </span>
              Apparel Template Manager
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage base prices, fabric colors, and sizes for each customizable product type.
            </p>
          </div>

          {!loading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">{activeCount} Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-500">{inactiveCount} Inactive</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Info Banner */}
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3 text-xs text-indigo-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>
            <strong>GET</strong> <code className="bg-indigo-100 px-1 rounded font-mono">/api/admin/apparel-templates</code>
            &nbsp;·&nbsp;
            <strong>PUT</strong> <code className="bg-indigo-100 px-1 rounded font-mono">/api/admin/apparel-templates/:id</code>
            &nbsp;—&nbsp;Changes are reflected live in the frontend customizer.
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-9 h-9 bg-slate-200 rounded-xl" />
                  ))}
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-8 bg-slate-100 rounded-xl" />
                  ))}
                </div>
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800">Failed to load templates</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Template Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {templates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onSave={handleSave}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
