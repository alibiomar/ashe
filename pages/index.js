import React, { useEffect, useState, Suspense, lazy, memo } from 'react';
import Head from 'next/head';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import TextPressure from '../components/TextPressure';
import Image from 'next/image';
import ErrorBoundary from '../components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { motion} from 'framer-motion';
import Carousel from '../components/Carousel';
import { setupRealTimeActivityListener, updateUserActivity } from '../utils/updateActivity';
import ProductSections from '../components/productSections';
// Constants
const SCROLL_THRESHOLD = 300;
const DEFAULT_USER_NAME = 'Valued User';

// Dynamic imports
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

const Gallery = lazy(() => import('../components/Gallery'));
const NewsletterSignup = lazy(() => import('../components/NewsletterSignup'));

// Animation variants
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

// Custom hooks
const useScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return showScrollTop;
};

const useUserData = () => {
  const [userData, setUserData] = useState({
    user: null,
    firstName: '',
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUserData({ user: null, firstName: '', error: null });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData({
          user: currentUser,
          firstName: userDoc.exists() ? userDoc.data().firstName || DEFAULT_USER_NAME : DEFAULT_USER_NAME,
          error: null,
        });
      } catch (err) {
        setUserData({
          user: currentUser,
          firstName: DEFAULT_USER_NAME,
          error: 'Failed to load user data',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return userData;
};

const useTestimonials = () => {
  const [state, setState] = useState({
    testimonials: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'testimonials'));
        const testimonialsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          review: doc.data().review || 'No review provided',
          rating: Number(doc.data().rating) || 0,
        }));
        setState({ testimonials: testimonialsList, loading: false, error: null });
      } catch (err) {
        setState({ testimonials: [], loading: false, error: 'Failed to load testimonials' });
      }
    };

    fetchTestimonials();
  }, []);

  return state;
};

const useActivityTracking = (user) => {
  useEffect(() => {
    let unsubscribe = () => {};

    const initializeActivity = async () => {
      if (user?.uid) {
        unsubscribe = setupRealTimeActivityListener(user.uid);
        await updateUserActivity(user.uid);
      }
    };

    initializeActivity();
    return () => unsubscribe();
  }, [user]);
};

// Component
export default function Home() {
  const { user, firstName, error: userError } = useUserData();
  const { testimonials, loading, error: testimonialError } = useTestimonials();
  const showScrollTop = useScrollToTop();

  useActivityTracking(user);

  const error = userError || testimonialError;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <Layout>
      <Head>
        <title>ASHE™</title>
        <meta name="description" content="Crafting timeless elegance through refined tailoring and sustainable mastery." />
      </Head>

      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="overflow-hidden"
        >
          <HeroSection user={user} firstName={firstName} />
          <ProductSections />
          <GallerySection /> 
          <TestimonialsSection testimonials={testimonials} />
          <NewsletterSignupSection />
          {showScrollTop && <ScrollToTopButton />}
        </motion.div>
      </Suspense>
    </Layout>
  );
}

// Error Display Component
const ErrorDisplay = memo(({ error }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-6 text-center">
    <div className="bg-white p-8 shadow-lg max-w-md flex flex-col items-center justify-center">
      <div className="w-32 mb-8 relative h-32">
        <Image src="/logo.png" alt="ASHE™ Logo" fill style={{ objectFit: "contain" }} />
      </div>
      <h2 className="text-2xl font-semibold text-red-600 mb-4">Oops! Something went wrong</h2>
      <p className="text-gray-700">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition"
      >
        Try Again
      </button>
    </div>
  </div>
));

const AnimatedArrow = memo(() => (
  <div className="flex flex-col items-center">
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
));

const HeroSection = memo(({ user, firstName }) => (
  <section className="relative w-full h-screen mb-32 overflow-hidden bg-black">
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 2.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-full hero-image-container">
        <Image
          src="/bg.jpg"
          alt="Stunning fashion header image"
          fill style={{ objectFit: "cover" }}
          priority
          className="object-cover"
          unoptimized={true}
        />
      </div>
    </motion.div>

    <div className="relative inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30 h-screen flex items-center justify-center pb-16">
      <motion.div
        className="container h-screen gap-5 flex flex-col items-center text-center justify-center"
        variants={{
          hidden: { opacity: 0 },
          visible: {
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
          italic={true}
          textColor="#ffffff"
          strokeColor="#ff0000"
          minFontSize={36}
          className="pt-[20vh]"
        />
        <div className="flex flex-col items-center mb-14">
          <motion.a
            href="/products"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-black flex items-center gap-2 md:px-10 md:py-5 md:text-lg"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95, y: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            aria-label="Shop Now"
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
        </div>
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
));



const GallerySection = memo(() => (
  <ErrorBoundary fallback={<p className="text-center text-red-500">Failed to load visual experience</p>}>
    <Suspense fallback={<div className="inset-0 bg-gray-100 animate-pulse" />}>
      <section id="parallax-section">
        <Gallery />
      </section>
    </Suspense>
  </ErrorBoundary>
));


const TestimonialsSection = memo(({ testimonials }) => (
  <section className="px-8 py-16 flex flex-col-reverse md:flex-row justify-around items-center min-h-screen">
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
      className="text-5xl font-black text-start mb-16 md:mb-0 tracking-tighter"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      Voices of Confidence <span className="text-highlight">.</span>
    </motion.h2>
  </section>
));

const NewsletterSignupSection = memo(() => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl" />}>
      <NewsletterSignup />
    </Suspense>
  </motion.section>
));

const ScrollToTopButton = memo(() => (
  <motion.button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-8 right-8 bg-[#46c7c7] text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition"
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
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
));
