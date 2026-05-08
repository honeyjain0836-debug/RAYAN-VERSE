import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, User, Calendar, Send, ChevronRight } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: any;
}

export function ReviewsAndQueries() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Order Form State
  const [orderSent, setOrderSent] = useState(false);
  const [budget, setBudget] = useState(1200);
  const [customBudget, setCustomBudget] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'YouTube Video Edit',
    requirements: '',
    deadline: '',
    source: 'Instagram'
  });

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });
    return () => unsubscribe();
  }, []);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        name: reviewName,
        rating: reviewRating,
        text: reviewText,
        createdAt: serverTimestamp()
      });
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewModal(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'queries'), {
        ...formData,
        budget: budget === 5000 ? (parseInt(customBudget) || 5000) : budget,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setOrderSent(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section id="reviews" className="py-20 md:py-24 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* REVIEWS SECTION */}
        <div className="space-y-8 md:space-y-12">
          <div>
            <h2 className="font-brand text-brand-red text-4xl md:text-6xl uppercase tracking-[2px] md:tracking-[4px]">What They Say</h2>
            <div className="w-16 md:w-24 h-1 bg-brand-red mt-4 shadow-[0_0_10px_#B22C3E]" />
          </div>

          <div className="space-y-6 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="text-text-muted font-sans text-xl italic">Be the first to share your experience</p>
            ) : (
              reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-xl border-l-[4px] border-l-brand-red"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-brand text-xl text-brand-red tracking-wide uppercase">{review.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "text-brand-red fill-brand-red" : "text-brand-red/20"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-red/90 font-sans leading-relaxed">{review.text}</p>
                  <div className="mt-4 text-[10px] text-text-muted uppercase tracking-widest">
                    {review.createdAt?.toDate().toLocaleDateString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full py-4 border border-brand-red text-brand-red font-brand uppercase tracking-[3px] hover:bg-brand-red hover:text-black transition-all"
          >
            Leave a Review
          </button>
        </div>

        {/* QUERIES SECTION */}
        <div className="space-y-8 md:space-y-12">
          <div>
            <h2 className="font-brand text-brand-red text-4xl md:text-6xl uppercase tracking-[2px] md:tracking-[4px]">Place an Order</h2>
            <p className="text-text-muted mt-2 font-sans text-base md:text-xl">Tell me about your project</p>
            <div className="w-16 md:w-24 h-1 bg-brand-red mt-4 shadow-[0_0_10px_#B22C3E]" />
          </div>

          <AnimatePresence mode="wait">
            {!orderSent ? (
              <motion.form 
                key="order-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleOrderSubmit}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    required
                    type="text"
                    placeholder="Your Name"
                    className="bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    required
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    className="bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                
                <select 
                  className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all appearance-none cursor-pointer"
                  onChange={e => setFormData({...formData, projectType: e.target.value})}
                >
                  <option>YouTube Video Edit</option>
                  <option>Instagram Reels</option>
                  <option>Commercial Ad Edit</option>
                  <option>Short Film Edit</option>
                  <option>Motion Graphics</option>
                  <option>Wedding/Event Edit</option>
                  <option>Podcast Edit</option>
                  <option>Other (specify)</option>
                </select>

                <textarea
                  required
                  placeholder="Describe your project in detail — footage type, style, mood, references, duration etc."
                  className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50 min-h-[140px]"
                  onChange={e => setFormData({...formData, requirements: e.target.value})}
                />

                {/* BUDGET SLIDER */}
                <div className="space-y-6 py-4">
                  <div className="flex justify-between items-end">
                    <label className="font-brand text-brand-red tracking-widest uppercase text-sm">Budget Range</label>
                    <span className="font-brand text-2xl text-brand-red animate-pulse">
                      ₹{budget === 5000 ? (customBudget ? customBudget + '+' : '5,000+') : budget.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-red"
                      style={{
                        background: `linear-gradient(to right, #B22C3E 0%, #B22C3E ${(budget-500)/4500 * 100}%, #222 ${(budget-500)/4500 * 100}%, #222 100%)`
                      }}
                    />
                    <div className="flex justify-between mt-3 text-[10px] font-brand text-text-muted uppercase tracking-widest">
                      <span>₹500</span>
                      <span>₹700</span>
                      <span>₹1000</span>
                      <span>₹2000</span>
                      <span>₹5000+</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {budget === 5000 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <input
                          type="number"
                          placeholder="My budget exceeds ₹5000 — Enter amount:"
                          className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted text-sm mt-2"
                          value={customBudget}
                          onChange={e => setCustomBudget(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-text-muted uppercase tracking-[3px] ml-1">Project Deadline</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all"
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-text-muted uppercase tracking-[3px] ml-1">How did you find me?</label>
                    <select 
                      className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all appearance-none cursor-pointer"
                      onChange={e => setFormData({...formData, source: e.target.value})}
                    >
                      <option>Instagram</option>
                      <option>YouTube</option>
                      <option>Friend's Referral</option>
                      <option>Google Search</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full group bg-brand-red text-black font-brand text-lg py-4 rounded-sm uppercase tracking-[4px] hover:bg-brand-red-dark hover:shadow-[0_0_30px_rgba(178,44,62,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Send Order Request
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success-screen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 rounded-2xl flex flex-col items-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-brand-red/10 rounded-full flex items-center justify-center border border-brand-red/30">
                  <CheckCircle2 size={48} className="text-brand-red" />
                </div>
                <h3 className="font-brand text-4xl text-brand-red uppercase tracking-widest">Order Request Sent!</h3>
                <p className="text-text-muted font-sans text-xl">Rayanjainn will contact you within 24 hours</p>
                <button 
                  onClick={() => setOrderSent(false)}
                  className="pt-10 text-brand-red font-brand uppercase tracking-widest text-sm hover:underline"
                >
                  Send another request
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card p-8 rounded-2xl space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-brand text-3xl text-brand-red uppercase tracking-widest">Leave a Review</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[3px] block mb-2">Your Name</label>
                  <input
                    required
                    type="text"
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    className="w-full bg-bg-secondary border border-brand-red/20 p-3 rounded-sm text-brand-red focus:border-brand-red outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[3px] block mb-2">Rating</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewRating(num)}
                        className={`text-2xl transition-all ${num <= reviewRating ? 'text-brand-red scale-125' : 'text-brand-red/20 scale-100'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[3px] block mb-2">Message</label>
                  <textarea
                    required
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full bg-bg-secondary border border-brand-red/20 p-3 rounded-sm text-brand-red focus:border-brand-red outline-none min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || reviewSuccess}
                  className="w-full py-4 bg-brand-red text-black font-brand uppercase tracking-widest hover:bg-brand-red-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? 'Submitting...' : reviewSuccess ? <><CheckCircle2 size={18} /> Review Sent!</> : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #B22C3E;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(178, 44, 62, 0.5);
          transition: all 0.2s ease-in-out;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          scale: 1.2;
          box-shadow: 0 0 20px rgba(178, 44, 62, 0.8);
        }
      `}</style>
    </section>
  );
}

export function MarqueeStrip() {
  const text = "AVAILABLE FOR PROJECTS ● PROFESSIONAL VIDEO EDITOR ● RAYANNN.VERSE ● FEATURED BY RAYANJAINN ● CINEMATIC EDITS ● COLOR GRADING ● MOTION GRAPHICS ● VISUAL STORYTELLING ● ";
  return (
    <div className="w-full h-11 bg-brand-red overflow-hidden flex items-center relative group">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap group-hover:[animation-play-state:paused]">
        <div className="flex py-2">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-black font-brand uppercase text-base tracking-widest font-bold">
              {text}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
}
