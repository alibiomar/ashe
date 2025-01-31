import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { doc, addDoc, collection, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast, Toaster } from 'sonner';

// FormInput Component
const FormInput = ({ label, name, value, onChange, type = 'text', required = true, children, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block font-bold text-sm text-gray-700 mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.countrystatecity.in/v1/countries', {
          headers: {
            'X-CSCAPI-KEY': process.env.REACT_APP_API_KEY,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCountryData(data);
      } catch (error) {
        setError('Failed to load countries: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when the selected country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) return; // Skip fetching if no country is selected
      
      setLoading(true);
      setError(''); // Reset error message before fetch
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${formData.country}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': process.env.REACT_APP_API_KEY,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        
        const data = await response.json();
        setStateData(data);
        setFormData(prev => ({ ...prev, state: '', city: '' })); // Reset state and city on country change
      } catch (error) {
        setError(error.message || 'Failed to load states');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [formData.country]);

  // Fetch Cities when the selected state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country || !formData.state) return; // Skip fetching if no country or state is selected
      
      setLoading(true);
      setError(''); // Reset error message before fetch
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${formData.country}/states/${formData.state}/cities`,
          {
            headers: {
              'X-CSCAPI-KEY': process.env.REACT_APP_API_KEY,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data = await response.json();
        setCityData(data);
        setFormData(prev => ({ ...prev, city: '' })); // Reset city on state change
      } catch (error) {
        setError(error.message || 'Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCountryInputChange = (e) => {
    const selectedOption = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      country: selectedOption, // Set country to selected country's ISO2 value
      state: '', // Clear the state field
      city: '',  // Clear the city field
    }));
  };

  const handleStateInputChange = (e) => {
    const selectedOption = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      state: selectedOption, // Set state to selected state's name
      city: '',  // Clear the city field
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Toaster position="top-center" richColors />
      
      <div ref={popupRef} className="bg-white p-6 rounded-lg shadow-lg flex max-w-lg w-full mx-4">
        {/* Image Section */}
        <div className="w-1/3 bg-gray-100 rounded-lg mr-6 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Checkout Visual"
            className="object-cover w-full h-full rounded-lg"
          />
        </div>

        {/* Form Section */}
        <div className="w-2/3">
          <button
            onClick={onClose}
            className="float-right text-gray-500 hover:text-black text-xl font-bold"
            aria-label="Close checkout"
            disabled={loading}
          >
            &times;
          </button>

          <h2 className="text-xl font-bold mb-4">Checkout Details</h2>
          
          <form onSubmit={handlePlaceOrder} className="space-y-3">
            {/* Country Dropdown */}
            <FormInput label="Country" name="country" value={formData.country} onChange={handleCountryInputChange}>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleCountryInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
              >
                <option value="">Select Country</option>
                {countryData.map((country) => (
                  <option key={country.iso2} value={country.iso2}>
                    {country.name}
                  </option>
                ))}
              </select>
            </FormInput>

            {/* State Dropdown */}
            <FormInput label="State" name="state" value={formData.state} onChange={handleStateInputChange}>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleStateInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
                disabled={!formData.country}
              >
                <option value="">Select State</option>
                {stateData.map((state) => (
                  <option key={state.iso2} value={state.iso2}>
                    {state.name}
                  </option>
                ))}
              </select>
            </FormInput>

            {/* City Dropdown */}
            <FormInput label="City" name="city" value={formData.city} onChange={handleChange}>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                required
                disabled={!formData.state}
              >
                <option value="">Select City</option>
                {cityData.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </FormInput>

            {/* Other Form Fields */}
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

            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-lg font-bold text-center">
                Total: {totalAmount.toFixed(2)} TND
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-md font-bold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-md font-bold flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Place Order'
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