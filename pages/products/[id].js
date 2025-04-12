"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { doc, getDoc, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../../lib/firebase"
import Layout from "../../components/Layout"
import { Swiper, SwiperSlide } from "swiper/react"
import { Zoom, EffectFade, Navigation, Thumbs } from "swiper/modules"
import {
  Heart,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Check,
  Truck,
  RefreshCw,
  Shield,
  Star,
  Share2,
  MessageSquare,
} from "lucide-react"
import "swiper/css"
import "swiper/css/zoom"
import "swiper/css/effect-fade"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import { useBasket } from "../../contexts/BasketContext"
import { toast } from "sonner"
import { useAuth } from "../../contexts/AuthContext"

export default function ProductPage({ product, relatedProducts, reviews }) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const { addItem: addToBasket, getItemQuantity } = useBasket()
  const mainSwiperRef = useRef(null)
  const modalSwiperRef = useRef(null)
  const [quantity, setQuantity] = useState(1)
  const [user] = useAuth(auth)
  const [productReviews, setProductReviews] = useState(reviews || [])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get available sizes from stock
  const selectedColorData = product?.colors?.find((color) => color.name === selectedColor)
  const images = selectedColorData?.images || product?.images || []

  // Initialize selected color when product loads
  useEffect(() => {
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0].name)
    }
  }, [product])

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === "Escape") {
          closeModal()
        } else if (e.key === "ArrowLeft") {
          modalSwiperRef.current?.slidePrev()
        } else if (e.key === "ArrowRight") {
          modalSwiperRef.current?.slideNext()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  const handleSizeChange = (size) => {
    setSelectedSize(size)
    setError("")
  }

  const handleColorChange = (color) => {
    setSelectedColor(color)
    setError("")
  }

  const openModal = (index) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = "unset"
  }

  const handleAddToBasket = useCallback(() => {
    if (!selectedSize && product?.sizes?.length > 0) {
      setError("Please select a size before adding to the basket.")
      return
    }

    if (!selectedColor && product?.colors?.length > 0) {
      setError("Please select a color before adding to the basket.")
      return
    }

    // Handle case where colors array exists
    if (product?.colors?.length > 0) {
      const selectedColorData = product.colors.find((color) => color.name === selectedColor)
      if (!selectedColorData) {
        setError("Selected color is not available.")
        return
      }

      // Check if the size exists in the stock
      if (!selectedColorData.stock || !selectedColorData.stock[selectedSize]) {
        setError("Selected size is not available in this color.")
        return
      }

      const selectedSizeStock = selectedColorData.stock[selectedSize] || 0
      const currentBasketQty = getItemQuantity(product.id, selectedSize, selectedColor) || 0
      const availableForUser = selectedSizeStock - currentBasketQty

      if (quantity > availableForUser) {
        setError(`You cannot add more than the available stock (${availableForUser}).`)
        return
      }

      setError("")
      for (let i = 0; i < quantity; i++) {
        addToBasket({
          ...product,
          size: selectedSize,
          color: selectedColor,
          images: selectedColorData.images,
        })
      }
      toast.success(`${quantity} ${product.name} added to your basket`)
    } else {
      // For products without color options
      const currentBasketQty = getItemQuantity(product.id, selectedSize) || 0
      const availableForUser = (product.stock?.[selectedSize] || 0) - currentBasketQty

      if (quantity > availableForUser) {
        setError(`You cannot add more than the available stock (${availableForUser}).`)
        return
      }

      setError("")
      for (let i = 0; i < quantity; i++) {
        addToBasket({
          ...product,
          size: selectedSize,
        })
      }
      toast.success(`${quantity} ${product.name} added to your basket`)
    }
  }, [selectedSize, selectedColor, product, getItemQuantity, addToBasket, quantity])

  // Calculate discount percentage if original price exists
  const calculateDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!productReviews || productReviews.length === 0) return 0
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / productReviews.length).toFixed(1)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error("You must be logged in to leave a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewText.trim()) {
      toast.error("Please enter a review")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if user has already reviewed this product
      const existingReviewQuery = query(
        collection(db, "reviews"),
        where("productId", "==", product.id),
        where("userId", "==", user.uid),
      )

      const existingReviewSnapshot = await getDocs(existingReviewQuery)

      if (!existingReviewSnapshot.empty) {
        toast.error("You have already reviewed this product")
        setIsSubmitting(false)
        return
      }

      // Add the review to Firestore
      const reviewData = {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || `${user.email.split("@")[0]}`,
        rating,
        text: reviewText,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "reviews"), reviewData)

      // Add the new review to the state
      const newReview = {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date().toISOString(),
      }

      setProductReviews([...productReviews, newReview])
      setReviewText("")
      setRating(0)
      setShowReviewForm(false)

      toast.success("Review submitted successfully")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, value)
    setQuantity(newQuantity)
  }

  if (!product) {
    return (
      <Layout>
        <Head>
          <title>Product Not Found | ASHE™</title>
        </Head>
        <main className="container mx-auto px-4 py-12 mb-24">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products">
              <p className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-lg">Browse All Products</p>
            </Link>
          </div>
        </main>
      </Layout>
    )
  }

  const { name, price, originalPrice, colors = [], description, stock = {}, sizes = [] } = product
  const discountPercentage = calculateDiscountPercentage(originalPrice, price)

  // Get available sizes for the selected color
  const availableSizes = selectedColorData?.stock
    ? Object.keys(selectedColorData.stock).filter((size) => selectedColorData.stock[size] > 0)
    : Object.keys(stock).filter((size) => stock[size] > 0)

  const selectedSizeStock = selectedColorData?.stock?.[selectedSize] || stock?.[selectedSize] || 0
  const currentBasketQty = selectedSize ? getItemQuantity(product.id, selectedSize, selectedColor) : 0
  const availableForUser = selectedSizeStock - currentBasketQty
  const allSizesOutOfStock = availableSizes.length === 0
  const averageRating = calculateAverageRating()

  return (
    <Layout>
      <Head>
        <title>{name} | ASHE™</title>
        <meta name="description" content={description || "View product details"} />
      </Head>

      <main className="container mx-auto px-4 py-8 mb-24">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#46c7c7] transition-colors">
            Home
          </Link>{" "}
          /
          <Link href="/products" className="hover:text-[#46c7c7] transition-colors">
            {" "}
            Products
          </Link>{" "}
          /<span className="text-black"> {name}</span>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Product Images - Left Column */}
            <div className="md:col-span-1 lg:col-span-3 relative">
              {/* Main Image Slider */}
              <div className="relative">
                {/* Discount Badge */}
                {discountPercentage && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    -{discountPercentage}%
                  </div>
                )}

                {images.length > 0 ? (
                  <Swiper
                    onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                    spaceBetween={0}
                    slidesPerView={1}
                    effect="fade"
                    loop={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[EffectFade, Thumbs, Navigation]}
                    fadeEffect={{ crossFade: true }}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    className="w-full aspect-square"
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={`image-${index}`}>
                        <div className="relative w-full h-full">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${name} - Image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                            className="object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                            onClick={() => openModal(index)}
                          />
                        </div>
                      </SwiperSlide>
                    ))}

                    {/* Custom Navigation Buttons */}
                    <button className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => openModal(mainSwiperRef.current?.activeIndex || 0)}
                      className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      aria-label="View fullscreen"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </Swiper>
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4 px-2">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView="auto"
                    watchSlidesProgress={true}
                    modules={[Thumbs]}
                    className="thumbnails-slider"
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={`thumb-${index}`} className="w-20 h-20">
                        <div className="relative w-full h-full cursor-pointer rounded-md overflow-hidden border-2 hover:border-[#46c7c7] transition-colors">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Product Info - Right Column */}
            <div className="md:col-span-1 lg:col-span-2 p-6 lg:p-8 flex flex-col">
              {product.category && (
                <div className="mb-2">
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">{product.category}</span>
                </div>
              )}

              <h1 className="text-3xl font-bold mb-2">{name}</h1>

              {/* Rating Display */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={`${
                        star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {averageRating > 0 ? (
                    <>
                      {averageRating} ({productReviews.length} {productReviews.length === 1 ? "review" : "reviews"})
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="ml-3 text-sm text-[#46c7c7] hover:underline flex items-center"
                  >
                    <MessageSquare size={14} className="mr-1" />
                    {showReviewForm ? "Cancel" : "Write a review"}
                  </button>
                )}
              </div>

              {/* Enhanced Price Display */}
              <div className="flex items-center gap-3 mb-6">
                {originalPrice && originalPrice > price ? (
                  <>
                    <p className="text-2xl font-bold text-[#46c7c7]">{price?.toFixed(2)} TND</p>
                    <p className="text-lg font-medium text-gray-500 line-through">{originalPrice?.toFixed(2)} TND</p>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                      SAVE {(originalPrice - price).toFixed(2)} TND
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-[#46c7c7]">{price?.toFixed(2)} TND</p>
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="prose prose-sm mb-6 text-gray-600">
                  <p>{description}</p>
                </div>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">Color</label>
                    {selectedColor && <span className="text-sm text-gray-500">{selectedColor}</span>}
                  </div>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color.name)}
                        className={`w-10 h-10 rounded-full ${
                          selectedColor === color.name ? "ring-2 ring-offset-2 ring-[#46c7c7]" : "ring-1 ring-gray-300"
                        }`}
                        style={{ backgroundColor: color.code }}
                        aria-label={`Select ${color.name}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">Size</label>
                    {selectedSize && <span className="text-sm text-gray-500">{selectedSize.toUpperCase()}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-2 rounded-md border ${
                          selectedSize === size
                            ? "border-[#46c7c7] bg-[#46c7c7] text-white"
                            : "border-gray-300 hover:border-[#46c7c7]"
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <div className="mt-2">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          availableForUser > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {availableForUser > 0 ? (
                          <span className="flex items-center gap-1">
                            <Check size={14} />
                            {availableForUser} in stock
                          </span>
                        ) : (
                          "Out of stock"
                        )}
                      </span>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-500 text-sm mt-2" aria-live="polite">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="font-medium text-gray-700 block mb-2">Quantity</label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-l-md hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center rounded-r-md hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {allSizesOutOfStock ? (
                  <button className="w-full py-4 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium">
                    SOLD OUT
                  </button>
                ) : (
                  <button
                    onClick={handleAddToBasket}
                    disabled={!selectedSize || (colors.length > 0 && !selectedColor) || availableForUser <= 0}
                    className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center transition-all ${
                      !selectedSize || (colors.length > 0 && !selectedColor) || availableForUser <= 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:bg-[#46c7c7]"
                    }`}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Basket
                  </button>
                )}
                <button className="py-3 px-4 border border-gray-300 rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </button>
                <button className="py-3 px-4 border border-gray-300 rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-[#46c7c7]" />
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-sm text-gray-500">On orders over 200 TND</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-[#46c7c7]" />
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-sm text-gray-500">7-day return policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-[#46c7c7]" />
                    <div>
                      <p className="font-medium">Secure Checkout</p>
                      <p className="text-sm text-gray-500">Protected payment process</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {rating > 0 ? `You rated this ${rating} ${rating === 1 ? "star" : "stars"}` : "Select a rating"}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="review-text"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#46c7c7] focus:border-[#46c7c7]"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0 || !reviewText.trim()}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-[#46c7c7] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {productReviews.length > 0 ? (
            <div className="space-y-6">
              {productReviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium">
                        {review.userName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={`${
                                star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-2">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
              {user ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#46c7c7]"
                >
                  Write a Review
                </button>
              ) : (
                <Link href="/login">
                  <p className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#46c7c7] inline-block">
                    Login to Write a Review
                  </p>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link href={`/products/${relatedProduct.id}`} key={relatedProduct.id} className="group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {relatedProduct.colors?.[0]?.images && relatedProduct.colors.length > 0 ? (
                      <Image
                        src={relatedProduct.colors[0].images[0] || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : relatedProduct.images?.[0] ? (
                      <Image
                        src={relatedProduct.images[0] || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}

                    {/* Discount Badge */}
                    {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(
                          ((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100,
                        )}
                        % OFF
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-[#46c7c7] transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-[#46c7c7]">{relatedProduct.price?.toFixed(2) || "0.00"} TND</span>
                    {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {relatedProduct.originalPrice.toFixed(2)} TND
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Image Slider */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        >
          <div
            className="fixed inset-0"
            onClick={closeModal}
            aria-label="Close modal"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && closeModal()}
          />
          <div className="relative w-full h-full max-w-full max-h-full bg-transparent flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close image modal"
            >
              <X className="text-white w-6 h-6" />
            </button>

            <div className="relative w-full h-full">
              <Swiper
                initialSlide={selectedImageIndex}
                onSwiper={(swiper) => (modalSwiperRef.current = swiper)}
                effect="fade"
                loop={true}
                modules={[EffectFade, Zoom, Navigation]}
                fadeEffect={{ crossFade: true }}
                onZoomChange={(swiper, scale) => setIsZoomed(scale > 1)}
                zoom={{ maxRatio: 3, toggle: true }}
                navigation={{
                  nextEl: ".modal-button-next",
                  prevEl: ".modal-button-prev",
                }}
                onDoubleTap={(swiper) => {
                  if (swiper.zoom.scale > 1) {
                    swiper.zoom.out()
                  } else {
                    swiper.zoom.in()
                  }
                }}
                className="h-full w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={`modal-image-${index}`} className="flex items-center justify-center">
                    <div className="swiper-zoom-container relative flex items-center justify-center w-full h-full">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Enlarged view of ${name} - Image ${index + 1}`}
                        fill
                        sizes="100vw"
                        priority
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button
                className="modal-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 bg-white/20 text-white rounded-full md:left-24 hover:bg-white/30 flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="modal-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 bg-white/20 text-white rounded-full md:right-24 hover:bg-white/30 flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 flex items-center justify-center"
                onClick={() => modalSwiperRef.current?.zoom.toggle()}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

// Fetch data on server side
export async function getServerSideProps({ params }) {
  try {
    const { id } = params

    // Fetch the product
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      return { props: { product: null, relatedProducts: [] } }
    }

    const product = {
      id: productSnap.id,
      ...productSnap.data(),
    }

    // Fetch reviews for this product
    const reviewsQuery = query(collection(db, "reviews"), where("productId", "==", id), orderBy("createdAt", "desc"))

    const reviewsSnapshot = await getDocs(reviewsQuery)
    const reviews = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }))

    // Fetch related products (same category)
    let relatedProducts = []

    if (product.category) {
      const productsCollection = collection(db, "products")
      const productsSnapshot = await getDocs(productsCollection)

      relatedProducts = productsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((p) => p.category === product.category && p.id !== id)
        .slice(0, 4)
    }

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
        reviews: JSON.parse(JSON.stringify(reviews)),
      },
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return {
      props: { product: null, relatedProducts: [], reviews: [] },
    }
  }
}
