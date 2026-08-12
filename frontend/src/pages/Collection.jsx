import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowUpDown, Check, X, Loader2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import api from "../lib/axios";

// Helper function to resolve relative / absolute image paths safely
const formatImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const Collection = () => {
  const [subcategorySearch, setSubcategorySearch] = useState(""); 
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [sortOption, setSortOption] = useState("relevant"); 
  const [searchParams] = useSearchParams();
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read URL query parameters
  const genderFromUrl = searchParams.get("Gender");
  const categoryFromUrl = searchParams.get("Category");
  const subcategoryFromUrl = searchParams.get("SubCategory");
  const textSearchFromUrl = searchParams.get("search");

  // Fetch products and categories from backend API
  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (textSearchFromUrl) params.search = textSearchFromUrl;
        if (genderFromUrl) params.gender = genderFromUrl;
        if (categoryFromUrl) params.category = categoryFromUrl;

        const [prodRes, catRes] = await Promise.all([
          api.get('/products', { params }),
          api.get('/categories').catch(() => ({ data: [] }))
        ]);
        
        // Flexibly extract products array
        let items = [];
        if (Array.isArray(prodRes.data)) {
          items = prodRes.data;
        } else if (Array.isArray(prodRes.data?.data)) {
          items = prodRes.data.data;
        } else if (Array.isArray(prodRes.data?.products)) {
          items = prodRes.data.products;
        } else if (Array.isArray(prodRes.data?.data?.products)) {
          items = prodRes.data.data.products;
        }

        // Flexibly extract categories array
        let cats = [];
        if (Array.isArray(catRes.data)) {
          cats = catRes.data;
        } else if (Array.isArray(catRes.data?.data)) {
          cats = catRes.data.data;
        } else if (Array.isArray(catRes.data?.categories)) {
          cats = catRes.data.categories;
        }

        setProductsList(items);
        setCategoriesList(cats);
      } catch (err) {
        console.error("API catalog data load error:", err);
        setProductsList([]);
        setCategoriesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [textSearchFromUrl, genderFromUrl, categoryFromUrl]);

  // Prevent background scroll when mobile filter overlay is active
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileFilterOpen]);

  // Combine backend categories API data with any category references on products
  const allCategoryItems = useMemo(() => {
    const map = new Map();

    // 1. Add categories from DB API
    categoriesList.forEach((cat) => {
      if (typeof cat === 'object' && cat !== null) {
        const name = cat.name || cat.title || '';
        const id = cat._id || cat.id || name;
        if (name && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), { id, name, slug: cat.slug || '' });
        }
      } else if (typeof cat === 'string' && cat.trim()) {
        if (!map.has(cat.toLowerCase())) {
          map.set(cat.toLowerCase(), { id: cat, name: cat, slug: '' });
        }
      }
    });

    // 2. Derive any additional category names attached to products
    if (Array.isArray(productsList)) {
      productsList.forEach((p) => {
        if (!p) return;
        const catObj = p.category;
        if (typeof catObj === 'object' && catObj !== null) {
          const name = catObj.name || '';
          const id = catObj._id || catObj.id || name;
          if (name && !map.has(name.toLowerCase())) {
            map.set(name.toLowerCase(), { id, name, slug: catObj.slug || '' });
          }
        } else if (typeof catObj === 'string' && catObj.trim()) {
          if (!map.has(catObj.toLowerCase())) {
            map.set(catObj.toLowerCase(), { id: catObj, name: catObj, slug: '' });
          }
        }
      });
    }

    return Array.from(map.values());
  }, [categoriesList, productsList]);

  // Sync category selections from URL query parameter
  useEffect(() => {
    const paramCat = categoryFromUrl || subcategoryFromUrl;
    if (paramCat) {
      const paramLower = paramCat.toLowerCase().trim();
      const matched = allCategoryItems.find(
        (cat) =>
          cat.name.toLowerCase() === paramLower ||
          cat.slug.toLowerCase() === paramLower ||
          String(cat.id).toLowerCase() === paramLower
      );
      if (matched) {
        setSelectedCategories([matched.name]);
      } else {
        setSelectedCategories([paramCat]);
      }
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams, allCategoryItems]);

  const filteredCategoryItems = allCategoryItems.filter((catItem) =>
    catItem.name.toLowerCase().includes(subcategorySearch.toLowerCase())
  );

  const handleCategoryChange = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((item) => item !== catName)
        : [...prev, catName]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSubcategorySearch("");
  };

  const getProcessedProducts = () => {
    if (!Array.isArray(productsList)) return [];

    let result = productsList.filter((product) => {
      if (!product) return false;

      const pTitle = product.name || product.title || "";
      const pGender = product.gender || product.targetGender || "";

      // Extract category details from product
      const pCatObj = product.category;
      const pCatId = typeof pCatObj === 'object' && pCatObj ? String(pCatObj._id || pCatObj.id || '') : '';
      const pCatName = typeof pCatObj === 'object' && pCatObj ? (pCatObj.name || '') : String(pCatObj || '');
      const pCatSlug = typeof pCatObj === 'object' && pCatObj ? (pCatObj.slug || '') : '';

      // 1. FILTER BY SELECTED SIDEBAR CATEGORIES
      const matchesSelectedCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((selected) => {
          const selLower = selected.toLowerCase().trim();
          return (
            (pCatId && pCatId.toLowerCase() === selLower) ||
            (pCatName && pCatName.toLowerCase().trim() === selLower) ||
            (pCatSlug && pCatSlug.toLowerCase().trim() === selLower)
          );
        });

      // 2. FILTER BY GENDER QUERY PARAM
      const matchesUrlGender = (() => {
        if (!genderFromUrl) return true;

        const targetGender = genderFromUrl.toLowerCase().trim();
        const productGender = String(pGender).toLowerCase().trim();

        if (targetGender === "female" || targetGender === "woman" || targetGender === "women") {
          return productGender === "female" || productGender === "woman" || productGender === "women" || productGender === "unisex";
        }
        if (targetGender === "male" || targetGender === "man" || targetGender === "men") {
          return productGender === "male" || productGender === "man" || productGender === "men" || productGender === "unisex";
        }
        if (targetGender === "unisex") {
          return productGender === "unisex";
        }

        return productGender === targetGender;
      })();

      // 3. FILTER BY CATEGORY QUERY PARAM
      const matchesUrlCategory = 
        !categoryFromUrl || 
        (pCatId && pCatId.toLowerCase() === categoryFromUrl.toLowerCase()) ||
        (pCatName && pCatName.toLowerCase() === categoryFromUrl.toLowerCase()) ||
        (pCatSlug && pCatSlug.toLowerCase() === categoryFromUrl.toLowerCase());

      // 4. FILTER BY TEXT SEARCH QUERY
      const matchesTextSearch = 
        !textSearchFromUrl ||
        pTitle.toLowerCase().includes(textSearchFromUrl.toLowerCase()) ||
        pCatName.toLowerCase().includes(textSearchFromUrl.toLowerCase()) ||
        pCatSlug.toLowerCase().includes(textSearchFromUrl.toLowerCase());

      return (
        matchesSelectedCategories && 
        matchesUrlGender && 
        matchesUrlCategory && 
        matchesTextSearch
      );
    });

    const getPPrice = p => (p.salePrice && Number(p.salePrice) > 0 ? Number(p.salePrice) : Number(p.price || p.basePrice || 0));
    if (sortOption === "low-high") {
      result.sort((a, b) => getPPrice(a) - getPPrice(b));
    } else if (sortOption === "high-low") {
      result.sort((a, b) => getPPrice(b) - getPPrice(a));
    } else if (sortOption === "newest") {
      result.sort((a, b) => {
        const aId = a.id || a._id;
        const bId = b.id || b._id;
        return String(bId).localeCompare(String(aId));
      });
    }

    return result;
  };

  const processedProducts = getProcessedProducts();
  const activeSortLabel =
    sortOption === "low-high"
      ? "Price: Low to High"
      : sortOption === "high-low"
      ? "Price: High to Low"
      : "Newest";

  const sortOptions = [
    { value: "relevant", label: "Relevant", shortLabel: "Relevant" },
    { value: "low-high", label: "Price: Low to High", shortLabel: "Price ↑" },
    { value: "high-low", label: "Price: High to Low", shortLabel: "Price ↓" },
    { value: "newest", label: "Newest", shortLabel: "New" },
  ];

  const FilterContents = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">
          CATEGORIES
        </h4>
        
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search categories..."
            value={subcategorySearch}
            onChange={(e) => setSubcategorySearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#A47A46] focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {filteredCategoryItems.map((catItem) => {
            const isChecked = selectedCategories.some(
              (sel) =>
                sel.toLowerCase() === catItem.name.toLowerCase() ||
                sel === String(catItem.id)
            );
            return (
              <button
                key={catItem.id || catItem.name}
                type="button"
                onClick={() => handleCategoryChange(catItem.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isChecked
                    ? "bg-amber-50/70 text-[#A47A46] border border-amber-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <span>{catItem.name}</span>
                {isChecked && <Check size={13} className="text-[#A47A46]" />}
              </button>
            );
          })}
          {filteredCategoryItems.length === 0 && (
            <p className="text-center py-4 text-xs font-medium text-gray-400">
              No matching categories
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 text-slate-800 font-sans antialiased">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-wide">
            Our Collections
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Discover premium fabrics custom engineered for streetwear and lifestyle graphics.
          </p>
        </div>

        {(genderFromUrl || categoryFromUrl || subcategoryFromUrl || textSearchFromUrl) && (
          <span className="flex flex-wrap gap-1.5">
            {genderFromUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-[#A47A46] text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                Gender: {genderFromUrl}
              </span>
            )}
            {(categoryFromUrl || subcategoryFromUrl) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-[#A47A46] text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                Category: {categoryFromUrl || subcategoryFromUrl}
              </span>
            )}
            {textSearchFromUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-[#A47A46] text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                Search: "{textSearchFromUrl}"
              </span>
            )}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-[#A47A46] mb-2" />
          <p className="text-xs font-semibold text-gray-400">Loading catalog garments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-0 lg:gap-8 items-start">

          {/* Desktop Sidebar Filter */}
          <div className="hidden lg:block col-span-3 sticky top-28 z-20">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={16} className="text-[#A47A46]" />
                  <span className="font-bold text-[15px] tracking-wide text-gray-900">Filters</span>
                </div>
                {selectedCategories.length > 0 && (
                  <button onClick={clearAllFilters} className="text-xs font-bold text-gray-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="p-5">
                <FilterContents />
              </div>
            </div>
          </div>

          {/* Mobile Header Toolbar */}
          <div className="col-span-12 lg:hidden mb-3 sticky top-[92px] z-30 bg-white/95 backdrop-blur-md -mx-3 px-3 border-b border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 py-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategories.length > 0
                    ? "bg-[#A47A46] border-[#A47A46] text-white"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Filter</span>
                {selectedCategories.length > 0 && (
                  <span className="w-4 h-4 bg-white/30 text-white rounded-full text-[9px] flex items-center justify-center font-black">
                    {selectedCategories.length}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortOption(opt.value)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      sortOption === opt.value
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Products Grid */}
          <div className="col-span-12 lg:col-span-9">

            <div className="hidden lg:flex items-center justify-between gap-4 mb-6 bg-white p-3 px-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[13px] text-gray-500 font-semibold">
                {processedProducts.length} Premium Items
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400 font-medium mr-1 flex items-center gap-1">
                  <ArrowUpDown size={13} /> Sort:
                </span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortOption(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      sortOption === opt.value
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="block lg:hidden text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 px-0.5">
              {processedProducts.length} items
              {sortOption !== "relevant" && (
                <span className="ml-2 normal-case text-[#A47A46]">· {activeSortLabel}</span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              {processedProducts.map((product) => {
                const resolvedImages = Array.isArray(product.images) && product.images.length > 0
                  ? product.images.map(img => {
                      const raw = typeof img === 'object' && img !== null ? (img.url || img.secure_url) : img;
                      return formatImageUrl(raw);
                    }).filter(Boolean)
                  : [];

                const rawFallback = product.image || product.imageUrl || product.thumbnail;
                const resolvedFallback = formatImageUrl(rawFallback);

                const finalImages = resolvedImages.length > 0 
                  ? resolvedImages 
                  : (resolvedFallback ? [resolvedFallback] : []);

                const adaptedProduct = {
                  ...product,
                  id: product._id || product.id,
                  name: product.name || product.title,
                  basePrice: product.basePrice,
                  salePrice: product.salePrice,
                  price: product.salePrice && Number(product.salePrice) > 0 ? product.salePrice : (product.price || product.basePrice),
                  images: finalImages,
                  image: finalImages[0] || resolvedFallback,
                  imageUrl: finalImages[0] || resolvedFallback
                };

                return (
                  <div key={product.id || product._id} className="transform active:scale-[0.98] transition-transform duration-150">
                    <ProductCard product={adaptedProduct} />
                  </div>
                );
              })}
            </div>

            {processedProducts.length === 0 && (
              <div className="text-center py-12 lg:py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-2">
                <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={18} />
                </div>
                <h3 className="text-md font-bold text-gray-800">No Matching Products Found</h3>
                <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto px-4">
                  Try resetting the sidebar selections or changing your search criteria terms.
                </p>
                <button onClick={clearAllFilters} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative bg-white w-full rounded-t-[2rem] max-h-[90vh] flex flex-col shadow-2xl z-10 overflow-hidden">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />
            <div className="px-5 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#A47A46]" />
                <span className="font-extrabold text-[16px] text-gray-900">Filter Collections</span>
              </div>
              <div className="flex items-center gap-4">
                {selectedCategories.length > 0 && (
                  <button onClick={clearAllFilters} className="text-xs font-bold text-rose-500 underline underline-offset-2 cursor-pointer">
                    Clear All
                  </button>
                )}
                <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="px-4 py-4 overflow-y-auto">
              <FilterContents />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-[#A47A46] active:bg-[#8A6336] text-white text-center font-bold text-sm py-4 rounded-xl shadow-sm tracking-wide transition-colors cursor-pointer">
                Show {processedProducts.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;