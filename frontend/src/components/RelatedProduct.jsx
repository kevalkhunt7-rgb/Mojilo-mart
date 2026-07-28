import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

export function RelatedProducts({ currentProductId, category }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        const rawData = response.data?.data;
        const items = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.products)
          ? rawData.products
          : Array.isArray(response.data?.products)
          ? response.data.products
          : [];
        setProductsList(items);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
        setProductsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedProducts();
  }, []);

  const matchCategory = (prodCategory, targetCategory) => {
    if (!prodCategory || !targetCategory) return false;
    const target = String(targetCategory).toLowerCase();
    if (typeof prodCategory === 'object') {
      return String(prodCategory.name).toLowerCase() === target ||
             String(prodCategory._id).toLowerCase() === target ||
             String(prodCategory.id).toLowerCase() === target;
    }
    return String(prodCategory).toLowerCase() === target;
  };

  const safeProductsList = Array.isArray(productsList) ? productsList : [];

  const related = safeProductsList
    .filter((item) => {
      if (!item) return false;
      const itemId = item.id || item._id;
      return String(itemId) !== String(currentProductId) && matchCategory(item.category, category);
    })
    .slice(0, 4);

  const displayProducts = related.length > 0 
    ? related 
    : safeProductsList.filter(item => item && String(item.id || item._id) !== String(currentProductId)).slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#936A3B] h-8 w-8" />
      </div>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 font-sans">
      <div className="flex items-center gap-3 mb-5 sm:mb-8">
        <div className="w-4 h-8 bg-[#936A3B] rounded-sm"></div>
        <h2 className="text-lg font-bold tracking-tight text-[#936A3B]">
          Related Items
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {displayProducts.map((product) => {
          const adaptedProduct = {
            ...product,
            image: product.image || (product.images && (product.images[0]?.url || product.images[0])),
            price: product.salePrice && Number(product.salePrice) > 0 ? product.salePrice : (product.price || product.basePrice)
          };

          return (
            <ProductCard key={product.id || product._id} product={adaptedProduct} />
          );
        })}
      </div>
    </section>
  );
}

export default RelatedProducts;