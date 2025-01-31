import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';
import AnimatedNumber from '../components/AnimatedNumber';

// Lazy load the LoadingSpinner component with suspense
const LoadingSpinner = dynamic(() => import('../components/LoadingScreen'), {
  suspense: true,
});

export default function About() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); // Clean up the timeout on component unmount
    }, []); // Empty dependency array ensures this runs only once

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-white mt-[-10vh]">
                {/* Heritage Header */}
                <section className="h-screen flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/heritage-hero.jpeg"
                            alt="Archival photo of master tailor at work"
                            layout="fill"
                            objectFit="cover"
                            className="opacity-20"
                        />
                    </div>
                    <motion.div 
                        className="max-w-6xl mx-auto text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="mb-12">
                            <div className="h-px bg-black/20 w-32 mx-auto mb-8" />
                            <h4 className="text-xl uppercase tracking-widest text-gray-500">
                                An Inherited Story
                            </h4>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
                            <span className="block">Crafting Distinction</span>
                            <span className="text-gray-400">Since Day One</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                            Where ancestral tailoring meets modern rebellion. ASHE carries forward 
                            craftsmanship DNA while rewriting fashion rules.
                        </p>
                    </motion.div>
                </section>

                {/* Legacy Story */}
                <section className="min-h-screen py-32 px-8 border-t border-black/10">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            className="space-y-8"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <div className="text-5xl md:text-6xl font-black">
                                <p className="mb-4">Be Distinct</p>
                                <div className="h-1 w-24 bg-black" />
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Founded on generations of textile wisdom, we honor tradition 
                                through disruption. Each collection inherits historical 
                                craftsmanship while pioneering contemporary silhouettes.
                            </p>
                        </motion.div>
                        <motion.div
                            className="relative aspect-square bg-gray-50 group overflow-hidden"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                        >
                            <img 
                                src="/sewing.jpeg" 
                                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
<div className="absolute inset-0 p-8 mt-[60%] text-white mix-blend-difference">
  <blockquote className="max-w-2xl mx-auto text-center text-2xl md:text-3xl italic leading-relaxed drop-shadow-lg">
    “My grandmother’s hands taught me that true elegance lives in the seams.”
  </blockquote>
  <p className="mt-4 text-center text-base md:text-lg font-light drop-shadow">
    - Omar Alibi, Founder
  </p>
</div>

                        </motion.div>
                    </div>
                </section>

                {/* Value Pillars */}
                <section className="min-h-screen py-32 px-8 bg-black text-white">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2 
                            className="text-4xl md:text-6xl font-black mb-16 text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                        >
                            Our Inherited Code
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Boldness',
                                    symbol: '⟡',
                                    desc: 'Defying trends through intentional disruption'
                                },
                                {
                                    title: 'Elegance',
                                    symbol: '⊛', 
                                    desc: 'Timeless sophistication in every stitch'
                                },
                                {
                                    title: 'Confidence',
                                    symbol: '◬',
                                    desc: 'Armor for the self-assured individual'
                                }
                            ].map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    className="p-8 border border-white/10 hover:border-white/20 transition-all h-full"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="text-5xl mb-6">{value.symbol}</div>
                                    <h3 className="text-3xl font-medium mb-4">{value.title}</h3>
                                    <p className="text-gray-400">{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modern Manifesto */}
                <section className="min-h-screen py-32 px-8">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            className="space-y-8"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-black">
                                <span className="block mb-4">The ASHE </span>
                                <span className="text-gray-400">CREED</span>
                            </h2>
                            <div className="space-y-6">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    We reject fast fashion's emptiness. Our garments are 
                                    legacy pieces - designed to outlive trends and become 
                                    heirlooms. Each collection is a chapter in our ongoing 
                                    story of sartorial rebellion.
                                </p>
                                <div className="h-px bg-black/20 w-48" />
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To wear ASHE is to carry forward a tradition of 
                                    distinction. Our cuts command attention, our fabrics 
                                    whisper heritage, our details dare you to look closer.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="relative aspect-square bg-gray-900 text-white flex items-center justify-center text-center p-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                        >
                            <div className="text-3xl italic">
                                "We don't make clothes.<br/>
                                We craft armor for<br/> 
                                the distinctly bold"
                            </div>
                        </motion.div>
                    </div>
                </section>

{/* Community Connection Section */}
<section className="min-h-screen py-32 px-8 bg-gray-50">
    <div className="max-w-6xl mx-auto text-center">
        <motion.div 
            className="text-4xl md:text-6xl font-black mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <span className="block">Join Our Collective</span>
            <span className="text-gray-400">of Visionary Wearers</span>
        </motion.div>

        <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
        >
            {['Share Ideas', 'Co-Create', 'Inspire'].map((item, index) => (
                <motion.div
                    key={item}
                    className="p-6 border border-black/10 rounded-lg hover:bg-white transition-all cursor-pointer"
                    whileHover={{ y: -5 }}
                >
                    <div className="text-3xl mb-4">
                        {['💬', '👥', '✨'][index]}
                    </div>
                    <h3 className="text-xl font-medium mb-2">{item}</h3>
                    <p className="text-gray-600 text-sm">
                        {[
                            'Exchange thoughts with fellow innovators',
                            'Collaborate on boundary-pushing designs',
                            'Spark trends through collective expression'
                        ][index]}
                    </p>
                </motion.div>
            ))}
        </motion.div>

        <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 50 }}
        >
            <motion.button
                onClick={() => router.push("/community")}
                className="px-12 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-all group relative overflow-hidden"
                whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "#111"
                }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="relative z-10 flex items-center justify-center">
                    Connect With Our Community
                    <span className="ml-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                            />
                        </svg>
                    </span>
                </span>
            </motion.button>
        </motion.div>

        {/* Community Counter */}
        <motion.div 
            className="mt-8 text-gray-600 flex justify-center items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
        >
            <span className="text-sm">Join</span>
            <div className="text-2xl font-bold text-black">
                <AnimatedNumber value={12456} duration={2} />
            </div>
            <span className="text-sm">visionaries already shaping our future</span>
        </motion.div>
    </div>
</section>
            </div>
        </Layout>
    );
}