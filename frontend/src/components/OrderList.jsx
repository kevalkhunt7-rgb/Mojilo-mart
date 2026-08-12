import { ShoppingBag, CheckCircle, Maximize2, X, ChevronRight, Ban, AlertCircle } from 'lucide-react';
import CartItem3DViewerDefault from './CartItem3DViewer'; // Top-level fallback import
import CancellationModal from './CancellationModal';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function OrderHistoryTab({ userOrders = [], CartItem3DViewer: CartItem3DViewerProp, onRefresh }) {
  const [selected3DItem, setSelected3DItem] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  // Use passed prop if provided, otherwise default to imported viewer
  const ViewerComponent = CartItem3DViewerProp || CartItem3DViewerDefault;

  return (
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="anim-fadeUp">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Order History</h1>
        <p className="text-sm text-gray-500">Track and manage your orders</p>
      </div>

      {/* Empty State */}
      {userOrders.length === 0 ? (
        <div className="anim-scaleIn flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
          <ShoppingBag size={56} className="text-gray-200 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Place your first order and it'll show up right here.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-linear-to-r from-[#A47A46] to-amber-600 hover:from-[#8e673e] hover:to-amber-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {userOrders.map((order, i) => {
            const discount = order.discountAmount || order.pricingSummary?.discount || 0;
            const itemsSum =
              order.items?.reduce((acc, item) => {
                const price = (item.product?.salePrice && Number(item.product.salePrice) > 0) ? Number(item.product.salePrice) : (item.price || item.variant?.price || item.product?.basePrice || 0);
                return acc + price * (item.quantity || 1);
              }, 0) || 0;

            const finalOrderTotal = order.totalAmount ?? order.grandTotal ?? order.totalPrice ?? order.total ?? Math.max(0, itemsSum - discount);

            return (
              <div
                key={order.id || order._id || i}
                className="anim-fadeUp bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      Order #{order.orderNumber || order._id}
                    </p>
                    <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-3 py-1 rounded-full">
                      <CheckCircle size={11} /> {order.orderStatus || order.status || 'Processing'}
                    </span>
                    {(order.orderStatus === 'cancellation_requested' || order.status === 'cancellation_requested') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertCircle size={11} /> Cancellation Requested
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-100">
                        Saved ₹{Number(discount).toFixed(2)}
                      </span>
                    )}
                    <p className="text-lg font-bold text-gray-900">
                      ₹{Number(finalOrderTotal).toFixed(2)}
                    </p>
                    {!['shipped', 'delivered', 'cancelled', 'refunded', 'cancellation_requested'].includes((order.orderStatus || order.status || '').toLowerCase()) && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200/60 transition-all cursor-pointer"
                      >
                        <Ban size={12} />
                        <span>Cancel</span>
                      </button>
                    )}
                    <Link
                      to={`/order/${order._id || order.orderNumber}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#A47A46] hover:text-[#8e673e] bg-[#A47A46]/10 hover:bg-[#A47A46]/20 px-3 py-1.5 rounded-xl transition-all ml-1"
                    >
                      <span>View Details</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Items Container */}
                <div className="p-5 space-y-4">
                  {order.items?.map((item, j) => {
                    const displayTitle =
                      item.productName ||
                      item.product?.name ||
                      item.product?.title ||
                      item.title ||
                      item.name ||
                      'Order Item';

                    const isCustomizationObj = typeof item.customization === 'object' && item.customization !== null;
                    const custObj = isCustomizationObj ? item.customization : {};

                    // Extract color directly from all MongoDB variations
                    const itemColor =
                      custObj.selectedColor ||
                      custObj.color ||
                      item.color ||
                      item.selectedColor ||
                      item.variant?.color ||
                      '#3B82F6';

                    const colorName = typeof itemColor === 'object' ? itemColor?.name : itemColor;

                    // Prioritize 3D mockup photo preview over flat 2D decal/previewUrl
                    let mockupImage =
                      custObj.previews?.mockup ||
                      custObj.mockupUrl ||
                      custObj.mockup ||
                      item.previews?.mockup ||
                      item.mockupUrl ||
                      item.mockup;

                    let frontPreview =
                      mockupImage ||
                      custObj.previewUrl ||
                      custObj.decalUrl ||
                      custObj.designUrl ||
                      custObj.image ||
                      custObj.previews?.front ||
                      item.previews?.front ||
                      item.decalUrl ||
                      item.previewUrl;

                    if (!frontPreview && Array.isArray(custObj.layers)) {
                      for (const l of custObj.layers) {
                        const img = l.imageConfig?.originalUrl || l.imageConfig?.processedUrl || l.src;
                        if (img) { frontPreview = img; break; }
                      }
                    }

                    if (!frontPreview && custObj.editableDesignJSON) {
                      try {
                        const design = typeof custObj.editableDesignJSON === 'string' ? JSON.parse(custObj.editableDesignJSON) : custObj.editableDesignJSON;
                        if (typeof design === 'object' && design !== null) {
                          for (const v of Object.keys(design)) {
                            const objs = Array.isArray(design[v]) ? design[v] : (design[v]?.objects || []);
                            for (const o of objs) {
                              if (o && (o.src || o.url)) { frontPreview = o.src || o.url; break; }
                            }
                            if (frontPreview) break;
                          }
                        }
                      } catch (e) {}
                    }

                    const displaySize = item.size || item.selectedSize || item.variant?.size;
                    const itemPrice = (item.product?.salePrice && Number(item.product.salePrice) > 0) ? Number(item.product.salePrice) : (item.price || item.variant?.price || item.product?.basePrice || 0);
                    const totalPrice = itemPrice * (item.quantity || 1);

                    const displayImage =
                      frontPreview ||
                      item.image ||
                      item.imageUrl ||
                      item.decalUrl ||
                      item.previewUrl ||
                      item.product?.image ||
                      item.product?.imageUrl ||
                      item.product?.images?.[0]?.url ||
                      (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null) ||
                      item.product?.images?.[0] ||
                      item.variant?.image ||
                      item.variant?.imageUrl ||
                      item.variant?.images?.[0]?.url ||
                      (typeof item.variant?.images?.[0] === 'string' ? item.variant?.images?.[0] : null);

                    const isCustomProduct = Boolean(
                      frontPreview ||
                      item.decalUrl ||
                      item.previewUrl ||
                      (isCustomizationObj && (custObj.decalUrl || custObj.previewUrl || custObj.previews?.front || (Array.isArray(custObj.layers) && custObj.layers.length > 0))) ||
                      item.isTemplate ||
                      item.clothingType
                    );

                    const normalized3DItem = {
                      ...item,
                      productName: item.productName || item.product?.name || displayTitle,
                      product: item.product || { name: displayTitle, id: item.productId },
                      clothingType: item.clothingType || item.customization?.clothingType || displayTitle,
                      productType: item.productType || item.customization?.baseTemplateId || item.clothingType || displayTitle,
                      color: itemColor,
                      selectedColor: itemColor,
                      customization: isCustomizationObj
                        ? {
                            ...custObj,
                            color: itemColor,
                            selectedColor: itemColor,
                            decalUrl: frontPreview || custObj.decalUrl || custObj.previewUrl || item.decalUrl || item.previewUrl,
                            previewUrl: frontPreview || custObj.previewUrl || custObj.decalUrl || item.previewUrl || item.decalUrl,
                            image: frontPreview || custObj.image || item.image,
                            previews: {
                              front: frontPreview || custObj.previews?.front || item.previews?.front,
                              ...(custObj.previews || {}),
                            },
                          }
                        : {
                            color: itemColor,
                            selectedColor: itemColor,
                            decalUrl: frontPreview || item.decalUrl || item.previewUrl || item.image,
                            previewUrl: frontPreview || item.previewUrl || item.decalUrl || item.image,
                            previews: {
                              front: frontPreview || item.decalUrl || item.previewUrl || item.image,
                            },
                          },
                    };

                    return (
                      <div
                        key={j}
                        className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                      >
                        {/* Thumbnail / Mockup Preview Box - Click to open 3D Popup */}
                        <div
                          onClick={() => setSelected3DItem(normalized3DItem)}
                          title="Click to view 3D Interactive Model"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative cursor-pointer group hover:border-amber-400 hover:shadow-md transition-all shadow-sm flex items-center justify-center"
                        >
                          {/* Display Mockup Image if present, else elegant garment mockup SVG in item color */}
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={displayTitle}
                              className="w-full h-full object-contain p-1 bg-white/40"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}

                          {/* Mockup Garment Silhouette Fallback (when no image or image fails to load) */}
                          <div
                            className={`w-full h-full flex flex-col items-center justify-center p-1.5 relative overflow-hidden ${
                              displayImage ? 'hidden' : 'flex'
                            }`}
                            style={{ backgroundColor: colorName || '#1E3A8A' }}
                          >
                            <svg viewBox="0 0 100 100" className="w-full h-3/4 text-white/90 drop-shadow-md">
                              <path
                                fill="currentColor"
                                d="M30,20 L40,25 Q50,28 60,25 L70,20 L88,35 L76,50 L70,44 L70,82 Q50,85 30,82 L30,44 L24,50 L12,35 Z"
                              />
                            </svg>
                            <span className="text-[9px] text-white font-bold tracking-tight bg-black/30 px-1.5 py-0.5 rounded mt-0.5">
                              3D View
                            </span>
                          </div>

                          {/* Hover Overlay: Expand 3D Icon */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                            <div className="flex flex-col items-center text-white drop-shadow-md">
                              <Maximize2 size={18} />
                              <span className="text-[9px] font-bold mt-1">View 3D</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {displayTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-400">
                              Qty: {item.quantity || 1}
                            </span>
                            {displaySize && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase border border-gray-200/40">
                                {displaySize}
                              </span>
                            )}
                            {colorName && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded capitalize border border-gray-200/40">
                                {colorName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ₹{Number(totalPrice).toFixed(2)}
                          </p>
                        </div>
                        {/* Review Action Button (only for delivered orders) */}
                        {order.status?.toLowerCase() === 'delivered' && (
                          <div className="mt-2">
                            <Link
                              to={`/product/${item.product?._id || item.productId}/write-review?orderId=${order._id || order.id}&orderItemId=${item._id || item.id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded-xl shadow-sm text-[#A47A46] hover:bg-[#A47A46]/10 transition-all"
                            >
                              Write Review
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL-SCREEN 3D PREVIEW MODAL */}
      {selected3DItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 anim-fadeUp">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selected3DItem.productName ||
                    selected3DItem.product?.name ||
                    '3D Interactive Preview'}
                </h3>
                <p className="text-xs text-gray-500">Drag to rotate and view design in 3D</p>
              </div>
              <button
                onClick={() => setSelected3DItem(null)}
                className="p-2 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal 3D Canvas Body */}
            <div className="flex-1 w-full h-full bg-gray-50 relative">
              {ViewerComponent ? (
                <ViewerComponent item={selected3DItem} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  3D Viewer Component Not Found
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setSelected3DItem(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-xl transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Request Modal */}
      {cancelModalOrder && (
        <CancellationModal
          isOpen={Boolean(cancelModalOrder)}
          onClose={() => setCancelModalOrder(null)}
          orderId={cancelModalOrder._id}
          orderNumber={cancelModalOrder.orderNumber}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            else window.location.reload();
          }}
        />
      )}
    </div>
  );
}