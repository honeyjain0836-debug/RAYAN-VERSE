import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Youtube, Instagram, Linkedin, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Badge, BrandLogo } from './ui/BrandElements';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Youtube, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="font-brand text-brand-red text-6xl uppercase tracking-[4px]">Contact</h2>
        <div className="w-24 h-1 bg-brand-red mt-4 shadow-[0_0_10px_#B22C3E]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-20">
        {/* Left Column - Details */}
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="glass-card p-10 rounded-2xl space-y-10"
        >
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="p-4 border border-brand-red/30 rounded-xl bg-brand-red/5">
                <Mail className="text-brand-red" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[3px] mb-1">Email</p>
                <p className="font-brand text-2xl text-brand-red tracking-wide">rayanjain234@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-4 border border-brand-red/30 rounded-xl bg-brand-red/5">
                <Phone className="text-brand-red" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[3px] mb-1">Phone</p>
                <p className="font-brand text-2xl text-brand-red tracking-wide">+91 93905 22470</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-4 border border-brand-red/30 rounded-xl bg-brand-red/5">
                <MapPin className="text-brand-red" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[3px] mb-1">Location</p>
                <p className="font-brand text-2xl text-brand-red tracking-wide">India</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-4 border border-brand-red/30 rounded-xl bg-brand-red/5">
                <Clock className="text-brand-red" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[3px] mb-1">Response Time</p>
                <p className="font-brand text-2xl text-brand-red tracking-wide">Within 24 Hours</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Badge />
          </div>

          <div className="flex gap-4">
            {socialLinks.map((social, i) => (
              <a 
                key={i}
                href={social.href}
                className="w-11 h-11 border border-brand-red/30 rounded-full flex items-center justify-center text-brand-red transition-all hover:bg-brand-red hover:text-black hover:shadow-[0_0_15px_rgba(178,44,62,0.5)]"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Right Column - Form */}
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="space-y-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                required
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
              />
              <input
                required
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
              />
            </div>
            <input
              required
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50"
            />
            <textarea
              required
              placeholder="Message"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-bg-secondary border border-brand-red/20 p-4 rounded-sm text-brand-red focus:border-brand-red outline-none transition-all placeholder:text-text-muted/50 min-h-[140px]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-red text-black font-brand text-lg uppercase tracking-[4px] hover:bg-brand-red-dark hover:shadow-[0_0_30px_rgba(178,44,62,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send size={18} />
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-sm text-brand-red text-center font-brand text-sm tracking-widest uppercase"
                >
                  Message sent successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-brand-red/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16 mb-16">
          <div className="space-y-6">
            <BrandLogo className="text-3xl" />
            <div className="space-y-1">
              <p className="text-brand-red font-brand text-sm tracking-widest">Featured by Rayanjainn</p>
              <p className="text-text-muted text-xs uppercase tracking-widest font-sans">Professional Video Editor | India</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-brand text-brand-red tracking-widest uppercase text-sm">Quick Links</h4>
            <div className="grid grid-cols-2 gap-4">
              {['Home', 'About', 'Portfolio', 'Reviews', 'Contact'].map(link => (
                <a 
                  key={link} 
                  href={`#${link.toLowerCase()}`}
                  className="text-text-muted hover:text-brand-red font-brand text-xs uppercase tracking-wider transition-all"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-brand text-brand-red tracking-widest uppercase text-sm">Socials</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-brand-red/20 rounded-full flex items-center justify-center text-brand-red transition-all hover:bg-brand-red hover:text-black">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-brand-red/20 rounded-full flex items-center justify-center text-brand-red transition-all hover:bg-brand-red hover:text-black">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-brand-red/20 rounded-full flex items-center justify-center text-brand-red transition-all hover:bg-brand-red hover:text-black">
                <Linkedin size={18} />
              </a>
            </div>
            <div className="pt-2">
               <p className="text-text-muted text-xs">rayanjain234@gmail.com</p>
               <p className="text-text-muted text-xs mt-1">+91 93905 22470</p>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-brand-red/10 text-center flex flex-col items-center gap-4">
          <p className="text-text-muted text-[10px] font-sans uppercase tracking-[2px]">
            © 2025 RAYANNN.VERSE — All Rights Reserved. Crafted by Rayanjainn
          </p>
          <a 
            href="/admin" 
            className="text-brand-red/20 hover:text-brand-red font-brand text-[10px] items-center flex gap-1 uppercase tracking-[4px] transition-all"
          >
            <span className="w-1 h-1 rounded-full bg-brand-red/20" />
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
