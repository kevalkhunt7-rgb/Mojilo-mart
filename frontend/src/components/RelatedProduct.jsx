import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

export function RelatedProducts({ currentProductId, category, gender, currentProduct }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve target properties from currentProduct object or direct props
  const targetId = currentProduct?._id || currentProduct?.id || currentProductId;
  const targetCategory = currentProduct?.category || category;
  const targetGender = currentProduct?.gender || gender;

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

  const getCategoryString = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') return cat.name || cat.slug || cat.title || cat._id || cat.id || '';
    return String(cat);
  };

  const matchCategory = (prodCat, targetCat) => {
    const c1 = getCategoryString(prodCat).toLowerCase().trim();
    const c2 = getCategoryString(targetCat).toLowerCase().trim();
    if (!c1 || !c2) return false;
    return c1 === c2 || c1.includes(c2) || c2.includes(c1);
  };

  const matchGender = (prodGender, targetGender) => {
    const g1 = (typeof prodGender === 'string' ? prodGender : '').toLowerCase().trim();
    const g2 = (typeof targetGender === 'string' ? targetGender : '').toLowerCase().trim();
    if (!g1 || !g2) return false;
    if (g1 === 'unisex' || g2 === 'unisex') return true;
    return g1 === g2;
  };

  const safeProductsList = Array.isArray(productsList) ? productsList : [];

  // Exclude current product
  const otherProducts = safeProductsList.filter(item => {
    if (!item) return false;
    const itemId = item._id || item.id;
    return String(itemId) !== String(targetId);
  });

  // Calculate relevance score for each product (Category / Gender matching)
  const scoredProducts = otherProducts.map(item => {
    const catMatch = matchCategory(item.category, targetCategory);
    const genMatch = matchGender(item.gender, targetGender);

    let score = 0;
    if (catMatch && genMatch) score = 3;      // Both category & gender match
    else if (catMatch) score = 2;              // Category match
    else if (genMatch) score = 1;              // Gender match

    return { item, score, catMatch, genMatch };
  });

  // Filter items that match at least category OR gender
  const matchingItems = scoredProducts
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(p => p.item);

  // If matching items < 4, pad with other available products to maintain a complete 4-card layout
  let finalProducts = [...matchingItems];
  if (finalProducts.length < 4) {
    const matchingIds = new Set(finalProducts.map(p => String(p._id || p.id)));
    const remaining = otherProducts.filter(p => !matchingIds.has(String(p._id || p.id)));
    finalProducts = [...finalProducts, ...remaining];
  }

  const displayProducts = finalProducts.slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#A47A46] h-8 w-8" />
      </div>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-slate-100 font-sans">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-3.5 h-7 bg-[#A47A46] rounded-full"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Related Products
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Handpicked items matching your category & style preference
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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