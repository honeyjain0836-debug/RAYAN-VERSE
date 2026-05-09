import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Clock, Eye, ChevronDown } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = ['All', 'YouTube Video Edit', 'Instagram Reels', 'Commercials', 'Short Films', 'Motion Graphics', 'Wedding / Event Edit', 'Podcast Edit'];

interface VideoProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  coverURL: string;
  videoURL: string;
  videoSize?: number;
  videoDuration?: number;
  uploadedAt: any;
  isVisible: boolean;
  views: number;
}

function ProjectCard({ project, index, onSelect }: { project: VideoProject; index: number; onSelect: (p: VideoProject) => void }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      onClick={() => onSelect(project)}
      className="relative group cursor-pointer aspect-video rounded-xl overflow-hidden border border-brand-red/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-brand-red/70 h-[240px] md:h-[280px] transition-all duration-400"
    >
      {/* Background Image Layer */}
      {isIntersecting && (
        <img 
          src={project.coverURL} 
          alt={project.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      {/* Red Shimmer Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
        <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-brand-red to-transparent" />
      </div>

      {/* Category Pill */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-brand-red text-black font-brand text-[10px] md:text-[11px] uppercase tracking-[2px] px-3 py-1 rounded-full shadow-[0_0_15px_#B22C3E]">
          {project.category}
        </span>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
          <h3 className="font-brand text-white text-lg md:text-2xl uppercase tracking-widest leading-tight line-clamp-1 mb-1">
            {project.title}
          </h3>
          <p className="text-white/70 font-sans text-xs md:text-sm line-clamp-2 mb-4 max-w-[90%] font-light">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {project.tags?.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[9px] text-white/40 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-sm">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_#B22C3E] group-hover:scale-110 transition-all group-hover:animate-pulse">
               <Play size={18} fill="black" className="text-black ml-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Portfolio() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const q = query(
      collection(db, 'videos'), 
      where('isVisible', '==', true),
      orderBy('uploadedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoProject));
      setProjects(projs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const displayedProjects = filteredProjects.slice(0, visibleCount);

  return (
    <section id="portfolio" className="py-24 px-4 md:px-6 relative bg-noise">
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="font-brand text-brand-red text-4xl md:text-7xl uppercase tracking-[4px] md:tracking-[8px]">
            Masterpieces
          </h2>
          <div className="flex items-center gap-6">
            <div className="h-0.5 w-24 bg-brand-red shadow-[0_0_15px_#B22C3E]" />
            <p className="text-text-muted font-brand uppercase tracking-[2px] md:tracking-[4px] text-sm md:text-lg">
              Visual Narrative Exhibition
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); setVisibleCount(9); }}
            className={`px-6 py-2.5 rounded-sm font-brand uppercase tracking-widest text-xs transition-all duration-300 border flex-shrink-0 ${
              filter === cat 
                ? 'bg-brand-red text-black border-brand-red shadow-[0_0_20px_rgba(178,44,62,0.4)]' 
                : 'bg-transparent text-brand-red border-brand-red/30 hover:border-brand-red'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {displayedProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              onSelect={(p) => setSelectedProject(p)} 
            />
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full shadow-[0_0_15px_#B22C3E]" />
           <p className="font-brand text-brand-red uppercase tracking-widest text-xs">Curating masterpieces...</p>
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="py-32 text-center">
          <p className="font-brand text-text-muted text-xl md:text-3xl uppercase tracking-[4px] opacity-40">
            No projects in this category
          </p>
        </div>
      )}

      {/* Load More Button */}
      {filteredProjects.length > visibleCount && (
        <div className="flex justify-center mt-20">
          <button
            onClick={() => setVisibleCount(prev => prev + 9)}
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <span className="font-brand text-brand-red uppercase tracking-[3px] text-xs">Explore More</span>
            <div className="w-12 h-12 rounded-full border border-brand-red/30 flex items-center justify-center group-hover:bg-brand-red/5 group-hover:border-brand-red transition-all">
              <ChevronDown className="text-brand-red group-hover:translate-y-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-4 md:p-8 overflow-y-auto pt-24"
            onClick={() => setSelectedProject(null)}
          >
            {/* Modal Header Controls */}
            <div className="fixed top-0 inset-x-0 p-6 md:p-12 flex justify-between items-center z-10 bg-gradient-to-b from-black to-transparent pointer-events-none">
               <h3 className="font-brand text-brand-red text-xl md:text-3xl uppercase tracking-widest leading-none pointer-events-auto max-w-[70%] truncate">
                  {selectedProject.title}
               </h3>
               <button 
                onClick={() => setSelectedProject(null)}
                className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red hover:bg-brand-red hover:text-black transition-all pointer-events-auto"
               >
                  <X size={24} />
               </button>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-[1100px] flex flex-col gap-8 py-12"
              onClick={e => e.stopPropagation()}
            >
              {/* Native HTML5 Video Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(178,44,62,0.15)] border border-brand-red/10 bg-black">
                <video 
                  key={selectedProject.videoURL}
                  src={selectedProject.videoURL} 
                  controls 
                  autoPlay 
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                />
              </div>

              {/* Project Info Below Video */}
              <div className="space-y-6">
                 <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-brand-red text-black font-brand text-[11px] uppercase tracking-[2px] px-4 py-1.5 rounded-full">
                       {selectedProject.category}
                    </span>
                    <div className="flex items-center gap-2 text-text-muted text-[11px] uppercase tracking-widest">
                       <Clock size={14} className="text-brand-red" />
                       {Math.floor(selectedProject.videoDuration || 0)}s Duration
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-[11px] uppercase tracking-widest">
                       <Eye size={14} className="text-brand-red" />
                       {selectedProject.views} Total Views
                    </div>
                 </div>

                 <p className="text-white/80 font-sans text-sm md:text-lg leading-relaxed max-w-3xl font-light">
                    {selectedProject.description}
                 </p>

                 <div className="flex flex-wrap gap-3">
                    {selectedProject.tags?.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest text-[10px] rounded-sm hover:border-brand-red/30 hover:text-brand-red transition-all cursor-default">
                         #{tag}
                      </span>
                    ))}
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
