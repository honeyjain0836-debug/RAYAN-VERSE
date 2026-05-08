import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, Video, MessageSquare, Briefcase, Plus, Trash2, Eye, ExternalLink, Star, X, Settings as SettingsIcon, Upload, CheckCircle2, AlertCircle, Menu } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth, storage } from '../lib/firebase';
import { BrandLogo } from './ui/BrandElements';
import { uploadProfilePhoto, getProfilePhotoURL } from '../services/uploadPhoto';

const ADMIN_EMAIL = 'rayanjain234@gmail.com';
const ADMIN_PHONE = '9390522470';
const SECURITY_PIN = '123456';

export function AdminPanel() {
  const [step, setStep] = useState(1);
  const [isAuth, setIsAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-authenticate anonymously to hide latency
    // This runs in background as soon as Admin page starts loading
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Initial auth failed:", err);
      }
    };
    initAuth();
  }, []);

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    // Instant transition - no loading needed for simple check
    if (email === ADMIN_EMAIL && phone === ADMIN_PHONE) {
      setStep(2);
      setError('');
    } else {
      setError('Identity verification failed.');
    }
  };

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    // Instant transition for PIN check
    if (pin === SECURITY_PIN) {
      setIsAuth(true);
      window.scrollTo(0, 0);
    } else {
      setError('Invalid PIN.');
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-bg-matte flex flex-col items-center justify-center p-4 md:p-6 bg-noise relative">
        <a 
          href="/" 
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 glass-card rounded-full text-brand-red hover:bg-brand-red hover:text-black transition-all z-50 group"
          title="Return to Home"
        >
          <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
        </a>

        <BrandLogo className="text-3xl md:text-4xl mb-8 md:mb-12" />
        
        <div className="w-full max-w-md glass-card p-6 md:p-10 rounded-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleStep1}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="font-brand text-2xl text-brand-red uppercase tracking-widest">Identify Yourself</h2>
                  <p className="text-text-muted text-sm">Step 1: Identity Verification</p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg-secondary border border-brand-red/20 p-3 md:p-4 rounded-sm text-brand-red focus:border-brand-red outline-none text-sm md:text-base"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-bg-secondary border border-brand-red/20 p-3 md:p-4 rounded-sm text-brand-red focus:border-brand-red outline-none text-sm md:text-base"
                  />
                </div>

                {error && <p className="text-brand-red text-xs italic">{error}</p>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-red text-black font-brand uppercase tracking-widest hover:bg-brand-red-dark hover:shadow-[0_0_20px_#B22C3E] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Identity'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep2}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="font-brand text-2xl text-brand-red uppercase tracking-widest">Enter Security PIN</h2>
                  <p className="text-text-muted text-sm">Step 2: Security Verification</p>
                </div>

                <div className="flex gap-2 justify-center">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="......"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full text-center bg-bg-secondary border border-brand-red/20 p-3 md:p-4 rounded-sm text-brand-red focus:border-brand-red outline-none text-xl md:text-2xl tracking-[8px] md:tracking-[12px] font-bold"
                  />
                </div>

                {error && <p className="text-brand-red text-xs italic">{error}</p>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-red text-black font-brand uppercase tracking-widest hover:bg-brand-red-dark hover:shadow-[0_0_20px_#B22C3E] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Accessing...' : 'Access Portal'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-text-muted text-xs uppercase tracking-widest hover:text-brand-red">
                  Back to Step 1
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setIsAuth(false)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'videos' | 'reviews' | 'queries' | 'messages' | 'settings'>('videos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Profile Photo Management State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [processingMsg, setProcessingMsg] = useState('');
  const [manualURL, setManualURL] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualURLUpdate = async () => {
    if (!manualURL) return;
    setIsLoadingSettings(true);
    setUploadStatus('idle');
    setUploadError('');
    
    let processedURL = manualURL.trim();
    
    // Enhanced URL conversion
    if (processedURL.includes('drive.google.com') || processedURL.includes('google.com/open')) {
      // Handle /file/d/[ID]/ and ?id=[ID] and /open?id=[ID]
      const driveMatch = processedURL.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                        processedURL.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                        
      if (driveMatch && driveMatch[1]) {
        // Using the most reliable Drive image proxy
        processedURL = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
      }
    } else if (processedURL.includes('ibb.co/') && !processedURL.includes('i.ibb.co/')) {
      // If it's an ImgBB view page link, warn them or help them
      setUploadError('Please use the "Direct Link" from ImgBB (usually starts with i.ibb.co and ends with .png/.jpg)');
      setIsLoadingSettings(false);
      return;
    }

    try {
      const profileRef = doc(db, 'settings', 'profile');
      console.log('Saving profile photo URL:', processedURL);
      
      await setDoc(profileRef, {
        photoURL: processedURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setUploadStatus('success');
      setManualURL('');
      // Force refreshing the local settings state for instant feedback
      setSettings((prev: any) => ({ ...prev, photoURL: processedURL }));
      setPhotoURL(processedURL);
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Save failed:", err);
      setUploadError(err.message || "Failed to save URL. Check your connection.");
      setUploadStatus('error');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // New Video Form
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: 'YouTube', description: '', duration: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoSuccess, setVideoSuccess] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (activeTab === 'videos') {
      const unsub = onSnapshot(query(collection(db, 'videos'), orderBy('createdAt', 'desc')), s => 
        setVideos(s.docs.map(d => ({id: d.id, ...d.data()}))));
      unsubscribers.push(unsub);
    } else if (activeTab === 'reviews') {
      const unsub = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), s => 
        setReviews(s.docs.map(d => ({id: d.id, ...d.data()}))));
      unsubscribers.push(unsub);
    } else if (activeTab === 'queries') {
      const unsub = onSnapshot(query(collection(db, 'queries'), orderBy('createdAt', 'desc')), s => 
        setQueries(s.docs.map(d => ({id: d.id, ...d.data()}))));
      unsubscribers.push(unsub);
    } else if (activeTab === 'messages') {
      const unsub = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), s => 
        setMessages(s.docs.map(d => ({id: d.id, ...d.data()}))));
      unsubscribers.push(unsub);
    } else if (activeTab === 'settings') {
      const unsub = onSnapshot(doc(db, 'settings', 'profile'), doc => {
         const data = doc.data();
         setSettings(data);
         setPhotoURL(data?.photoURL || null);
      });
      unsubscribers.push(unsub);
    }
    
    return () => unsubscribers.forEach(unsub => unsub());
  }, [activeTab]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setImageError(false);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadError('');

    try {
      const url = await uploadProfilePhoto(selectedFile, (pct, msg) => {
        setUploadProgress(pct);
        setProcessingMsg(msg);
      });

      setUploadStatus('success');
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewURL(null);
      // Wait a bit then clear success
      setTimeout(() => setUploadStatus('idle'), 4000);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed");
      setUploadStatus('error');
      setIsUploading(false);
    }
  };

  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const handleAddVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (isAddingVideo || isVideoUploading) return;
    
    setIsAddingVideo(true);
    try {
      let finalUrl = newVideo.url;

      // Handle actual video file upload if present
      if (videoFile) {
        setIsVideoUploading(true);
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        
        const fileExt = videoFile.name.split('.').pop() || 'mp4';
        const storageRef = ref(storage, `portfolio/${Date.now()}-${newVideo.title.replace(/\s+/g, '-')}.${fileExt}`);
        const uploadTask = uploadBytesResumable(storageRef, videoFile);

        finalUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snap) => setVideoUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            (err) => reject(err),
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
          );
        }) as string;
      }

      await addDoc(collection(db, 'videos'), {
        ...newVideo,
        url: finalUrl,
        createdAt: serverTimestamp(),
        views: Math.floor(Math.random() * 1000)
      });
      
      setNewVideo({ title: '', url: '', category: 'YouTube', description: '', duration: '' });
      setVideoFile(null);
      setVideoUploadProgress(0);
      setVideoSuccess(true);
      setTimeout(() => setVideoSuccess(false), 4000);
    } catch (err: any) {
      console.error("Video add failed:", err);
      setError(err.message || "Failed to add video.");
    } finally {
      setIsAddingVideo(false);
      setIsVideoUploading(false);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const TABS = [
    { id: 'videos', icon: Video, label: 'Videos' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'queries', icon: Briefcase, label: 'Queries' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ] as const;

  return (
    <div className="min-h-screen bg-bg-matte flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-brand-red/10 bg-bg-matte shrink-0 z-50">
        <BrandLogo className="text-xl" />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-brand-red hover:bg-brand-red/5 rounded-lg active:scale-95 transition-all"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-bg-matte border-r border-brand-red/10 flex flex-col p-6 space-y-12 shrink-0
        transition-transform duration-300 md:translate-x-0 md:relative
        ${isMobileMenuOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
      `}>
        <div className="hidden md:block">
          <BrandLogo className="text-2xl" />
        </div>
        
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
               key={tab.id}
               onClick={() => {
                 setActiveTab(tab.id);
                 setIsMobileMenuOpen(false);
               }}
               className={`flex items-center gap-4 p-4 rounded-lg font-brand uppercase tracking-widest text-sm transition-all ${
                 activeTab === tab.id ? 'bg-brand-red text-black' : 'text-brand-red hover:bg-brand-red/5'
               }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => { auth.signOut(); onLogout(); }}
          className="mt-auto flex items-center gap-4 text-text-muted hover:text-brand-red p-4 transition-all uppercase tracking-widest text-xs font-brand"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
          <h1 className="font-brand text-3xl md:text-5xl text-brand-red uppercase tracking-[2px] md:tracking-[4px]">{activeTab} Management</h1>
          <div className="flex gap-4">
             <div className="text-left md:text-right">
                <p className="text-text-muted text-[10px] uppercase tracking-widest">Total Items</p>
                <p className="text-xl md:text-2xl font-brand text-brand-red">
                  {activeTab === 'videos' ? videos.length : activeTab === 'reviews' ? reviews.length : activeTab === 'queries' ? queries.length : activeTab === 'messages' ? messages.length : '-'}
                </p>
             </div>
          </div>
        </header>

        {activeTab === 'videos' && (
          <div className="space-y-8 md:space-y-12">
            <form onSubmit={handleAddVideo} className="glass-card p-6 md:p-8 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative overflow-hidden">
              <h3 className="col-span-full font-brand text-lg md:text-xl text-brand-red uppercase tracking-widest flex items-center gap-3">
                <Plus size={20} /> Add New Project
              </h3>
              <input value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} placeholder="Project Title" required className="bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm" />
              
              <div className="flex flex-col gap-2">
                <input 
                  value={newVideo.url} 
                  onChange={e => { setNewVideo({...newVideo, url: e.target.value}); if(e.target.value) setVideoFile(null); }} 
                  placeholder="URL (YouTube/Vimeo)" 
                  disabled={!!videoFile}
                  className="bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none disabled:opacity-50 text-sm" 
                />
                <p className="text-[9px] text-text-muted uppercase tracking-wider">OR UPLOAD FILE BELOW</p>
              </div>

              <select value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm">
                <option>YouTube</option>
                <option>Reels</option>
                <option>Commercials</option>
                <option>Short Films</option>
                <option>Motion Graphics</option>
              </select>
              
              <div className="col-span-full border-2 border-dashed border-brand-red/10 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center bg-black/20 gap-3">
                 <input 
                   type="file" 
                   ref={videoInputRef} 
                   onChange={(e) => { setVideoFile(e.target.files?.[0] || null); if(e.target.files?.[0]) setNewVideo({...newVideo, url: ''}); }} 
                   accept="video/*" 
                   className="hidden" 
                 />
                 {videoFile ? (
                   <div className="flex items-center gap-4 text-brand-red w-full justify-center">
                     <CheckCircle2 size={24} className="shrink-0" />
                     <div className="text-left overflow-hidden">
                       <p className="text-sm font-bold truncate max-w-[150px] md:max-w-[200px]">{videoFile.name}</p>
                       <p className="text-[10px] text-text-muted uppercase">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                     </div>
                     <button type="button" onClick={() => setVideoFile(null)} className="p-2 hover:bg-brand-red/10 rounded shrink-0"><X size={16} /></button>
                   </div>
                 ) : (
                   <button 
                     type="button" 
                     onClick={() => videoInputRef.current?.click()}
                     className="flex flex-col items-center gap-2 group w-full"
                   >
                     <Upload className="text-brand-red/40 group-hover:text-brand-red transition-colors" size={32} />
                     <p className="text-[10px] text-text-muted group-hover:text-brand-red transition-colors uppercase tracking-widest font-brand text-center">Click to Upload Video File</p>
                   </button>
                 )}
              </div>

              <input value={newVideo.duration} onChange={e => setNewVideo({...newVideo, duration: e.target.value})} placeholder="Duration (e.g. 2:34)" className="bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm" />
              <textarea value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} placeholder="Short Description" className="col-span-full bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm" />
              
              <button 
                type="submit" 
                disabled={isAddingVideo || isVideoUploading}
                className="col-span-full py-4 bg-brand-red text-black font-brand uppercase tracking-widest hover:bg-brand-red-dark disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {isVideoUploading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                    />
                    Uploading ({videoUploadProgress}%)
                  </>
                ) : isAddingVideo ? (
                  'Saving...'
                ) : 'Upload to Portfolio'}
              </button>


              <AnimatePresence>
                {videoSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full bg-brand-red/10 border border-brand-red/20 p-4 rounded text-brand-red text-center font-brand text-sm tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Project Uploaded Successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="grid gap-3 md:gap-4 font-sans">
              {videos.map(v => (
                <div key={v.id} className="glass-card p-3 md:p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between group gap-4 md:gap-0">
                  <div className="flex items-center gap-4 md:gap-6 w-full">
                    <div className="w-24 md:w-20 aspect-video bg-black rounded border border-brand-red/20 overflow-hidden shrink-0">
                      <img src={`https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url.split('/').pop()}/mqdefault.jpg`} className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-brand-red font-brand uppercase tracking-wider text-sm md:text-base truncate">{v.title}</h4>
                      <p className="text-[9px] md:text-[10px] text-text-muted uppercase tracking-widest">{v.category} • {v.duration || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all w-full sm:w-auto justify-end border-t sm:border-0 border-brand-red/10 pt-2 sm:pt-0">
                    <a href={v.url} target="_blank" className="p-2 text-brand-red hover:bg-brand-red/10 rounded"><ExternalLink size={18} /></a>
                    <button onClick={() => handleDelete('videos', v.id)} className="p-2 text-brand-red hover:bg-brand-red/10 rounded"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {reviews.map(r => (
              <div key={r.id} className="glass-card p-5 md:p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                   <div className="overflow-hidden">
                     <h4 className="text-brand-red font-brand text-lg md:text-xl uppercase tracking-widest truncate">{r.name}</h4>
                     <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-brand-red text-brand-red' : 'text-brand-red/20'} />)}
                     </div>
                   </div>
                   <button onClick={() => handleDelete('reviews', r.id)} className="text-brand-red hover:scale-110 p-2"><Trash2 size={18} /></button>
                </div>
                <p className="text-brand-red/80 font-sans text-sm line-clamp-4">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="grid gap-4 md:gap-6">
            {queries.map(q => (
              <div key={q.id} className="glass-card p-6 md:p-8 rounded-xl border-l-4 md:border-l-[6px] border-l-brand-red space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="text-brand-red font-brand text-xl md:text-2xl uppercase tracking-widest">{q.name}</h4>
                    <p className="text-[10px] text-text-muted uppercase tracking-[2px] md:tracking-[3px] mt-1">{q.projectType}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-0 border-brand-red/10 pt-4 sm:pt-0">
                    <p className="text-xl md:text-2xl font-brand text-brand-red">₹{q.budget.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Budget</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 text-sm border-t border-brand-red/10 pt-6">
                   <div className="space-y-2">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">Contact Information</p>
                      <p className="text-brand-red font-sans">{q.email}</p>
                      <p className="text-brand-red font-sans">{q.phone}</p>
                   </div>
                   <div className="space-y-2 sm:text-right">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">Project Timeline</p>
                      <p className="text-brand-red font-brand">{q.deadline || 'flexible'}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-2">Source</p>
                      <p className="text-brand-red text-xs font-sans italic">{q.source}</p>
                   </div>
                </div>

                <div className="bg-black/40 p-4 md:p-6 rounded-lg border border-brand-red/10">
                   <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">Requirements & Brief</p>
                   <p className="text-brand-red/90 text-sm whitespace-pre-wrap font-sans leading-relaxed">{q.requirements}</p>
                </div>
                
                <div className="flex justify-end gap-4">
                   <button onClick={() => handleDelete('queries', q.id)} className="w-full sm:w-auto px-6 py-3 border border-brand-red/30 text-brand-red font-brand text-xs uppercase tracking-widest rounded hover:bg-brand-red hover:text-black transition-all">Delete Entry</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 font-sans">
            {messages.map(m => (
              <div key={m.id} className="glass-card p-5 md:p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="overflow-hidden">
                    <h4 className="text-brand-red font-brand text-lg md:text-xl uppercase tracking-widest truncate">{m.name}</h4>
                    <p className="text-[10px] text-text-muted truncate">{m.email}</p>
                  </div>
                  <button onClick={() => handleDelete('messages', m.id)} className="text-brand-red hover:scale-110 p-2 shrink-0"><Trash2 size={18} /></button>
                </div>
                <div className="pt-4 border-t border-brand-red/10">
                   <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Subject: {m.subject || 'General Inquiry'}</p>
                   <p className="text-brand-red/80 text-sm leading-relaxed">{m.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex justify-start">
            <div id="photo-upload-section" className="bg-[#141414] border border-brand-red/25 rounded-xl p-6 md:p-8 w-full max-w-[420px] shadow-2xl">
              <h3 id="photo-upload-title" className="font-brand text-[#B22C3E] text-[16px] md:text-[18px] tracking-[3px] uppercase mb-5">PROFILE PHOTO</h3>
              
              {/* Current photo preview */}
              <div id="photo-preview-wrap" className="w-full aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden border-2 border-brand-red/35 mx-auto mb-5 bg-[#0a0a0a] flex items-center justify-center relative shadow-[0_0_20px_rgba(178,44,62,0.1)]">
                {/* Background Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center font-brand text-[48px] md:text-[56px] text-[#B22C3E]">
                  <span>RJ</span>
                </div>

                {(previewURL || photoURL) && (
                  <img 
                    id="photo-preview-img" 
                    src={previewURL || photoURL || ''} 
                    alt="Profile photo preview"
                    style={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
                    referrerPolicy="no-referrer"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                )}
              </div>

              {/* Upload controls */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              
              <button 
                id="photo-select-btn" 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 bg-transparent border-1.5 border-[#B22C3E] text-[#B22C3E] font-brand text-xs md:text-sm tracking-[2px] rounded-md transition-all hover:bg-[#B22C3E] hover:text-black mb-3 active:scale-[0.98]"
              >
                SELECT PHOTO
              </button>

              {selectedFile && !isUploading && (
                <div id="photo-file-info" className="font-sans text-[10px] md:text-[12px] text-[#B22C3E]/70 text-center mb-3 truncate px-2">
                  {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}

              {/* Progress bar */}
              {(isUploading) && (
                <div className="mb-3">
                  <div id="photo-progress-wrap" className="w-full bg-[#1a1a1a] rounded-full h-1.5 md:h-2 mb-2 overflow-hidden relative">
                    <motion.div 
                      id="photo-progress-bar" 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-[#B22C3E] rounded-full transition-all duration-300"
                    />
                  </div>
                  <span id="photo-progress-text" className="font-sans text-[10px] md:text-[12px] text-[#B22C3E] block text-center uppercase tracking-widest">
                    {processingMsg}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              {selectedFile && !isUploading && (
                <div id="photo-action-btns" className="flex flex-col sm:flex-row gap-2">
                  <button 
                    id="photo-upload-btn" 
                    type="button"
                    onClick={handlePhotoUpload}
                    className="flex-1 h-12 bg-[#B22C3E] text-black font-brand text-xs md:text-sm tracking-[2px] rounded-md transition-colors hover:bg-[#8a1e2a]"
                  >
                    UPLOAD
                  </button>
                  <button 
                    id="photo-cancel-btn" 
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewURL(null); }}
                    className="flex-1 h-12 bg-transparent border border-white/10 text-[#B22C3E]/60 font-brand text-xs md:text-sm tracking-[2px] rounded-md"
                  >
                    CANCEL
                  </button>
                </div>
              )}

              {/* Status messages */}
              {uploadStatus === 'success' && (
                <motion.div 
                  id="photo-status-msg" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="success font-sans text-xs md:text-[13px] text-center p-3 rounded-md mt-3 text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20"
                >
                  ✓ Updated successfully!
                </motion.div>
              )}

              {/* Manual URL Input */}
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-brand-red/10">
                <p className="font-brand text-[9px] md:text-[10px] text-brand-red uppercase tracking-[2px] md:tracking-[3px] mb-1">SET PHOTO VIA LINK</p>
                <p className="text-[9px] md:text-[10px] text-text-muted mb-3 uppercase tracking-widest">Supports Drive, ImgBB, Cloudinary</p>
                
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={manualURL}
                        onChange={(e) => {
                          setManualURL(e.target.value);
                          setUploadError('');
                        }}
                        placeholder="Paste image link here"
                        className="w-full bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-xs focus:border-brand-red/50 transition-colors"
                      />
                      {manualURL && (
                        <button 
                          onClick={() => setManualURL('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-red transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleManualURLUpdate}
                      disabled={isLoadingSettings || !manualURL}
                      className="px-6 h-10 sm:h-auto bg-brand-red text-black font-brand text-[11px] tracking-widest rounded-md transition-all hover:bg-brand-red-dark disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {isLoadingSettings ? (
                        <div className="w-3 h-3 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                      ) : 'SAVE'}
                    </button>
                  </div>

                  {/* Live Preview of the pasted URL */}
                  {manualURL && manualURL.length > 10 && (
                    <div className="p-3 bg-black/40 border border-brand-red/10 rounded overflow-hidden">
                      <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Live Preview:</p>
                      <div className="aspect-[3/4] max-h-[150px] mx-auto bg-black rounded relative overflow-hidden flex items-center justify-center">
                        <img 
                          src={manualURL.trim().includes('drive.google.com') ? `https://lh3.googleusercontent.com/d/${(manualURL.match(/\/d\/([a-zA-Z0-9_-]+)/) || manualURL.match(/[?&]id=([a-zA-Z0-9_-]+)/))?.[1] || ''}` : manualURL.trim()} 
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center -z-10 bg-brand-red/5">
                          <AlertCircle className="text-brand-red/20" size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[10px] text-brand-red mt-2 uppercase tracking-tight flex items-center gap-1">
                    <AlertCircle size={10} /> {uploadError}
                  </p>
                )}

                <div className="mt-4 p-4 bg-brand-red/5 border border-brand-red/10 rounded-lg group hover:border-brand-red/20 transition-colors">
                  <h4 className="text-[10px] text-brand-red font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-brand-red rounded-full" />
                    Help Tips
                  </h4>
                  <ol className="text-[9px] text-text-muted space-y-2 list-decimal ml-4 uppercase tracking-tighter">
                    <li>Set Drive photo to <span className="text-brand-red">"Anyone with the link"</span></li>
                    <li>Copy direct link from ImgBB/Cloudinary</li>
                    <li>Direct links usually end with <span className="text-white">.jpg or .png</span></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
