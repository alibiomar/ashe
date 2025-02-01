import { useEffect, useState, Suspense, lazy, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import TextPressure from '../components/TextPressure';
import Image from 'next/image';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingScreen';
import { motion } from 'framer-motion';

// Lazy-loaded components for better performance
const Testimonial = lazy(() => import('../components/Testimonial'));
const GridDistortion = lazy(() => import('../components/GridDistortion'));
const NewsletterSignup = lazy(() => import('../components/NewsletterSignup')); // New component for newsletter signup

export default function Home() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 25, staggerChildren: 0.2 },
    },
  };


  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Fetch user data on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          setFirstName(userDoc.exists() ? userDoc.data().firstName || 'Valued User' : 'Valued User');
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
          setFirstName('Valued User');
        }
      } else {
        setUser(null);
        setFirstName('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch testimonials from Firestore
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const testimonialsCollection = collection(db, 'testimonials');
        const querySnapshot = await getDocs(testimonialsCollection);
        const testimonialsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          review: doc.data().review || 'No review provided',
          rating: Number(doc.data().rating) || 0,
        }));
        setTestimonials(testimonialsList);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Memoize displayed testimonials
  const displayedTestimonials = useMemo(() => {
    const displayed = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentTestimonialIndex + i + testimonials.length) % testimonials.length;
      displayed.push(testimonials[index]);
    }
    return displayed;
  }, [currentTestimonialIndex, testimonials]);

  const handleTestimonialClick = useCallback((index) => {
    setCurrentTestimonialIndex(index);
  }, []);

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
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Hero Section */}
        <div className="relative w-full h-[100vh] mb-8 overflow-hidden">
        <Image
  src="/header.jpeg"
  alt="Fashion Header"
  fill
  style={{ objectFit: 'cover' }}
  className="rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw" // Add sizes for better performance
/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-end justify-center pb-4">
          <motion.div
            variants={childVariants}
            className="w-full max-w-6xl sm:max-w-2xl px-[5vw] mb-[10vh] text-center"
          >              <TextPressure
                text={user ? `Welcome, ${firstName}!` : 'Welcome to ASHE'}
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={24}
              /></motion.div>
            </div>
          
        </div>

{/* Product Sections */}
<section className="container mx-auto px-4 mb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Featured Section */}
  <motion.div
    className="p-6 md:p-8 lg:p-12 bg-white border-2 border-black space-y-6 flex flex-col h-full"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Image */}
    <div className="w-full h-48 md:h-64 lg:h-80 relative mb-6">
      <img
        src="/featured.jpg" // Replace with your image path
        alt="Featured Collection"
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
    <h2 className="text-3xl md:text-4xl font-bold">Featured</h2>
    <p className="text-lg text-gray-600 flex-1">
      Curated selection of signature pieces
    </p>
    <a
      href="/products"
      className="inline-block text-lg font-medium underline hover:text-gray-600"
    >
      Explore Collection →
    </a>
  </motion.div>

  {/* New Arrivals Section */}
  <motion.div
    className="p-6 md:p-8 lg:p-12 bg-black text-white space-y-6 flex flex-col h-full"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Image */}
    <div className="w-full h-48 md:h-64 lg:h-80 relative mb-6">
      <img
        src="/new-arrivals.jpg" // Replace with your image path
        alt="New Arrivals"
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
    <h2 className="text-3xl md:text-4xl font-bold">New Arrivals</h2>
    <p className="text-lg text-gray-300 flex-1">
      Discover our latest seasonal offerings
    </p>
    <a
      href="/products"
      className="inline-block text-lg font-medium underline hover:text-gray-400"
    >
      View New Items →
    </a>
  </motion.div>
</section>

        {/* Grid Distortion Component */}
        <ErrorBoundary key="grid-distortion" fallback="Failed to load Grid Distortion">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '600px', position: 'relative' }}
          >
            <Suspense fallback={<div className='loading'></div>}>
              <GridDistortion
                imageSrc="https://picsum.photos/1920/1080?grayscale"
                grid={10}
                mouse={0.1}
                strength={0.15}
                relaxation={0.9}
                className="custom-class"
              />
            </Suspense>
          </motion.div>
        </ErrorBoundary>

        {/* Testimonials Section */}
        <section className="my-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {displayedTestimonials.map((testimonial, index) => {
              const actualIndex = (currentTestimonialIndex + index - 1 + testimonials.length) % testimonials.length;
              const isCurrent = index === 1;
              return (
                <ErrorBoundary key={`testimonial-${testimonial.id}`} fallback="Failed to load Testimonial">
                  <div className={`transition-all duration-500 ease-in-out transform cursor-pointer ${
                      isCurrent ? 'scale-100 opacity-100' : 'scale-95 opacity-70 blur-sm'
                    }`}
                    onClick={() => handleTestimonialClick(actualIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View testimonial from ${testimonial.name}`}
                  >
                    <Suspense fallback={<div className='loading'></div>}>
                      <Testimonial testimonial={testimonial} />
                    </Suspense>
                  </div>
                </ErrorBoundary>
              );
            })}
          </div>
        </section>
        
                {/* Newsletter Section */}
                <section className="flex items-center">
          <Suspense fallback={<div className='loading'></div>}>
            <NewsletterSignup />
          </Suspense>
        </section>
      </motion.div>
    </Layout>
  );
}
