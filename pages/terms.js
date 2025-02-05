import { motion } from 'framer-motion';
import Head from 'next/head';
import Navbar from '../components/Navbar';

const LegalPage = () => {
  return (
    <div className="min-h-screen bg-white p-8 text-gray-900 font-sans">
        <Navbar />
      <Head>
        <title>Legal | ASHE™</title>
        <meta name="description" content="Explore the legal policies for ASHE™, a brand celebrating authentic Tunisian craftsmanship and modern elegance." />
      </Head>

      <div className="max-w-4xl mx-auto space-y-10 mt-20">
        {/* Terms of Service */}
        <motion.section
          id="termsofservice"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="group bg-white p-8 border-l-[5px] border-[#46c7c7] hover:border-[#3aabab] transition-all duration-300"
        >
          <div className="flex flex-col mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Terms of Service</h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Last Updated: [04/02/2025]</p>
          </div>

          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-gray-700">
              Welcome to <strong className="text-[#46c7c7]">ASHE™</strong>, where modern design meets authentic Tunisian craftsmanship. By using our website and purchasing our products, you agree to the following terms.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">1. Orders & Payments</h3>
                <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    All prices are in <strong className="text-[#46c7c7]">Tunisian Dinar (TND)</strong>
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Payment is required upon shipment
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Orders are processed within 1-3 business days
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">2. Returns & Exchanges</h3>
                <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Returns are accepted within 7 days of receiving the product
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Items that have been worn, washed, or damaged cannot be returned
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Contact us at <a href="mailto:contact@ashe.tn" className="text-[#46c7c7] hover:text-[#3aabab] transition-colors">contact@ashe.tn</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">3. Intellectual Property</h3>
                <p className="text-gray-700">
                  Every design, logo, and piece of content is the intellectual property of <strong className="text-[#46c7c7]">ASHE™</strong>, safeguarded by Tunisian Law No. 2001-36 on Copyright Protection.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Privacy Policy */}
        <motion.section
          id="privacypolicy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="group bg-white p-8 border-l-[5px] border-[#46c7c7] hover:border-[#3aabab] transition-all duration-300"
        >
          <div className="flex flex-col mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
          </div>

          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-gray-700">
              At <strong className="text-[#46c7c7] ">ASHE™</strong>, we deeply value your privacy. In accordance with Tunisian Law No. 2004-63 on Personal Data Protection, we collect and process data only for delivering an exceptional customer experience.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">1. Data Collected</h3>
                <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Your name, email, and shipping address for processing orders
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Cookies to enhance site performance and personalization
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">2. Cookies</h3>
                <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Remember your cart items
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Analyze traffic via Google Analytics
                  </li>
                  <li className="relative pl-2 -indent-2">
                    <span className="absolute left-0 text-[#46c7c7]">•</span>
                    Tailor advertisements across social platforms
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-500 italic">
                  Note: Disabling cookies might affect site functionality
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">3. Data Sharing</h3>
                <p className="text-gray-700 italic">
                  Rest assured, we never sell your data.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Shipping Policy */}
        <motion.section
          id="shippingpolicy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group bg-white p-8 border-l-[5px] border-[#46c7c7] hover:border-[#3aabab] transition-all duration-300"
        >
          <div className="flex flex-col mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Shipping Policy</h1>
          </div>

          <div className="space-y-6 text-base leading-relaxed">
            <div>
              <h3 className="font-semibold text-xl text-gray-900 mb-3">Domestic Shipping (Tunisia)</h3>
              <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
                <li className="relative pl-2 -indent-2">
                  <span className="absolute left-0 text-[#46c7c7]">•</span>
                  Free shipping on orders over <strong className="text-[#46c7c7]">200 TND</strong>
                </li>
                <li className="relative pl-2 -indent-2">
                  <span className="absolute left-0 text-[#46c7c7]">•</span>
                  Standard delivery: 3-5 business days (<strong className="text-[#46c7c7]">8 TND</strong>)
                </li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mt-24 pt-8 border-t border-gray-200 text-center"
      >
        <p className="text-sm text-gray-400 tracking-wide">
          © {new Date().getFullYear()} ASHE™. Crafted with passion in Tunisia.
        </p>
      </motion.div>
    </div>
  );
};

export default LegalPage;