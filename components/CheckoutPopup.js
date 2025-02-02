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
    country: '',
    state: '',
    city: '',
    zipCode: '',
    addressLine: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [error, setError] = useState('');
  const popupRef = useRef(null);

  const totalAmount = useMemo(() => 
    basket.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [basket]
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchCountries = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries', { signal });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
  
        if (data.data && Array.isArray(data.data)) {
          setCountryData(data.data);
        } else {
          throw new Error('Expected array of countries in response');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('Failed to load countries: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchCountries();
    return () => controller.abort();
  }, []);  
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchStates = async () => {
      if (!formData.country || !countryData.length) return;
  
      setLoading(true);
      setError('');
  
      try {
        const selectedCountry = countryData.find(c => c.iso2 === formData.country);
        if (!selectedCountry) throw new Error('Country not found');
  
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: selectedCountry.country })
        });
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
  
        if (data.data?.states && Array.isArray(data.data.states)) {
          setStateData(data.data.states);
          setFormData(prev => ({ ...prev, state: '', city: '' }));
        } else {
          throw new Error('Expected array of states in response');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('Failed to load states: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchStates();
    return () => controller.abort();
  }, [formData.country, countryData]);
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchCities = async () => {
      if (!formData.country || !formData.state || !countryData.length) return;
  
      setLoading(true);
      setError('');
  
      try {
        const selectedCountry = countryData.find(c => c.iso2 === formData.country);
        if (!selectedCountry) throw new Error('Country not found');
  
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: selectedCountry.country,
            state: formData.state
          })
        });
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
  
        if (data.data?.cities && Array.isArray(data.data.cities)) {
          setCityData(data.data.cities);
          setFormData(prev => ({ ...prev, city: '' }));
        } else {
          throw new Error('Expected array of cities in response');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('Failed to load cities: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchCities();
    return () => controller.abort();
  }, [formData.state, countryData]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCountryInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      country: e.target.value,
      state: '',
      city: '',
    }));
  };

  const handleStateInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      state: e.target.value,
      city: '',
    }));
  };

  const validateForm = () => {
    const { country, state, city, zipCode, phone } = formData;
    if (!country || !state || !city || !zipCode || !phone) {
      toast.error('All fields are required');
      return false;
    }
    if (!/^\d+$/.test(zipCode)) {
      toast.error('Zip code must contain only numbers');
      return false;
    }
    if (!/^\d{8,15}$/.test(phone)) {
      toast.error('Phone number must be 8-15 digits');
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
          phone: formData.phone,
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
            {/* Location Fields */}
            <FormInput label="Country" name="country" value={formData.country} onChange={handleCountryInputChange}>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleCountryInputChange}
                className="w-full text-black px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent"
                required
              >
                <option value="">Select Country</option>
                {countryData.map((country) => (
                  <option key={country.iso2} value={country.iso2}>{country.name}</option>
                ))}
              </select>
            </FormInput>

            <FormInput label="State" name="state" value={formData.state} onChange={handleStateInputChange}>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleStateInputChange}
                className="w-full text-black px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent"
                required
                disabled={!formData.country}
              >
                <option value="">Select State</option>
                {stateData.map((state) => (
                  <option key={state.iso2} value={state.iso2}>{state.name}</option>
                ))}
              </select>
            </FormInput>

            <FormInput label="City" name="city" value={formData.city} onChange={handleChange}>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full text-black px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent"
                required
                disabled={!formData.state}
              >
                <option value="">Select City</option>
                {cityData.map((city) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
            </FormInput>

            {/* Address Fields */}
            <FormInput
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              type="number"
              autoComplete="postal-code"
            />
            
            <FormInput
              label="Address Line"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              autoComplete="street-address"
            />
            
            <FormInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              autoComplete="tel"
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