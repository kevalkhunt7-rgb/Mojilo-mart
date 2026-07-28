import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../lib/axios';

export function ProductGrid() {
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const rawData = res.data?.data;
        const items = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.products)
          ? rawData.products
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
        setProductsList(items);
      } catch (err) {
        console.error('Failed to load products from database:', err);
        setProductsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const safeProductsList = Array.isArray(productsList) ? productsList : [];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-xl font-bold tracking-tight text-gray-900">
          Explore Our Designs
        </h2>
        <button
          onClick={() => navigate('/collection')}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold
                     text-gray-700 bg-gray-50 border border-gray-200
                     px-3 py-1.5 sm:px-4 sm:py-2 rounded-md
                     hover:bg-gray-100 active:scale-95
                     transition-all cursor-pointer"
        >
          View All <span>&rarr;</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-gray-500 font-medium">Loading products from database...</p>
        </div>
      ) : safeProductsList.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">No products found in database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                        gap-x-3 gap-y-6
                        sm:gap-x-5 sm:gap-y-8
                        lg:gap-x-6 lg:gap-y-10">
          {safeProductsList.map((product) => {
            const adaptedProduct = {
              ...product,
              id: product.id || product._id,
              name: product.name || product.title,
              title: product.title || product.name,
              image: product.image || (Array.isArray(product.images) && product.images[0]?.url) || (Array.isArray(product.images) && product.images[0]),
              price: typeof product.price === 'number'
                ? product.price.toFixed(2)
                : product.price,
            };

            return (
              <ProductCard key={product._id || product.id} product={adaptedProduct} />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductGrid;