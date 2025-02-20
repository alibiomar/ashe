import Link from 'next/link';
import { FaInstagram, FaTiktok, FaEnvelope, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CircularText from './CircularText';

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 w-full">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={footerVariants}
        className="px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Brand Section */}
          <motion.div variants={{
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }} className="space-y-6 flex flex-col items-left mt-[-5vh]">
            <CircularText
              text="ASHE♦ASHE♦ASHE♦"
              onHover="speedUp"
              spinDuration={10}
              className="block"
            />
            <p className="text-gray-400 leading-relaxed text-sm max-w-44 md:max-w-44 text-left">
              Redefining fashion through the whispers of legacy.
            </p>
          </motion.div>

          {/* Collections */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Collections</h3>
            <ul className="space-y-3">
              {['New In', 'Winter Essentials'].map((products) => (
                <li key={products}>
                  <Link href="/products" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center group">
                    <span className="w-2 h-px bg-transparent mr-2 group-hover:bg-white transition-all duration-300" />
                    {products}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Legal</h3>
            <ul className="space-y-3">
              {['Terms of Service', 'Privacy Policy', 'Shipping Policy'].map((terms) => (
                <li key={terms}>
                  <Link
                    href={`/terms#${terms.replace(/\s+/g, '').toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center group"
                  >
                    <span className="w-2 h-px bg-transparent mr-2 group-hover:bg-white transition-all duration-300" />
                    {terms}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Connect</h3>
              <div className="flex space-x-4">
  <a
    href="https://www.instagram.com/ashe.tn/"
    aria-label="Visit our Instagram profile"
    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 group"
  >
    <FaInstagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
  </a>
  <a
    href="https://www.tiktok.com/@ashe.tn"
    aria-label="Visit our TikTok profile"
    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 group"
  >
    <FaTiktok className="h-5 w-5 text-gray-400 group-hover:text-white" />
  </a>
</div>

            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                  <a href="mailto:contact@ashe.tn" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium">
                    contact@ashe.tn
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <FaPhone className="h-4 w-4 text-gray-400" />
                  <a href="tel:+21620986015" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium">
                    +216 20 986 015
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ASHE™. Crafted with passion in Tunisia.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
