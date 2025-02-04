import { motion } from 'framer-motion';
import Head from 'next/head';

const LegalPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 text-gray-800 font-sans">
      <Head>
        <title>Legal | ASHE Tunisian Elegance</title>
        <meta name="description" content="Explore the legal policies for ASHE, a brand celebrating authentic Tunisian craftsmanship and modern elegance." />
      </Head>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Terms of Service */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#A83279]"
        >
          <h1 className="text-3xl font-bold mb-4 text-gray-900 tracking-wide">Terms of Service</h1>
          <p className="mb-4 text-sm text-gray-500">Last Updated: [Date]</p>

          <div className="space-y-6 text-base leading-relaxed">
            <p>
              Welcome to <strong>ASHE</strong>, where modern design meets authentic Tunisian craftsmanship. By using our website and purchasing our products, you agree to the following terms.
            </p>

            <h3 className="font-semibold mt-4 text-lg">1. Orders &amp; Payments</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are in <strong>Tunisian Dinar (TND)</strong>.</li>
              <li>We accept secure payments via <strong>Carte Bancaire, Flouci, and PayPal</strong>.</li>
              <li>Orders are processed within 1-3 business days.</li>
            </ul>

            <h3 className="font-semibold mt-4 text-lg">2. Returns &amp; Exchanges</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Returns are accepted within 14 days for unused items.</li>
              <li>Please contact us at <a href="mailto:contact@ashe.tn" className="text-[#A83279] hover:underline">contact@ashe.tn</a> for any returns or exchanges.</li>
            </ul>

            <h3 className="font-semibold mt-4 text-lg">3. Intellectual Property</h3>
            <p>
              Every design, logo, and piece of content is the intellectual property of ASHE, safeguarded by Tunisian Law No. 2001-36 on Copyright Protection.
            </p>
          </div>
        </motion.section>

        {/* Privacy Policy */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#A83279]"
        >
          <h1 className="text-3xl font-bold mb-4 text-gray-900 tracking-wide">Privacy Policy</h1>
          <div className="space-y-6 text-base leading-relaxed">
            <p>
              At ASHE, we deeply value your privacy. In accordance with Tunisian Law No. 2004-63 on Personal Data Protection, we collect and process data only for delivering an exceptional customer experience.
            </p>

            <h3 className="font-semibold mt-4 text-lg">1. Data Collected</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your name, email, and shipping address for processing orders.</li>
              <li>Securely processed payment details via our trusted payment gateway.</li>
              <li>Cookies to enhance site performance and personalize your experience.</li>
            </ul>

            <h3 className="font-semibold mt-4 text-lg">2. Cookies</h3>
            <p>
              Cookies help us to:
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Remember your cart items for a seamless shopping experience.</li>
                <li>Analyze traffic via Google Analytics for site improvements.</li>
                <li>Tailor advertisements across platforms such as Facebook and Instagram.</li>
              </ul>
            </p>
            <p className="italic text-gray-600">
              Note: Disabling cookies might affect certain functionalities on our site.
            </p>

            <h3 className="font-semibold mt-4 text-lg">3. Data Sharing</h3>
            <p>
              Rest assured, we never sell your data. Information is only shared with:
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Our trusted shipping partners (e.g., Tunisian Post, DHL).</li>
                <li>Secure payment processors (e.g., CMI, PayPal).</li>
              </ul>
            </p>
          </div>
        </motion.section>

        {/* Shipping Policy */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#A83279]"
        >
          <h1 className="text-3xl font-bold mb-4 text-gray-900 tracking-wide">Shipping Policy</h1>
          <div className="space-y-6 text-base leading-relaxed">
            <h3 className="font-semibold text-lg">Domestic Shipping (Tunisia)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enjoy free shipping on orders over <strong>150 TND</strong>.</li>
              <li>Standard delivery: 3-5 business days via Tunisian Post.</li>
              <li>Express delivery: 1-2 business days with an additional fee of <strong>15 TND</strong>.</li>
            </ul>

            <h3 className="font-semibold mt-4 text-lg">International Shipping</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Available to Europe, North America, and MENA regions.</li>
              <li>Shipping costs are calculated at checkout (via DHL/FedEx).</li>
              <li>Please note that customs duties are the buyer’s responsibility.</li>
            </ul>

            <h3 className="font-semibold mt-4 text-lg">Tracking &amp; Delays</h3>
            <p>
              Once your order is shipped, you will receive a tracking number via email. Please note that delays due to customs or unforeseen logistical issues are beyond ASHE’s control.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default LegalPage;
