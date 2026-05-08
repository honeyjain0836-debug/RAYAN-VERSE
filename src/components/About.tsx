import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Instagram, Youtube } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

function Counter({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (current) => Math.floor(current).toString());

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function About() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let loadingTimeout: NodeJS.Timeout | undefined;
    
    // Use onSnapshot to get real-time updates
    unsub = onSnapshot(doc(db, 'settings', 'profile'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const url = data.photoURL || null;
        
        setPhotoURL((prev) => {
          if (url !== prev) {
            setIsImageLoaded(false);
            setIsLoading(!!url);
            
            if (url) {
              if (loadingTimeout) clearTimeout(loadingTimeout);
              loadingTimeout = setTimeout(() => {
                setIsLoading(false);
              }, 6000); // 6 seconds safety timeout
            }
            return url;
          }
          return prev;
        });
      } else {
        setPhotoURL(null);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Snapshot listener failed in About:', error);
      setIsLoading(false);
    });

    return () => {
      if (unsub) unsub();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="font-brand text-brand-red text-6xl uppercase tracking-[4px]">About</h2>
        <div className="w-24 h-1 bg-brand-red mt-4 shadow-[0_0_10px_#B22C3E]" />
      </div>

      <div className="grid md:grid-cols-[40%_60%] gap-16 items-start">
        {/* Left Column - Profile Photo */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center sticky top-24"
        >
          <div 
            className="w-full max-w-[380px] aspect-[4/5] md:aspect-[3/4] glass-card rounded-[16px] flex items-center justify-center border-2 border-brand-red/40 group overflow-hidden relative transition-all duration-400 ease-out shadow-[0_0_30px_rgba(178,44,62,0.15),0_0_80px_rgba(178,44,62,0.06)] hover:shadow-[0_0_40px_rgba(178,44,62,0.35),0_0_100px_rgba(178,44,62,0.12)] hover:scale-[1.02] bg-black/40"
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && photoURL && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black z-20"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-brand-red/10 border-t-brand-red animate-spin mb-4" />
                  <span className="font-brand text-2xl text-brand-red/40 tracking-widest animate-pulse uppercase">RAYANJAINN</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Photo / Placeholder Container */}
            <div className="absolute inset-0 w-full h-full">
              <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence>
                  {!isImageLoaded && (
                    <motion.div 
                      key="loading-spinner"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black z-20"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-brand-red/10 border-t-brand-red animate-spin mb-4" />
                      <span className="font-brand text-2xl text-brand-red/40 tracking-widest animate-pulse uppercase">RAYANJAINN</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.img 
                  key="main-profile-photo"
                  src="https://i.ibb.co/JRkdDLW2/IMG-0387.jpg" 
                  alt="Rayanjainn - Professional Video Editor"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ 
                    opacity: isImageLoaded ? 1 : 0,
                    scale: isImageLoaded ? 1 : 1.1
                  }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onLoad={() => {
                    setIsImageLoaded(true);
                    setIsLoading(false);
                  }}
                  onError={(e) => {
                    console.error('About image load error');
                    setIsLoading(false);
                  }}
                />

                {/* Hover Overlay - Only shows when image is loaded */}
                {isImageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="font-brand text-[24px] text-brand-red tracking-[4px] uppercase mb-1 drop-shadow-lg">RAYANJAINN</h4>
                      <p className="font-sans text-[12px] text-white/80 tracking-[0.3em] uppercase font-medium">Visual Storyteller</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <h3 className="font-brand text-3xl text-brand-red tracking-wider uppercase">RAYANJAINN</h3>
            <p className="text-text-muted mt-2 uppercase tracking-widest text-sm">Professional Video Editor</p>
          </div>

          <div className="flex gap-6 mt-8 justify-center">
            <a href="https://youtube.com/@rayanjainn" target="_blank" rel="noopener noreferrer" className="p-3 border border-brand-red/30 rounded-full hover:bg-brand-red hover:text-black transition-all group">
              <Youtube size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://instagram.com/rayanjainn" target="_blank" rel="noopener noreferrer" className="p-3 border border-brand-red/30 rounded-full hover:bg-brand-red hover:text-black transition-all group">
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="flex flex-col gap-8"
        >
          <div className="space-y-6 text-brand-red/90 leading-relaxed text-lg font-sans">
            <p>
              Hey, I'm Rayanjainn — a passionate video editor who lives and breathes visual storytelling. 
              I don't just cut clips together. I build cinematic experiences that make people stop 
              scrolling and actually feel something.
            </p>
            <p>
              With a sharp eye for pacing, colour grading, motion graphics and sound design, I specialise 
              in transforming raw footage into polished, high-impact edits that align perfectly with 
              my clients' vision. From YouTube content creators and social media brands to short films 
              and commercial campaigns — I've delivered frame-perfect results across every format.
            </p>
            <p>
              I work closely with each client to understand not just what they want, but what their audience 
              needs to feel. Every project I take on gets my full creative focus, meticulous attention to 
              detail, and a relentless drive to make it better than expected.
            </p>
            <p className="italic">
              If you have a vision — I have the skills to make it unforgettable.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-brand-red/20 mt-8">
            <div className="text-center md:text-left">
              <div className="text-4xl font-brand text-brand-red">
                <Counter value={120} />+
              </div>
              <div className="text-sm text-text-muted uppercase tracking-wider mt-1">Projects Completed</div>
            </div>
            
            <div className="hidden md:block w-[1px] h-full bg-brand-red/20" />

            <div className="text-center md:text-left">
              <div className="text-4xl font-brand text-brand-red">
                <Counter value={85} />+
              </div>
              <div className="text-sm text-text-muted uppercase tracking-wider mt-1">Happy Clients</div>
            </div>

            <div className="hidden md:block w-[1px] h-full bg-brand-red/20" />

            <div className="text-center md:text-left">
              <div className="text-4xl font-brand text-brand-red">2+</div>
              <div className="text-sm text-text-muted uppercase tracking-wider mt-1">Years Experience</div>
            </div>

            <div className="hidden md:block w-[1px] h-full bg-brand-red/20" />

            <div className="text-center md:text-left">
              <div className="text-4xl font-brand text-brand-red">10+</div>
              <div className="text-sm text-text-muted uppercase tracking-wider mt-1">Editing Styles</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
