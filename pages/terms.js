import dynamic from 'next/dynamic';
import Head from 'next/head';

const Navbar = dynamic(() => import('../components/Navbar'), { ssr: false });

const policies = [
  {
    id: 'termsofservice',
    title: 'Terms of Service',
    updated: '04/02/2025',
    content: [
      {
        heading: '1. Orders & Payments',
        items: [
          'All prices are in Tunisian Dinar (TND)',
          'Payment is required upon shipment',
          'Orders are processed within 1-3 business days',
        ],
      },
      {
        heading: '2. Returns & Exchanges',
        items: [
          'Returns are accepted within 7 days of receiving the product',
          'Items that have been worn, washed, or damaged cannot be returned',
          'Contact us at contact@ashe.tn',
        ],
      },
      {
        heading: '3. Intellectual Property',
        text: 'Every design, logo, and piece of content is the intellectual property of ASHE™, safeguarded by Tunisian Law No. 2001-36 on Copyright Protection.',
      },
    ],
  },
  {
    id: 'privacypolicy',
    title: 'Privacy Policy',
    updated: '04/02/2025',
    content: [
      {
        heading: '1. Data Collected',
        items: [
          'Your name, email, and shipping address for processing orders',
          'Cookies to enhance site performance and personalization',
        ],
      },
      {
        heading: '2. Cookies',
        items: [
          'Remember your cart items',
          'Analyze traffic via Google Analytics',
          'Tailor advertisements across social platforms',
        ],
        note: 'Disabling cookies might affect site functionality.',
      },
      {
        heading: '3. Data Sharing',
        text: 'Rest assured, we never sell your data.',
      },
    ],
  },
  {
    id: 'shippingpolicy',
    title: 'Shipping Policy',
    content: [
      {
        heading: 'Domestic Shipping (Tunisia)',
        items: [
          'Free shipping on orders over 200 TND',
          'Standard delivery: 3-5 business days (8 TND)',
        ],
      },
    ],
  },
];

const PolicySection = ({ id, title, updated, content }) => (
  <section id={id} className="group bg-white p-8 border-l-[5px] border-[#46c7c7]">
    <div className="flex flex-col mb-6 border-b border-gray-100 pb-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
      {updated && <p className="text-xs text-gray-400 uppercase tracking-wider">Last Updated: {updated}</p>}
    </div>
    <div className="space-y-6 text-base leading-relaxed">
      {content.map((section, idx) => (
        <div key={idx}>
          <h3 className="font-semibold text-xl text-gray-900 mb-3">{section.heading}</h3>
          {section.text && <p className="text-gray-700">{section.text}</p>}
          {section.items && (
            <ul className="list-disc pl-6 space-y-2.5 text-gray-700">
              {section.items.map((item, index) => (
                <li key={index} className="relative pl-2 -indent-2">
                  <span className="absolute left-0 text-[#46c7c7]">•</span> {item}
                </li>
              ))}
            </ul>
          )}
          {section.note && <p className="mt-4 text-sm text-gray-500 italic">{section.note}</p>}
        </div>
      ))}
    </div>
  </section>
);

const LegalPage = () => {
  return (
    <>
      <Head>
        <title>Legal | ASHE™</title>
        <meta
          name="description"
          content="Explore the legal policies for ASHE™, a brand celebrating authentic Tunisian craftsmanship and modern elegance."
        />
      </Head>
      <div className="bg-white p-8 text-gray-900 font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto space-y-10 mt-20">
          {policies.map((policy) => (
            <PolicySection key={policy.id} {...policy} />
          ))}
        </main>
        <footer className="mt-24 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400 tracking-wide">
            © {new Date().getFullYear()} ASHE™. Crafted with passion in Tunisia.
          </p>
        </footer>
      </div>
    </>
  );
};

export default LegalPage;
