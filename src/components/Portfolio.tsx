import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, ExternalLink, Clock, Eye } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = ['All', 'YouTube', 'Reels', 'Commercials', 'Short Films', 'Motion Graphics'];

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  duration?: string;
  thumbnail?: string;
  views?: number;
}

export function Portfolio() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      setVideos(vids);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredVideos = filter === 'All' 
    ? videos 
    : videos.filter(v => v.category === filter);

  const isDirectVideo = (url: string) => {
    const extensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    return extensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('firebasestorage');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const getThumbnail = (video: Video) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
      const id = video.url.split('v=')[1]?.split('&')[0] || video.url.split('/').pop();
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return '/placeholder-video.jpg'; // Need a default placeholder
  };

  return (
    <section id="portfolio" className="py-20 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-12 md:mb-16">
        <h2 className="font-brand text-brand-red text-4xl md:text-6xl uppercase tracking-[2px] md:tracking-[4px]">Portfolio</h2>
        <p className="text-text-muted mt-2 font-sans text-base md:text-xl">Visual Stories I've Crafted</p>
        <div className="w-16 md:w-24 h-1 bg-brand-red mt-4 shadow-[0_0_10px_#B22C3E]" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 pb-1.5 rounded-sm font-brand uppercase tracking-widest text-sm transition-all duration-300 border ${
              filter === cat 
                ? 'bg-brand-red text-black border-brand-red' 
                : 'bg-transparent text-brand-red border-brand-red/30 hover:border-brand-red'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col"
          >
            {/* Thumbnail Area */}
            <div 
              className="relative aspect-video overflow-hidden cursor-pointer bg-black/40"
              onClick={() => setSelectedVideo(video)}
            >
              <img 
                src={getThumbnail(video)}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-brand-red/90 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-[0_0_20px_rgba(178,44,62,0.5)]">
                  <Play className="text-black ml-1" fill="currentColor" size={28} />
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-[#141414]/80 backdrop-blur-md border border-brand-red/30 text-brand-red text-[10px] uppercase tracking-widest rounded-full">
                  {video.category}
                </span>
              </div>
              {video.duration && (
                 <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md text-brand-red text-[10px] rounded-full">
                   <Clock size={12} />
                   {video.duration}
                 </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-brand text-xl text-brand-red tracking-wide uppercase line-clamp-1">{video.title}</h3>
              <p className="text-text-muted text-sm mt-3 line-clamp-2 min-h-[40px]">{video.description}</p>
              
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-brand-red/10">
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {video.views !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} />
                      {video.views}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedVideo(video)}
                  className="font-brand text-brand-red text-sm tracking-wider uppercase flex items-center gap-2 hover:shadow-[0_0_10px_rgba(178,44,62,0.3)]"
                >
                  Watch Now <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <div className="py-20 text-center font-brand text-2xl text-text-muted uppercase tracking-[4px]">
          No projects found in this category
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-lg flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <button 
              className="absolute top-6 right-6 text-brand-red p-2 hover:scale-110 transition-transform"
              onClick={() => setSelectedVideo(null)}
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-[1000px] flex flex-col gap-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-brand text-3xl text-brand-red tracking-widest uppercase">{selectedVideo.title}</h3>
              <div className="relative aspect-video w-full glass-card rounded-xl overflow-hidden shadow-[0_0_50px_rgba(178,44,62,0.2)] bg-black">
                {isDirectVideo(selectedVideo.url) ? (
                  <video 
                    src={selectedVideo.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(selectedVideo.url)}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
