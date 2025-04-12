"use client"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import Layout from "../components/Layout"
import { useRouter } from "next/router"
import { toast } from "sonner"
import Image from "next/image"
import { useBasket } from "../contexts/BasketContext"
import Head from "next/head"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check } from "lucide-react"

export default function Basket() {
  const { updateItemQuantity, basketItems, basketCount, loadBasketFromCookies, removeItemFromBasket } = useBasket()
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const router = useRouter()

  // Fetch authenticated user and set basket on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true)
      if (user) {
        // Fetch user info and basket from Firestore
        await fetchUserInfo(user.uid)
      } else {
        // Load basket from cookies for unauthenticated users
        loadBasketFromCookies()
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch user information from Firestore
  const fetchUserInfo = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId)
      const userSnapshot = await getDoc(userDocRef)
      if (userSnapshot.exists()) {
        setUserInfo(userSnapshot.data())
      } else {
        toast.error("User info not found.")
      }
    } catch (error) {
      toast.error("Error fetching user info:", error)
    }
  }

  // Calculate totals
  const subtotal = basketItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 200 ? 0 : 10 // Free shipping over 200 TND
  const total = subtotal + shipping

  // Proceed to checkout - no login required
  const proceedToCheckout = () => {
    // Store a flag in session storage to indicate we're coming from basket
    sessionStorage.setItem("fromBasket", "true")
    // Navigate to the checkout page
    router.push("/checkout")
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#46c7c7]"></div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>Shopping Cart | ASHE™</title>
        <meta
          name="description"
          content="Your curated selection of authentic Tunisian craftsmanship. Review your ASHE items, modify quantities, and proceed to secure checkout."
        />
      </Head>
      <Layout>
        <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">Review your items before checkout</p>
            </header>

            {basketCount === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center flex flex-col items-center space-y-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-medium text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <button
                  onClick={() => router.push("/products")}
                  className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#46c7c7] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-medium text-gray-900">Cart Items ({basketCount})</h2>
                    </div>

                    <ul className="divide-y divide-gray-200">
                      {basketItems.map((item, index) => (
                        <li
                          key={`${item.id}-${item.size}-${item.color}-${index}`}
                          className="p-6 flex flex-col sm:flex-row gap-4 animate-fadeIn"
                        >
                          {/* Product Image */}
                          <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item?.images?.[0] || "/placeholder-art.svg"}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-art.svg"
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.size && `Size: ${item.size.toUpperCase()}`}
                                  {item.size && item.color && ", "}
                                  {item.color && `Color: ${item.color}`}
                                </p>
                              </div>
                              <p className="text-base font-medium text-[#46c7c7]">
                                {(item.price * item.quantity).toFixed(2)} TND
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() =>
                                    updateItemQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))
                                  }
                                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeItemFromBasket(item.id, item.size, item.color)}
                                className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between text-base">
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">{subtotal.toFixed(2)} TND</p>
                      </div>

                      <div className="flex justify-between text-base">
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Free
                            </span>
                          ) : (
                            `${shipping.toFixed(2)} TND`
                          )}
                        </p>
                      </div>

                      {shipping > 0 && (
                        <div className="text-sm text-gray-500 italic">Free shipping on orders over 200 TND</div>
                      )}

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <p>Total</p>
                          <p className="text-[#46c7c7]">{total.toFixed(2)} TND</p>
                        </div>
                      </div>

                      <button
                        onClick={proceedToCheckout}
                        className="w-full mt-6 py-3 bg-black text-white rounded-lg hover:bg-[#46c7c7] transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => router.push("/products")}
                        className="w-full mt-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>

                    <div className="bg-gray-50 p-6 border-t">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Secure checkout</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Free returns within 7 days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Customer support available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Custom styles for fade-in animation */}
        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Layout>
    </>
  )
}
