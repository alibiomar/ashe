import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "sonner";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Layout({ children }) {
  const router = useRouter();
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white antialiased">
      <Navbar onHeightChange={setNavbarHeight} />
      <Toaster position="bottom-center" richColors />
      <motion.main
        key={router.pathname}
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 sm:px-0 w-full"
        style={{
          marginTop: ["/", "/about"].includes(router.pathname) ? 0 : navbarHeight,
        }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}