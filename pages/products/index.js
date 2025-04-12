import { useState, useEffect } from "react"
import Head from "next/head"
import Image from "next/image"
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore"
import { db } from "../../lib/firebase"
import Layout from "../../components/Layout"
import { ChevronDown, Filter, Grid, List, Loader2 } from 'lucide-react'
import Link from "next/link"

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const productsCollection = collection(db, 'products');
      const productQuery = query(
        productsCollection,
        orderBy('index', 'desc'),
        limit(PRODUCTS_PER_PAGE)
      );

      try {
        const productsSnapshot = await getDocs(productQuery);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsList);

        // Extract unique categories and filter out undefined/null values
        const uniqueCategories = [...new Set(
          productsList
            .map(product => product.category)
            .filter(category => category !== undefined && category !== null && category !== '')
        )];
        
        setCategories(uniqueCategories);

        const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
        setLastVisible(lastDoc);

        setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please check your internet connection.");
      }
      setLoading(false);
    };

    initialFetch();
  }, []);
  
  const loadMoreProducts = async () => {
    if (!lastVisible) return;
    
    setLoading(true);
    const productsCollection = collection(db, 'products');
    const productQuery = query(
      productsCollection,
      orderBy('index', 'desc'),
      limit(PRODUCTS_PER_PAGE),
      startAfter(lastVisible)
    );

    try {
      const productsSnapshot = await getDocs(productQuery);
      const newProducts = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(prevProducts => [...prevProducts, ...newProducts]);

      const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      setError("Failed to load more products. Please try again.");
    }
    setLoading(false);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  return (
    <Layout>
      <Head>
        <title>Products | ASHE™</title>
        <meta name="description" content="Browse our collection of premium products." />
      </Head>
      
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] bg-[#46c7c7] mb-8">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Collection</h1>
          <p className="text-white text-lg md:text-xl max-w-xl">
            Discover our curated selection of authentic Tunisian craftsmanship
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 mb-24">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Category Tabs - Desktop */}
        <div className="hidden md:flex justify-center mb-8 border-b">
          <button 
            onClick={() => setSelectedCategory("all")}
            className={`px-6 py-3 font-medium text-sm uppercase tracking-wider transition-colors ${
              selectedCategory === "all" ? "border-b-2 border-[#46c7c7] text-[#46c7c7]" : "text-gray-600 hover:text-[#46c7c7]"
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 font-medium text-sm uppercase tracking-wider transition-colors ${
                selectedCategory === category ? "border-b-2 border-[#46c7c7] text-[#46c7c7]" : "text-gray-600 hover:text-[#46c7c7]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Mobile Filter Bar */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Category Filter */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-white">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedCategory === "all" 
                      ? "bg-[#46c7c7] text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === category 
                        ? "bg-[#46c7c7] text-white" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Display */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#46c7c7] animate-spin" />
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-lg">
                <h3 className="text-xl font-medium">No products found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or check back later for new products.
                </p>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8" 
                : "flex flex-col gap-4"
              }>
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.id}`} 
                    key={product.id}
                    className={`group ${viewMode === "grid" 
                      ? "flex flex-col" 
                      : "flex gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow"
                    }`}
                  >
                    <div className={`relative ${viewMode === "grid" 
                      ? "aspect-square w-full mb-3" 
                      : "w-24 h-24 flex-shrink-0"
                    } bg-gray-100 rounded-lg overflow-hidden`}>
                      {product.colors?.[0]?.images?.[0] ? (
                        <Image
                          src={product.colors[0].images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : product.images?.[0] ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      {product.category && (
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                          {product.category}
                        </span>
                      )}
                      <h3 className="font-medium text-gray-900 group-hover:text-[#46c7c7] transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold text-[#46c7c7]">
                          {product.price?.toFixed(2) || "0.00"} TND
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.originalPrice.toFixed(2)} TND
                          </span>
                        )}
                      </div>
                      
                      {viewMode === "list" && product.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreProducts}
                  disabled={loading}
                  className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Products</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}
