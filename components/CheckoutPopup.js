"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import PropTypes from "prop-types"
import { doc, addDoc, collection, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { auth, db } from "../lib/firebase"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import citiesData from "../data/cities.json"
import { Check, ChevronRight, ChevronLeft, X } from "lucide-react"

// PDF generation helper function
const generateInvoice = (order, userData) => {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const accentColor = [45, 45, 45] // Primary brand color
    let yPosition = 15

    // Set document properties
    doc.setProperties({
      title: `Invoice-${order.id}`,
      subject: "Invoice Receipt",
      author: "ASHE™",
      creator: "Ashe team",
    })

    // Enhanced Header Design
    doc.setFillColor(...accentColor)
    doc.rect(0, 0, pageWidth, 35, "F")
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text("ASHE™", pageWidth - 20, 25, { align: "right" })

    // Decorative line under header
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(15, 40, pageWidth - 15, 40)

    // Invoice Header Section
    yPosition = 50
    doc.setFontSize(14)
    doc.setTextColor(...accentColor)
    doc.setFont(undefined, "bold")
    doc.text(`INVOICE #${order.id}`, 15, yPosition)

    // Styled Date Formatting
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(
      `Issued: ${new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`,
      pageWidth - 15,
      yPosition,
      { align: "right" },
    )

    // From/To Cards with Background
    yPosition += 25
    const columnWidth = (pageWidth - 40) / 2

    // Company Info Card
    doc.setFillColor(245, 245, 245)
    doc.rect(15, yPosition - 5, columnWidth, 45, "F")
    doc.setTextColor(...accentColor)
    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("From:", 20, yPosition)
    doc.setFont(undefined, "normal")
    doc.text(`ASHE™\nTunisia\nPhone: +216 20 986 015\nEmail: contact@ashe.tn`, 20, yPosition + 5, {
      lineHeightFactor: 1.5,
    })

    // Client Info Card
    doc.setFillColor(245, 245, 245)
    doc.rect(25 + columnWidth, yPosition - 5, columnWidth, 45, "F")
    doc.setFont(undefined, "bold")
    doc.text("Bill To:", pageWidth - columnWidth - 10, yPosition)
    doc.setFont(undefined, "normal")
    const clientInfo = [
      order.shippingInfo.addressLine,
      `${order.shippingInfo.district}, ${order.shippingInfo.delegation}, ${order.shippingInfo.governorate}`,
      `Phone: ${userData.phone}`,
      `Client: ${userData.firstName} ${userData.lastName}`,
    ].join("\n")
    doc.text(clientInfo, pageWidth - columnWidth - 10, yPosition + 5, {
      lineHeightFactor: 1.5,
    })

    // Enhanced Items Table
    yPosition += 60
    const headers = [["Product", "Size", "Color", "Quantity", "Unit Price", "Total"]]
    const itemsData = order.items.map((item) => [
      { content: `${item.name}`, styles: { fontStyle: "bold" } },
      item.size,
      item.color,
      item.quantity,
      { content: `${item.price.toFixed(2)} TND`, styles: { halign: "right" } },
      { content: `${(item.quantity * item.price).toFixed(2)} TND`, styles: { halign: "right" } },
    ])

    // Calculate total amount
    const totalAmount = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const shippingFee = totalAmount > 200 ? 0 : 8.0 // Free shipping over 200 TND
    const grandTotal = totalAmount + shippingFee

    // Add the shipping row
    itemsData.push([
      { content: "Shipping", colSpan: 5, styles: { halign: "right" } },
      { content: `${shippingFee.toFixed(2)} TND`, styles: { halign: "right" } },
    ])

    // Styled Total Row
    itemsData.push([
      {
        content: "TOTAL",
        colSpan: 5,
        styles: {
          fontStyle: "bold",
          halign: "right",
          fillColor: accentColor,
          textColor: [255, 255, 255],
        },
      },
      {
        content: `${grandTotal.toFixed(2)} TND`,
        styles: {
          fontStyle: "bold",
          fillColor: accentColor,
          textColor: [255, 255, 255],
          halign: "right",
        },
      },
    ])

    doc.autoTable({
      startY: yPosition,
      head: headers,
      body: itemsData,
      theme: "striped",
      headStyles: {
        fillColor: accentColor,
        textColor: 255,
        fontSize: 12,
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold" }, // Product
        1: { cellWidth: 25, halign: "center" }, // Size
        2: { cellWidth: 25, halign: "center" }, // Color
        3: { cellWidth: 30, halign: "center" }, // Quantity
        4: { cellWidth: 30, halign: "right" }, // Unit Price
        5: { cellWidth: 30, halign: "right" }, // Total
      },
      margin: { horizontal: 15 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2,
      didDrawPage: (data) => {
        // Styled Page Number
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 20, 280, {
          align: "right",
        })
      },
    })

    // Enhanced Terms & Conditions
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.setLineWidth(0.3)
    doc.line(15, 260, pageWidth - 15, 260)
    const terms = [
      "Terms & Conditions:",
      "1. Payment is required upon shipment.",
      "2. You may request an exchange within 7 days of receiving the product.",
      "3. Items that have been worn, washed, or damaged cannot be returned or exchanged.",
    ].join("\n")
    doc.text(terms, 15, 265, {
      maxWidth: 180,
      lineHeightFactor: 1.4,
    })

    // Save PDF when button is clicked
    doc.save(`invoice-${order.id}.pdf`)
  } catch (error) {
    toast.error("Failed to generate invoice. Please try again or contact support.")
  }
}

