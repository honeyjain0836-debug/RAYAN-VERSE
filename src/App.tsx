import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar, CustomCursor } from './components/ui/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { ReviewsAndQueries, MarqueeStrip } from './components/ReviewsAndQueries';
import { Contact, Footer } from './components/Contact';
import { AdminPanel } from './components/Admin';
import { BrandLogo, Badge } from './components/ui/BrandElements';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Handle Loading
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // Handle Scroll Progress
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    // Handle Admin Route (simple detection)
    const handlePopState = () => {
      setIsAdmin(window.location.pathname === '/admin');
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg-matte flex items-center justify-center z-[500] bg-noise">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0.5, 1, 0], scale: [0.8, 1, 1, 1.1, 1] }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <BrandLogo className="text-6xl md:text-8xl shadow-[0_0_30px_rgba(178,44,62,0.3)]" />
        </motion.div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <CustomCursor />
        <AdminPanel />
      </>
    );
  }

  return (
    <div className="relative bg-bg-matte text-brand-red min-h-screen selection:bg-brand-red selection:text-black">
      <CustomCursor />
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-brand-red z-[110] transition-all duration-100 ease-out shadow-[0_0_10px_#B22C3E]"
        style={{ width: `${scrollProgress}%` }}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
        <About />
        <Portfolio />
        <MarqueeStrip />
        <ReviewsAndQueries />
        <Contact />
        <Footer />
      </motion.main>

      {/* Persistent Bottom Badge */}
      <div className="fixed bottom-6 left-6 z-[60] hidden md:block">
        <Badge />
      </div>

      <style>{`
        .bg-noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 50;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
