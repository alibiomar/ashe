import { useState, useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, addDoc, collection, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';
import citiesData from '../data/cities.json';


// PDF generation helper function
const generateInvoice = (order, userData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const accentColor = [45, 45, 45]; // Primary brand color
    let yPosition = 15;

    // Set document properties
    doc.setProperties({
      title: `Invoice-${order.id}`,
      subject: 'Invoice Receipt',
      author: 'ASHE™',
      creator: 'Ashe team'
    });

    // Enhanced Header Design
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("ASHE™", pageWidth - 20, 25, { align: 'right' });

    // Decorative line under header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 40, pageWidth - 15, 40);

    // Invoice Header Section
    yPosition = 50;
    doc.setFontSize(14);
    doc.setTextColor(...accentColor);
    doc.setFont(undefined, 'bold');
    doc.text(`INVOICE #${order.id}`, 15, yPosition);

    // Styled Date Formatting
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Issued: ${new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`, pageWidth - 15, yPosition, { align: 'right' });

    // From/To Cards with Background
    yPosition += 25;
    const columnWidth = (pageWidth - 40) / 2;

    // Company Info Card
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPosition - 5, columnWidth, 45, 'F');
    doc.setTextColor(...accentColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("From:", 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(`ASHE™\nTunisia\nPhone: +216 20 986 015\nEmail: contact@ashe.tn`,
      20, yPosition + 5, { lineHeightFactor: 1.5 });

    // Client Info Card
    doc.setFillColor(245, 245, 245);
    doc.rect(25 + columnWidth, yPosition - 5, columnWidth, 45, 'F');
    doc.setFont(undefined, 'bold');
    doc.text("Bill To:", pageWidth - columnWidth - 10, yPosition);
    doc.setFont(undefined, 'normal');
    const clientInfo = [
      order.shippingInfo.addressLine,
      `${order.shippingInfo.district}, ${order.shippingInfo.delegation}, ${order.shippingInfo.governorate}`,
      `Phone: ${userData.phone}`,
      `Client: ${userData.firstName} ${userData.lastName}`
    ].join('\n');
    doc.text(clientInfo, pageWidth - columnWidth - 10, yPosition + 5, {
      lineHeightFactor: 1.5
    });

    // Enhanced Items Table
    yPosition += 60;
    const headers = [['Product', 'Size', 'Color', 'Quantity', 'Unit Price', 'Total']];
    const itemsData = order.items.map(item => [
      { content: `${item.name}`, styles: { fontStyle: 'bold' }},
      item.size,
      item.color,
      item.quantity,
      { content: `${item.price.toFixed(2)} TND`, styles: { halign: 'right' }},
      { content: `${(item.quantity * item.price).toFixed(2)} TND`, styles: { halign: 'right' }}
    ]);

    // Calculate total amount
    const totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const shippingFee = totalAmount > 200 ? 0 : 8.00; // Free shipping over 200 TND
    const grandTotal = totalAmount + shippingFee;

    // Add the shipping row
    itemsData.push([
      { content: 'Shipping', colSpan:5, styles: { halign: 'right' }},
      { content: `${shippingFee.toFixed(2)} TND`, styles: { halign: 'right' }}
    ]);

    // Styled Total Row
    itemsData.push([
      {
        content: 'TOTAL',
        colSpan: 5,
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          fillColor: accentColor,
          textColor: [255, 255, 255]
        }
      },
      {
        content: `${grandTotal.toFixed(2)} TND`,
        styles: {
          fontStyle: 'bold',
          fillColor: accentColor,
          textColor: [255, 255, 255],
          halign: 'right'
        }
      }
    ]);

    doc.autoTable({
      startY: yPosition,
      head: headers,
      body: itemsData,
      theme: 'striped',
      headStyles: {
        fillColor: accentColor,
        textColor: 255,
        fontSize: 12,
        cellPadding: 5
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },  // Product
        1: { cellWidth: 25, halign: 'center' },   // Size
        2: { cellWidth: 25, halign: 'center' },   // Color
        3: { cellWidth: 30, halign: 'center' },   // Quantity
        4: { cellWidth: 30, halign: 'right' },    // Unit Price
        5: { cellWidth: 30, halign: 'right' }     // Total
      },
      margin: { horizontal: 15 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.2,
      didDrawPage: (data) => {
        // Styled Page Number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 20, 280, {
          align: 'right'
        });
      }
    });

    // Enhanced Terms & Conditions
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setLineWidth(0.3);
    doc.line(15, 260, pageWidth - 15, 260);
    const terms = [
      "Terms & Conditions:",
      "1. Payment is required upon shipment.",
      "2. You may request an exchange within 7 days of receiving the product.",
      "3. Items that have been worn, washed, or damaged cannot be returned or exchanged."
    ].join('\n');
    doc.text(terms, 15, 265, {
      maxWidth: 180,
      lineHeightFactor: 1.4
    });

    // Save PDF when button is clicked
    doc.save(`invoice-${order.id}.pdf`);
  } catch (error) {
    toast.error('Failed to generate invoice. Please try again or contact support.');
  }
};


// FormInput Component
const FormInput = ({ label, name, value, onChange, type = 'text', required = true, children, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none placeholder-gray-400 text-base bg-transparent"
        required={required}
        {...props}
      />
    )}
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node,
};

// FormSelect Component for dropdowns
const FormSelect = ({ label, name, value, onChange, options, required = true, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none placeholder-gray-400 text-base bg-transparent"
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
);

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  required: PropTypes.bool,
};

// CheckoutPopup Component
export default function CheckoutPopup({ basketItems, onClose, onPlaceOrder }) {
  const [formData, setFormData] = useState({
    governorate: '',
    delegation: '',
    district: '',
    addressLine: '',
  });

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [userDataForInvoice, setUserDataForInvoice] = useState(null);

  // State for location data options
  const [locationOptions, setLocationOptions] = useState({
    governorates: [],
    delegations: [],
    districts: [],
  });

  const popupRef = useRef(null);

  const totalAmount = useMemo(() =>
    basketItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [basketItems]
  );

  // Initialize governorates options on component mount
  useEffect(() => {
    const governorateOptions = citiesData.Tunisia.governorates.map(governorate => ({
      value: governorate.name,
      label: governorate.name
    }));

    setLocationOptions(prev => ({
      ...prev,
      governorates: governorateOptions
    }));
  }, []);

  // Update delegation options when governorate changes
  useEffect(() => {
    if (!formData.governorate) {
      setLocationOptions(prev => ({ ...prev, delegations: [], districts: [] }));
      setFormData(prev => ({ ...prev, delegation: '', district: '' }));
      return;
    }

    const selectedGovernorate = citiesData.Tunisia.governorates.find(
      g => g.name === formData.governorate
    );

    const delegationOptions = selectedGovernorate?.delegations?.map(delegation => ({
      value: delegation.name,
      label: delegation.name
    })) || [];

    setLocationOptions(prev => ({
      ...prev,
      delegations: delegationOptions,
      districts: []
    }));

    setFormData(prev => ({ ...prev, delegation: '', district: '' }));
  }, [formData.governorate]);

  // Update district options when delegation changes
  useEffect(() => {
    if (!formData.governorate || !formData.delegation) {
      setLocationOptions(prev => ({ ...prev, districts: [] }));
      setFormData(prev => ({ ...prev, district: '' }));
      return;
    }

    const selectedGovernorate = citiesData.Tunisia.governorates.find(
      g => g.name === formData.governorate
    );

    const selectedDelegation = selectedGovernorate?.delegations?.find(
      d => d.name === formData.delegation
    );

    const districtOptions = selectedDelegation?.cities?.map(city => ({
      value: city,
      label: city
    })) || [];

    setLocationOptions(prev => ({
      ...prev,
      districts: districtOptions
    }));

    setFormData(prev => ({ ...prev, district: '' }));
  }, [formData.governorate, formData.delegation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const { governorate, delegation, district, addressLine } = formData;
    if (!governorate || !delegation || !district || !addressLine) {
      toast.error('All fields are required');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm() || totalAmount <= 0) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');
      if (!user.emailVerified) {
        toast.error('Please verify your email before placing an order');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) throw new Error('User information not found');

      const orderData = {
        userInfo: {
          id: user.uid,
          name: userDoc.data().firstName || 'No name provided',
          email: user.email,
          phone: userDoc.data().phone,
        },
        shippingInfo: {
          governorate: formData.governorate,
          delegation: formData.delegation,
          district: formData.district,
          addressLine: formData.addressLine,
        },
        items: basketItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color, // Include color in the order data
        })),
        totalAmount,
        createdAt: new Date().toISOString(),
        status: 'New',
      };

      // Create the order document
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const orderWithId = { ...orderData, id: docRef.id };

      // Send email notification to admin
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderWithId })
        });
      } catch (emailError) {
        toast.error('Admin failed to receive notification, but your order was placed successfully');
      }

      // Update the stock for each ordered product
await Promise.all(
  basketItems.map(async (item) => {
    const productRef = doc(db, 'products', item.id);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      const productData = productDoc.data();
      const colorIndex = productData.colors.findIndex(
        (color) => color.name === item.color
      );

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
            };
          }
          return color;
        });
        await updateDoc(productRef, { colors: newColors });
      } else {
        toast.warn(
          `Size ${item.size} or color ${item.color} not found for product ${item.id}`
        );
      }
    }
  })
);


      // Save order details in state instead of generating the PDF immediately
      setPlacedOrder(orderWithId);
      setUserDataForInvoice(userDoc.data());
      onPlaceOrder(orderWithId);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If order has been placed, show the confirmation and Download Invoice button
  if (placedOrder) {
    return (
      <div className="fixed inset-0 bg-white backdrop-blur-sm flex flex-col justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-md p-8 shadow-xl rounded">
          <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
          <p className="mb-6">Your order <span className="font-bold">#{placedOrder.id}</span> has been placed successfully.</p>
          <button
            onClick={() => generateInvoice(placedOrder, userDataForInvoice)}
            className="w-full py-4 mb-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
          >
            Download Invoice
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div ref={popupRef} className="bg-white w-full max-w-6xl h-[90vh] flex flex-col lg:grid lg:grid-cols-2 shadow-xl overflow-hidden">
        {/* Image Section */}
        <div className="relative h-64 lg:h-full overflow-hidden">
          <Image
            src="/Delivery_Van.avif"
            alt="Checkout Visual"
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-all"
            aria-label="Close checkout"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Section */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <h2 className="text-3xl font-bold mb-8 tracking-tight">ORDER DETAILS</h2>
          <form onSubmit={handlePlaceOrder} className="space-y-6" encType="application/x-www-form-urlencoded">
            <h3 className="text-mx font-light italic mb-8 text-red-500">*Currently, we only ship in Tunisia*</h3>

            {/* Governorate Dropdown */}
            <FormSelect
              label="Governorate"
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
              options={locationOptions.governorates}
            />

            {/* Delegation Dropdown */}
            <FormSelect
              label="Delegation"
              name="delegation"
              value={formData.delegation}
              onChange={handleChange}
              options={locationOptions.delegations}
              disabled={!formData.governorate || locationOptions.delegations.length === 0}
            />

            {/* District Dropdown */}
            <FormSelect
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={locationOptions.districts}
              disabled={!formData.delegation || locationOptions.districts.length === 0}
            />

            {/* Address Line input */}
            <FormInput
              label="Address Line"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              placeholder="Street name, building number, apartment, etc."
              autoComplete="street-address"
            />

            {/* Total Amount */}
            <div className="pt-8 mt-8 border-t border-gray-200">
              <p className="text-2xl font-bold text-right">
                Total: {totalAmount.toFixed(2)} TND
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white focus:bg-white focus:text-black focus:outline-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading" />
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

CheckoutPopup.propTypes = {
  basketItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    size: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  onClose: PropTypes.func.isRequired,
  onPlaceOrder: PropTypes.func.isRequired,
};
