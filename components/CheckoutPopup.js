import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { doc, addDoc, collection, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast, Toaster } from 'sonner';

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

// CheckoutPopup Component
export default function CheckoutPopup({ basket, onClose, onPlaceOrder }) {
  const [formData, setFormData] = useState({

    state: '',
    city: '',
    zipCode: '',
    addressLine: '',

  });
  const [loading, setLoading] = useState(false);

  const popupRef = useRef(null);

  const totalAmount = useMemo(() => 
    basket.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [basket]
  );

 
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };



  const validateForm = () => {
    const {  state, city, zipCode} = formData;
    if ( !state || !city || !zipCode) {
      toast.error('All fields are required');
      return false;
    }
    if (!/^\d+$/.test(zipCode)) {
      toast.error('Zip code must contain only numbers');
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
        shippingInfo: formData,
        items: basket.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })),
        totalAmount,
        createdAt: new Date().toISOString(),
        status: 'Pending',
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      onPlaceOrder({ ...orderData, id: docRef.id });
      toast.success('Order placed successfully!');
      onClose();
    } catch (error) {
      console.error('Order Error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <Toaster position="top-center" richColors />
      
      <div ref={popupRef} className="bg-white w-full max-w-6xl h-[90vh] flex flex-col lg:grid lg:grid-cols-2 shadow-xl overflow-hidden">
        {/* Image Section */}
        <div className="relative h-64 lg:h-full overflow-hidden">
          <img 
            src="Delivery_Van.jpg"
            alt="Checkout Visual"
            className="object-cover w-full h-full"
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
          
          <form onSubmit={handlePlaceOrder} className="space-y-6">

          <h3 className="text-mx font-light italic mb-8  text-red-500">*Currently, we only ship within Tunisia*</h3>
          <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              autoComplete="state"
            />
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              autoComplete="city"
            />
            {/* Address Fields */}
            <FormInput
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              type="text"
              autoComplete="postal-code"
            />
            
            <FormInput
              label="Address Line"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
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
                className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none "
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
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
  basket: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  })).isRequired,
  onClose: PropTypes.func.isRequired,
  onPlaceOrder: PropTypes.func.isRequired,
};