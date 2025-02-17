import { useEffect, useState, Suspense, lazy } from 'react';
import Head from 'next/head';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import TextPressure from '../components/TextPressure';
import Image from 'next/image';
import ErrorBoundary from '../components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Carousel from '../components/Carousel'; // Import the Carousel component

const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

// Lazy-loaded components for improved performance
const GridDistortion = lazy(() => import('../components/GridDistortion'));
const NewsletterSignup = lazy(() => import('../components/NewsletterSignup'));

export default function Home() {
  const [state, setState] = useState({
    user: null,
    firstName: '',
    testimonials: [],
    currentTestimonialIndex: 0,
    loading: true,
    error: null,
    showScrollTop: false,
  });

  const {
    user,
    firstName,
    testimonials,
    currentTestimonialIndex,
    loading,
    error,
    showScrollTop,
  } = state;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: 'beforeChildren',
      },
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      setState((prev) => ({ ...prev, showScrollTop: window.scrollY > 300 }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for auth state changes and fetch user data if logged in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setState((prev) => ({ ...prev, user: currentUser }));
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          setState((prev) => ({
            ...prev,
            firstName: userDoc.exists() ? userDoc.data().firstName || 'Valued User' : 'Valued User',
          }));
        } catch (err) {
          setState((prev) => ({ ...prev, error: 'Failed to load user data', firstName: 'Valued User' }));
        }
      } else {
        setState((prev) => ({ ...prev, user: null, firstName: '' }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch testimonials from Firestore
  useEffect(() => {
    const fetchTestimonials = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const testimonialsCollection = collection(db, 'testimonials');
        const querySnapshot = await getDocs(testimonialsCollection);
        const testimonialsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          review: doc.data().review || 'No review provided',
          rating: Number(doc.data().rating) || 0,
        }));
        setState((prev) => ({ ...prev, testimonials: testimonialsList }));
      } catch (err) {
        setState((prev) => ({ ...prev, error: 'Failed to load testimonials' }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchTestimonials();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>ASHE™</title>
        <meta name="description" content="Crafting timeless elegance through refined tailoring and sustainable mastery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="overflow-hidden"
      >
        {/* Hero Section */}
        <HeroSection user={user} firstName={firstName} />

        {/* Product Sections */}
        <ProductSections />

        {/* Grid Distortion Section */}
        <GridDistortionSection />

        {/* Testimonials Section */}
        <TestimonialsSection
          testimonials={testimonials}
          currentTestimonialIndex={currentTestimonialIndex}
          setCurrentTestimonialIndex={(index) => setState((prev) => ({ ...prev, currentTestimonialIndex: index }))}
        />

        {/* Newsletter Signup Section */}
        <NewsletterSignupSection />

        {/* Scroll to Top Button */}
        {showScrollTop && <ScrollToTopButton />}
      </motion.div>
    </Layout>
  );
}

const AnimatedArrow = () => {
  return (
    <div className="flex flex-col items-center ">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: index * 0.2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

const HeroSection = ({ user, firstName }) => (
  <section className="relative w-full h-[92vh] mb-32 overflow-hidden"> 
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-full hero-image-container">
        <Image
          src="/bg.jpg"
          alt="Stunning fashion header image"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 3840px"
          unoptimized={true}
        />
      </div>
    </motion.div>

    <div className="relative inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30 h-[92vh] flex items-center justify-center pb-16">
      <motion.div
        className="container h-[92vh] gap-5 flex flex-col items-center text-center"
        variants={{
          hidden: { y: 40, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 120, damping: 20 },
          },
        }}
      >
        <TextPressure
          text={user ? `Welcome, ${firstName}!` : 'Welcome to ASHE'}
          flex={true}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          slant={false}
          textColor="#ffffff"
          strokeColor="#ff0000"
          minFontSize={32}
          className="pt-16"
        />
        <motion.a
          href="/products"
          className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-black absolute top-1/2 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Shop Now
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="inline-block"
          >
            →
          </motion.span>
        </motion.a>
        <motion.p
          className="text-sm md:text-xl text-white/90 font-light max-w-2xl mb-5"
          variants={{
            hidden: { y: 40, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { type: 'spring', stiffness: 120, damping: 20 },
            },
          }}
        >
          Crafting timeless elegance through refined tailoring and sustainable mastery.
        </motion.p>
          <AnimatedArrow />
      </motion.div>
    </div>
  </section>
);

const ProductSections = () => (
  <section className="container mx-auto px-4 mb-32 grid grid-cols-1 md:grid-cols-2 gap-8">
    {['Featured', 'New Arrivals'].map((section, idx) => (
      <motion.div
        key={section}
        className={`group relative p-8 overflow-hidden ${idx === 0 ? 'bg-white' : 'bg-black text-white'}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        transition={{ duration: 0.6, delay: idx * 0.1 }}
      >
        <div className="relative h-80 mb-8 overflow-hidden">
          <Image
            src={idx === 0 ? '/11425.png' : '/xsc.png'}
            alt={`${section} products image`}
            fill
            unoptimized={true}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <h2 className="text-4xl font-semibold mb-4">{section}</h2>
        <p className={`text-lg mb-6 ${idx === 0 ? 'text-gray-600' : 'text-gray-300'}`}>
          {idx === 0
            ? 'Curated selection of signature pieces'
            : 'Discover our latest seasonal offerings'}
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-lg font-medium hover:gap-3 transition-all"
          aria-label={`Explore our ${section.toLowerCase()} collection`}
        >
          Explore Collection
          <span aria-hidden="true" className="text-xl">→</span>
        </a>
      </motion.div>
    ))}
  </section>
);

const GridDistortionSection = () => (
  <ErrorBoundary fallback={<p className="text-center text-red-500">Failed to load visual experience</p>}>
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -200px 0px' }}
      className="relative h-[80vh] mb-24"
    >
      <Suspense fallback={<div className="absolute inset-0 bg-gray-100 animate-pulse" />}>
        <GridDistortion
          imageSrc="https://picsum.photos/1920/1080?grayscale"
          grid={12}
          mouse={0.05}
          strength={0.12}
          relaxation={0.95}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h3 className="text-4xl md:text-6xl font-bold text-white mix-blend-difference">
            Beyond Fashion
          </h3>
        </div>
      </Suspense>
    </motion.section>
  </ErrorBoundary>
);

const TestimonialsSection = ({ testimonials }) => (
<section className="px-8 mb-48 flex flex-col-reverse md:flex-row justify-around items-center">
  <div className="relative">
    <Carousel
      items={testimonials}
      baseWidth={360}
      autoplay={true}
      autoplayDelay={3000}
      pauseOnHover={true}
      loop={true}
      round={true}
    />
  </div>
  <motion.h2
    className="text-6xl font-black text-center mb-16 md:mb-0"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    Voices of Elegance
  </motion.h2>
</section>

);

const NewsletterSignupSection = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl" />}>
      <NewsletterSignup />
    </Suspense>
  </motion.section>
);

const ScrollToTopButton = () => (
  <motion.button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-8 right-8 bg-[#46c7c7] text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition"
    whileHover={{ scale: 1.1 }}
    aria-label="Back to Top"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  </motion.button>
);