// FormInput Component
const FormInput = ({ label, name, value, onChange, type = "text", required = true, children, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#46c7c7] focus:border-transparent"
        required={required}
        {...props}
      />
    )}
  </div>
)

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node,
}

// FormSelect Component for dropdowns
const FormSelect = ({ label, name, value, onChange, options, required = true, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#46c7c7] focus:border-transparent"
      required={required}
      {...props}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  required: PropTypes.bool,
}

// CheckoutPopup Component
export default function CheckoutPopup({ basketItems, onClose, onPlaceOrder }) {
  // Checkout steps
  const STEPS = {
    SHIPPING: "shipping",
    ACCOUNT: "account",
    CONFIRMATION: "confirmation",
  }

  const [currentStep, setCurrentStep] = useState(STEPS.SHIPPING)
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    governorate: "",
    delegation: "",
    district: "",
    addressLine: "",
  })

  const [accountData, setAccountData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    createAccount: false,
  })

  const [loading, setLoading] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [userDataForInvoice, setUserDataForInvoice] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // State for location data options
  const [locationOptions, setLocationOptions] = useState({
    governorates: [],
    delegations: [],
    districts: [],
  })

  const popupRef = useRef(null)

  const subtotal = useMemo(() => basketItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [basketItems])

  const shipping = subtotal > 200 ? 0 : 8.0 // Free shipping over 200 TND
  const totalAmount = subtotal + shipping

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true)
        // Pre-fill email if user is logged in
        setShippingData((prev) => ({
          ...prev,
          email: user.email || prev.email,
        }))

        // Fetch user data if available
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              setShippingData((prev) => ({
                ...prev,
                firstName: userData.firstName || prev.firstName,
                lastName: userData.lastName || prev.lastName,
                phone: userData.phone || prev.phone,
                // Add any other fields you want to pre-fill
              }))
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
          }
        }

        fetchUserData()
      } else {
        setIsLoggedIn(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Initialize governorates options on component mount
  useEffect(() => {
    try {
      const governorateOptions = citiesData.Tunisia.governorates.map((governorate) => ({
        value: governorate.name,
        label: governorate.name,
      }))

      setLocationOptions((prev) => ({
        ...prev,
        governorates: governorateOptions,
      }))
    } catch (error) {
      console.error("Error initializing governorates:", error)
      // Provide fallback options if data is missing
      setLocationOptions((prev) => ({
        ...prev,
        governorates: [
          { value: "Tunis", label: "Tunis" },
          { value: "Sfax", label: "Sfax" },
          { value: "Sousse", label: "Sousse" },
        ],
      }))
    }
  }, [])

  // Update delegation options when governorate changes
  useEffect(() => {
    if (!shippingData.governorate) {
      setLocationOptions((prev) => ({ ...prev, delegations: [], districts: [] }))
      setShippingData((prev) => ({ ...prev, delegation: "", district: "" }))
      return
    }

    try {
      const selectedGovernorate = citiesData.Tunisia.governorates.find((g) => g.name === shippingData.governorate)

      const delegationOptions =
        selectedGovernorate?.delegations?.map((delegation) => ({
          value: delegation.name,
          label: delegation.name,
        })) || []

      setLocationOptions((prev) => ({
        ...prev,
        delegations: delegationOptions,
        districts: [],
      }))

      setShippingData((prev) => ({ ...prev, delegation: "", district: "" }))
    } catch (error) {
      console.error("Error updating delegations:", error)
    }
  }, [shippingData.governorate])

  // Update district options when delegation changes
  useEffect(() => {
    if (!shippingData.governorate || !shippingData.delegation) {
      setLocationOptions((prev) => ({ ...prev, districts: [] }))
      setShippingData((prev) => ({ ...prev, district: "" }))
      return
    }

    try {
      const selectedGovernorate = citiesData.Tunisia.governorates.find((g) => g.name === shippingData.governorate)

      const selectedDelegation = selectedGovernorate?.delegations?.find((d) => d.name === shippingData.delegation)

      const districtOptions =
        selectedDelegation?.cities?.map((city) => ({
          value: city,
          label: city,
        })) || []

      setLocationOptions((prev) => ({
        ...prev,
        districts: districtOptions,
      }))

      setShippingData((prev) => ({ ...prev, district: "" }))
    } catch (error) {
      console.error("Error updating districts:", error)
    }
  }, [shippingData.governorate, shippingData.delegation])

  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingData((prev) => ({ ...prev, [name]: value }))

    // Also update account email if shipping email changes
    if (name === "email") {
      setAccountData((prev) => ({ ...prev, email: value }))
    }
  }

  const handleAccountChange = (e) => {
    const { name, value, type, checked } = e.target
    setAccountData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const validateShippingForm = () => {
    const { firstName, lastName, email, phone, governorate, delegation, district, addressLine } = shippingData

    if (!firstName || !lastName || !email || !phone || !governorate || !delegation || !district || !addressLine) {
      toast.error("Please fill in all required fields")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return false
    }

    // Basic phone validation
    const phoneRegex = /^\d{8,}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid phone number (at least 8 digits)")
      return false
    }

    return true
  }

  const validateAccountForm = () => {
    if (!accountData.createAccount) {
      return true
    }

    if (!accountData.password) {
      toast.error("Please enter a password")
      return false
    }

    if (accountData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return false
    }

    if (accountData.password !== accountData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (currentStep === STEPS.SHIPPING) {
      if (!validateShippingForm()) return

      // If user is logged in, skip account step
      if (isLoggedIn) {
        setCurrentStep(STEPS.CONFIRMATION)
      } else {
        setCurrentStep(STEPS.ACCOUNT)
      }
    } else if (currentStep === STEPS.ACCOUNT) {
      if (!validateAccountForm()) return
      setCurrentStep(STEPS.CONFIRMATION)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === STEPS.ACCOUNT) {
      setCurrentStep(STEPS.SHIPPING)
    } else if (currentStep === STEPS.CONFIRMATION) {
      if (isLoggedIn) {
        setCurrentStep(STEPS.SHIPPING)
      } else {
        setCurrentStep(STEPS.ACCOUNT)
      }
    }
  }

  const createUserAccount = async () => {
    if (!accountData.createAccount) return null

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, accountData.email, accountData.password)

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        email: shippingData.email,
        phone: shippingData.phone,
        createdAt: new Date().toISOString(),
      })

      toast.success("Account created successfully! Please check your email for verification.")
      return userCredential.user
    } catch (error) {
      console.error("Error creating account:", error)
      toast.error(error.message || "Failed to create account")
      return null
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      let user = auth.currentUser

      // If not logged in but wants to create account
      if (!user && accountData.createAccount) {
        user = await createUserAccount()
      }

      // Prepare order data
      const orderData = {
        userInfo: {
          id: user ? user.uid : "guest",
          name: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
          phone: shippingData.phone,
        },
        shippingInfo: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          governorate: shippingData.governorate,
          delegation: shippingData.delegation,
          district: shippingData.district,
          addressLine: shippingData.addressLine,
        },
        paymentInfo: {
          method: "cash",
        },
        items: basketItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        subtotal,
        shipping,
        totalAmount,
        createdAt: new Date().toISOString(),
        status: "New",
      }

      // Create the order document
      const docRef = await addDoc(collection(db, "orders"), orderData)
      const orderWithId = { ...orderData, id: docRef.id }

      // Send email notification to admin
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: orderWithId }),
        })
      } catch (emailError) {
        console.error("Email notification error:", emailError)
        toast.error("Admin failed to receive notification, but your order was placed successfully")
      }

      // Update the stock for each ordered product
      await Promise.all(
        basketItems.map(async (item) => {
          const productRef = doc(db, "products", item.id)
          const productDoc = await getDoc(productRef)

          if (productDoc.exists()) {
            const productData = productDoc.data()
            const colorIndex = productData.colors.findIndex((color) => color.name === item.color)

            if (
              colorIndex !== -1 &&
              productData.colors[colorIndex].stock &&
              productData.colors[colorIndex].stock[item.size] !== undefined
            ) {
              // Create a new colors array with updated stock for the matched color
              const newColors = productData.colors.map((color, idx) => {
                if (idx === colorIndex) {
                  return {
                    ...color,
                    stock: {
                      ...color.stock,
                      [item.size]: color.stock[item.size] - item.quantity,
                    },
                  }
                }
                return color
              })
              await updateDoc(productRef, { colors: newColors })
            } else {
              console.warn(`Size ${item.size} or color ${item.color} not found for product ${item.id}`)
            }
          }
        }),
      )

      // Save order details in state
      setPlacedOrder(orderWithId)
      setUserDataForInvoice({
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        phone: shippingData.phone,
      })

      onPlaceOrder(orderWithId)
      toast.success("Order placed successfully!")
    } catch (error) {
      console.error("Order error:", error)
      toast.error(error.message || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // If order has been placed, show the confirmation and Download Invoice button
  if (placedOrder) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-md p-8 shadow-xl rounded-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600">
              Your order <span className="font-semibold">#{placedOrder.id}</span> has been placed successfully.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>{subtotal.toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping:</span>
              <span>{shipping === 0 ? "Free" : `${shipping.toFixed(2)} TND`}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{totalAmount.toFixed(2)} TND</span>
            </div>
          </div>

          <button
            onClick={() => generateInvoice(placedOrder, userDataForInvoice)}
            className="w-full py-3 mb-4 bg-black text-white rounded-lg hover:bg-[#46c7c7] transition-colors flex items-center justify-center gap-2"
          >
            <span>Download Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  // Order Summary Component
  const OrderSummary = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-lg mb-4">Order Summary</h3>

      {basketItems.map((item, index) => (
        <div key={index} className="flex justify-between mb-3 text-sm">
          <div className="flex-1">
            <span className="font-medium">{item.name}</span>
            <div className="text-gray-500">
              {item.size && `Size: ${item.size}`}
              {item.size && item.color && ", "}
              {item.color && `Color: ${item.color}`}
              {` × ${item.quantity}`}
            </div>
          </div>
          <span className="font-medium">{(item.price * item.quantity).toFixed(2)} TND</span>
        </div>
      ))}

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span>{subtotal.toFixed(2)} TND</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Shipping</span>
          <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `${shipping.toFixed(2)} TND`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} TND</span>
        </div>
      </div>
    </div>
  )

  // Progress indicator
  const ProgressIndicator = () => {
    const steps = [
      { id: STEPS.SHIPPING, label: "Shipping" },
      { id: STEPS.CONFIRMATION, label: "Confirmation" },
    ]

    // If user is not logged in, add account step
    if (!isLoggedIn) {
      steps.splice(1, 0, { id: STEPS.ACCOUNT, label: "Account" })
    }

    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? "bg-[#46c7c7] text-white"
                    : index < steps.findIndex((s) => s.id === currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < steps.findIndex((s) => s.id === currentStep) ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="text-xs mt-1">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-[#46c7c7] transition-all"
            style={{
              width: `${(steps.findIndex((s) => s.id === currentStep) / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div
        ref={popupRef}
        className="bg-white w-full max-w-6xl h-[90vh] flex flex-col lg:grid lg:grid-cols-5 shadow-xl rounded-lg overflow-hidden"
      >
        {/* Left Panel - Order Summary */}
        <div className="lg:col-span-2 bg-gray-50 p-6 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-all"
            aria-label="Close checkout"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-bold">ASHE™</h1>
            <p className="text-gray-500">Secure Checkout</p>
          </div>

          <OrderSummary />

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free shipping on orders over 200 TND</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>7-day return policy</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Checkout Form */}
        <div className="lg:col-span-3 p-6 overflow-y-auto">
          <ProgressIndicator />

          {/* Shipping Information Step */}
          {currentStep === STEPS.SHIPPING && (
            <div>
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={shippingData.firstName}
                  onChange={handleShippingChange}
                  placeholder="John"
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={shippingData.lastName}
                  onChange={handleShippingChange}
                  placeholder="Doe"
                />
              </div>

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={shippingData.email}
                onChange={handleShippingChange}
                placeholder="your@email.com"
              />

              <FormInput
                label="Phone"
                name="phone"
                value={shippingData.phone}
                onChange={handleShippingChange}
                placeholder="e.g., 20123456"
              />

              <FormSelect
                label="Governorate"
                name="governorate"
                value={shippingData.governorate}
                onChange={handleShippingChange}
                options={locationOptions.governorates}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Delegation"
                  name="delegation"
                  value={shippingData.delegation}
                  onChange={handleShippingChange}
                  options={locationOptions.delegations}
                  disabled={!shippingData.governorate}
                />

                <FormSelect
                  label="District"
                  name="district"
                  value={shippingData.district}
                  onChange={handleShippingChange}
                  options={locationOptions.districts}
                  disabled={!shippingData.delegation}
                />
              </div>

              <FormInput
                label="Address Line"
                name="addressLine"
                value={shippingData.addressLine}
                onChange={handleShippingChange}
                placeholder="Street name, building number, apartment, etc."
              />
            </div>
          )}

          {/* Account Creation Step (only for non-logged in users) */}
          {currentStep === STEPS.ACCOUNT && (
            <div>
              <h2 className="text-xl font-bold mb-6">Create an Account (Optional)</h2>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    id="createAccount"
                    name="createAccount"
                    type="checkbox"
                    checked={accountData.createAccount}
                    onChange={handleAccountChange}
                    className="w-4 h-4 text-[#46c7c7] border-gray-300 rounded focus:ring-[#46c7c7]"
                  />
                  <label htmlFor="createAccount" className="ml-2 text-sm font-medium text-gray-700">
                    Create an account for faster checkout next time
                  </label>
                </div>

                {accountData.createAccount && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">
                      Your account will be created with the email: <strong>{shippingData.email}</strong>
                    </p>

                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      value={accountData.password}
                      onChange={handleAccountChange}
                      placeholder="Create a password"
                    />

                    <FormInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={accountData.confirmPassword}
                      onChange={handleAccountChange}
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Confirmation Step */}
          {currentStep === STEPS.CONFIRMATION && (
            <div>
              <h2 className="text-xl font-bold mb-6">Confirm Your Order</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <p>
                    {shippingData.firstName} {shippingData.lastName}
                  </p>
                  <p>{shippingData.addressLine}</p>
                  <p>
                    {shippingData.district}, {shippingData.delegation}
                  </p>
                  <p>{shippingData.governorate}</p>
                  <p>Phone: {shippingData.phone}</p>
                  <p>Email: {shippingData.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <p>Cash on Delivery</p>
                  <p className="text-sm text-gray-600 mt-1">You will pay when your order is delivered.</p>
                </div>

                {!isLoggedIn && accountData.createAccount && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Account</h3>
                    <p>An account will be created with your email address</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep !== STEPS.SHIPPING ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            )}

            {currentStep !== STEPS.CONFIRMATION ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-[#46c7c7] transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-[#46c7c7] transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Place Order</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CheckoutPopup.propTypes = {
  basketItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      size: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onPlaceOrder: PropTypes.func.isRequired,
}
