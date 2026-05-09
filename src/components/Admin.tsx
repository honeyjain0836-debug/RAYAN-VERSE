import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, Video, MessageSquare, Briefcase, Plus, Trash2, Eye, ExternalLink, Star, X, Settings as SettingsIcon, Upload, CheckCircle2, AlertCircle, Menu, LayoutDashboard, Clock, User, Filter, Image as ImageIcon, Sparkles, ChevronRight, Check } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, storage } from '../lib/firebase';
import { BrandLogo } from './ui/BrandElements';
import { uploadProfilePhoto } from '../services/uploadPhoto';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

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
    // Load remembered credentials if threshold reached
    const loginCount = parseInt(localStorage.getItem('quik_admin_login_count') || '0');
    if (loginCount >= 2) {
      const savedEmail = localStorage.getItem('quik_admin_email');
      const savedPhone = localStorage.getItem('quik_admin_phone');
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    }

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
      
      // Update login persistence
      const currentCount = parseInt(localStorage.getItem('quik_admin_login_count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('quik_admin_login_count', newCount.toString());
      
      // Store credentials for auto-suggest (Step 1 only)
      localStorage.setItem('quik_admin_email', email);
      localStorage.setItem('quik_admin_phone', phone);
      
      setError('');
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
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg-secondary border border-brand-red/20 p-3 md:p-4 rounded-sm text-brand-red focus:border-brand-red outline-none text-sm md:text-base"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    autoComplete="tel"
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
                    autoComplete="off"
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'reviews' | 'queries' | 'messages' | 'settings'>('dashboard');
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

  // New Project Upload State
  const [newVideo, setNewVideo] = useState({ 
    title: '', 
    category: 'YouTube Video Edit', 
    description: '', 
    tags: '' 
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState({ size: 0, duration: 0, name: '' });
  
  // Progress states
  const [uploadStage, setUploadStage] = useState<'idle' | 'validating' | 'processing' | 'uploading_cover' | 'uploading_video' | 'saving' | 'success'>('idle');
  const [coverProgress, setCoverProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStats, setVideoStats] = useState({ uploaded: 0, total: 0, speed: 0, remaining: 0 });
  const [videoSuccess, setVideoSuccess] = useState(false);
  const [formError, setFormError] = useState<{ [key: string]: string }>({});

  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return 'calculating...';
    if (seconds < 60) return `~${Math.round(seconds)} seconds left`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `~${mins} min ${secs} sec left`;
  };

  const handleVideoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoMetadata({
        size: file.size,
        name: file.name,
        duration: 0
      });
      
      // Try to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoMetadata(prev => ({ ...prev, duration: video.duration }));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleCoverSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    try {
      // Handle HEIC/HEIF
      if (file.type === '' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        setProcessingMsg("Converting HEIC from iPhone...");
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        file = new File([Array.isArray(blob) ? blob[0] : blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
      }

      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setFormError(prev => ({ ...prev, cover: '' }));
    } catch (err) {
      console.error("Cover selection error:", err);
      setError("Failed to process cover image.");
    }
  };

  const handleUploadProject = async (e: FormEvent) => {
    e.preventDefault();
    if (uploadStage !== 'idle') return;

    // Validation
    const errors: { [key: string]: string } = {};
    if (!newVideo.title) errors.title = "Project title is required";
    if (!newVideo.description) errors.description = "Description is required";
    if (!coverFile) errors.cover = "Cover image is mandatory";
    if (!videoFile) errors.video = "Video file is mandatory";

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    setUploadStage('validating');
    setError('');

    try {
      // Processing Image
      setUploadStage('processing');
      const compressedCover = await imageCompression(coverFile!, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.85
      });

      // Upload Cover
      setUploadStage('uploading_cover');
      const coverRef = ref(storage, `covers/${Date.now()}-cover.jpg`);
      const coverTask = uploadBytesResumable(coverRef, compressedCover);
      
      const coverURL = await new Promise((resolve, reject) => {
        coverTask.on('state_changed',
          (snap) => setCoverProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          (err) => reject(err),
          async () => resolve(await getDownloadURL(coverTask.snapshot.ref))
        );
      }) as string;

      // Upload Video
      setUploadStage('uploading_video');
      const videoExt = videoFile!.name.split('.').pop() || 'mp4';
      const videoPath = `videos/${Date.now()}-video.${videoExt}`;
      const videoRef = ref(storage, videoPath);
      const videoTask = uploadBytesResumable(videoRef, videoFile!);
      
      let startTime = Date.now();
      let lastUploaded = 0;

      const videoURL = await new Promise((resolve, reject) => {
        videoTask.on('state_changed',
          (snap) => {
            const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
            setVideoProgress(Math.round(progress));
            
            // Calculate speed and remaining time
            const now = Date.now();
            const elapsed = (now - startTime) / 1000; // seconds
            if (elapsed > 1) {
              const uploaded = snap.bytesTransferred;
              const speed = (uploaded - lastUploaded) / (now - startTime) * 1000; // bytes per second
              const remaining = (snap.totalBytes - uploaded) / speed;
              
              setVideoStats({
                uploaded: uploaded,
                total: snap.totalBytes,
                speed: speed,
                remaining: remaining
              });
            }
          },
          (err) => reject(err),
          async () => resolve(await getDownloadURL(videoTask.snapshot.ref))
        );
      }) as string;

      // Saving to Firestore
      setUploadStage('saving');
      await addDoc(collection(db, 'videos'), {
        title: newVideo.title,
        category: newVideo.category,
        description: newVideo.description,
        tags: newVideo.tags.split(',').map(t => t.trim()).filter(t => t),
        coverURL,
        videoURL,
        coverPath: coverRef.fullPath,
        videoPath,
        videoSize: videoFile!.size,
        videoDuration: videoMetadata.duration,
        uploadedAt: serverTimestamp(),
        isVisible: true,
        views: 0
      });

      setUploadStage('success');
      setVideoSuccess(true);
    } catch (err: any) {
      console.error("Project upload failed:", err);
      
      let msg = "Failed to upload project. Please retry.";
      if (err.code === 'storage/retry-limit-exceeded') {
        msg = "The upload was interrupted too many times due to a poor connection. We've increased the timeout limit; please try again.";
      } else if (err.code === 'storage/unauthorized') {
        msg = "Authentication failed. Please refresh the page and try again.";
      } else if (err.message?.includes('quota')) {
        msg = "Storage quota exceeded for today. Please try again tomorrow.";
      } else {
        msg = err.message || msg;
      }
      
      setError(msg);
      setUploadStage('idle');
    }
  };

  const resetForm = () => {
    setNewVideo({ title: '', category: 'YouTube Video Edit', description: '', tags: '' });
    setVideoFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setUploadStage('idle');
    setVideoSuccess(false);
    setFormError({});
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'videos', id), { isVisible: !current });
  };

  const deleteProject = async (project: any) => {
    if (confirm(`Are you sure you want to delete ${project.title}? This cannot be undone.`)) {
      try {
        if (project.videoPath) await deleteObject(ref(storage, project.videoPath));
        if (project.coverPath) await deleteObject(ref(storage, project.coverPath));
        await deleteDoc(doc(db, 'videos', project.id));
      } catch (err) {
        console.error("Delete failed:", err);
        // Still delete doc if storage files are missing
        await deleteDoc(doc(db, 'videos', project.id));
      }
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const updateQueryStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'queries', id), { status });
    } catch (err) {
      console.error("Update status failed:", err);
    }
  };

  const TABS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'videos', icon: Video, label: 'Videos' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'queries', icon: Briefcase, label: 'Queries' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ] as const;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(undefined, { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

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
        fixed inset-y-0 left-0 z-[100] w-64 bg-bg-matte border-r border-brand-red/10 flex flex-col
        transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 shrink-0">
            <BrandLogo className="text-2xl" />
            <a 
              href="/" 
              className="mt-4 flex items-center gap-2 text-[10px] text-text-muted hover:text-brand-red font-brand uppercase tracking-[2px] transition-all group"
            >
              <div className="w-1 h-1 bg-brand-red rounded-full group-hover:scale-150 transition-transform" />
              Back to Site
            </a>
          </div>
          
          <nav className="flex flex-col gap-2 overflow-y-auto scrollbar-hide flex-1 pr-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-4 p-4 rounded-lg font-brand uppercase tracking-widest text-sm transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-brand-red text-black shadow-[0_0_15px_rgba(178,44,62,0.3)]' 
                    : 'text-brand-red hover:bg-brand-red/5'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
            
            <div className="md:hidden pt-4 border-t border-brand-red/10 mt-4">
              <a 
                href="/" 
                className="flex items-center gap-4 p-4 text-brand-red hover:bg-brand-red/5 rounded-lg font-brand uppercase tracking-widest text-sm transition-all"
              >
                <X size={20} />
                Return to Site
              </a>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-brand-red/10 shrink-0">
            <button 
              onClick={() => { auth.signOut(); onLogout(); }}
              className="w-full flex items-center gap-4 text-text-muted hover:text-brand-red p-2 transition-all uppercase tracking-widest text-xs font-brand"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
          <div className="space-y-1">
            <h1 className="font-brand text-3xl md:text-5xl text-brand-red uppercase tracking-[2px] md:tracking-[4px]">{activeTab === 'dashboard' ? 'Overview' : activeTab + ' Management'}</h1>
            <div className="flex items-center gap-4">
               <a href="/" className="text-[10px] text-text-muted hover:text-brand-red uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <ExternalLink size={12} /> View Live Website
               </a>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="text-left md:text-right">
                <p className="text-text-muted text-[10px] uppercase tracking-widest">Active Focus</p>
                <p className="text-xl md:text-2xl font-brand text-brand-red uppercase">
                   {activeTab}
                </p>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
               {[
                 { label: 'Total Projects', value: videos.length, icon: Video, color: 'text-blue-400' },
                 { label: 'Client Reviews', value: reviews.length, icon: Star, color: 'text-yellow-400' },
                 { label: 'Pending Queries', value: queries.filter(q => q.status === 'pending').length, icon: Briefcase, color: 'text-brand-red' },
                 { label: 'New Messages', value: messages.length, icon: MessageSquare, color: 'text-green-400' },
               ].map((stat, i) => (
                 <div key={i} className="glass-card p-6 md:p-8 rounded-xl relative overflow-hidden group">
                    <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform duration-500`} />
                    <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl md:text-4xl font-brand text-brand-red">{stat.value}</p>
                 </div>
               ))}
            </div>

            {/* Recent Activity Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="glass-card rounded-2xl overflow-hidden border border-brand-red/10">
                  <div className="p-6 border-b border-brand-red/10 flex justify-between items-center">
                    <h3 className="font-brand text-brand-red uppercase tracking-widest flex items-center gap-3">
                       <Clock size={18} /> Recent Queries
                    </h3>
                    <button onClick={() => setActiveTab('queries')} className="text-[10px] text-text-muted uppercase tracking-widest hover:text-brand-red">View All</button>
                  </div>
                  <div className="p-2">
                    {queries.slice(0, 5).map(q => (
                      <div key={q.id} className="p-4 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group">
                        <div className="overflow-hidden">
                          <p className="font-brand text-brand-red uppercase truncate">{q.name}</p>
                          <p className="text-[10px] text-text-muted truncate">{q.projectType}</p>
                        </div>
                        <div className="text-right shrink-0">
                           <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-full border ${
                             q.status === 'pending' ? 'border-brand-red text-brand-red animate-pulse' : 'border-green-500 text-green-500'
                           }`}>
                             {q.status || 'pending'}
                           </span>
                        </div>
                      </div>
                    ))}
                    {queries.length === 0 && <p className="p-8 text-center text-text-muted text-sm font-brand uppercase tracking-widest opacity-50 italic">No queries yet</p>}
                  </div>
               </div>

               <div className="glass-card rounded-2xl overflow-hidden border border-brand-red/10">
                  <div className="p-6 border-b border-brand-red/10 flex justify-between items-center">
                    <h3 className="font-brand text-brand-red uppercase tracking-widest flex items-center gap-3">
                       <User size={18} /> New Messages
                    </h3>
                    <button onClick={() => setActiveTab('messages')} className="text-[10px] text-text-muted uppercase tracking-widest hover:text-brand-red">View All</button>
                  </div>
                  <div className="p-2">
                    {messages.slice(0, 5).map(m => (
                      <div key={m.id} className="p-4 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group">
                        <div className="overflow-hidden">
                          <p className="font-brand text-brand-red uppercase truncate">{m.name}</p>
                          <p className="text-[10px] text-text-muted truncate">{m.subject || 'General Inquiry'}</p>
                        </div>
                        <div className="text-right text-[10px] text-text-muted uppercase tracking-tighter">
                          {formatDate(m.createdAt).split(',')[0]}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="p-8 text-center text-text-muted text-sm font-brand uppercase tracking-widest opacity-50 italic">No messages yet</p>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {uploadStage === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-brand-red/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={48} className="text-brand-red" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-brand text-3xl text-brand-red uppercase tracking-widest">Project Published!</h3>
                    <p className="text-text-muted">Your masterpiece is now live in the portfolio.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={resetForm}
                      className="px-8 py-3 bg-brand-red text-black font-brand uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(178,44,62,0.4)] transition-all"
                    >
                      Upload Another
                    </button>
                    <a 
                      href="/#portfolio" 
                      className="px-8 py-3 border border-brand-red/30 text-brand-red font-brand uppercase tracking-widest text-sm hover:bg-brand-red/5 transition-all"
                    >
                      View Portfolio
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <form onSubmit={handleUploadProject} className="space-y-8">
                    <div className="glass-card p-6 md:p-8 rounded-xl space-y-6">
                      <div className="flex items-center gap-3 border-b border-brand-red/10 pb-4">
                        <Video size={20} className="text-brand-red" />
                        <h3 className="font-brand text-lg text-brand-red uppercase tracking-widest">New Project Details</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-text-muted uppercase tracking-widest font-brand">Project Title *</label>
                          <input 
                            value={newVideo.title} 
                            onChange={e => setNewVideo({...newVideo, title: e.target.value})} 
                            placeholder="Enter project title" 
                            className={`w-full bg-bg-secondary border ${formError.title ? 'border-brand-red' : 'border-brand-red/20'} p-3 rounded text-brand-red outline-none text-sm font-brand uppercase tracking-wider`} 
                          />
                          {formError.title && <p className="text-brand-red text-[10px] uppercase font-brand italic">{formError.title}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-text-muted uppercase tracking-widest font-brand">Category *</label>
                          <select 
                            value={newVideo.category} 
                            onChange={e => setNewVideo({...newVideo, category: e.target.value})} 
                            className="w-full bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm font-brand uppercase tracking-widest"
                          >
                            <option>YouTube Video Edit</option>
                            <option>Instagram Reels</option>
                            <option>Commercials</option>
                            <option>Short Films</option>
                            <option>Motion Graphics</option>
                            <option>Wedding / Event Edit</option>
                            <option>Podcast Edit</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div className="space-y-2 col-span-full">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-text-muted uppercase tracking-widest font-brand">Description *</label>
                            <span className={`text-[10px] font-brand ${newVideo.description.length > 180 ? 'text-brand-red font-bold' : 'text-text-muted'}`}>
                              {newVideo.description.length}/200
                            </span>
                          </div>
                          <textarea 
                            value={newVideo.description} 
                            onChange={e => setNewVideo({...newVideo, description: e.target.value.slice(0, 200)})} 
                            placeholder="Brief description of this project" 
                            className={`w-full h-24 bg-bg-secondary border ${formError.description ? 'border-brand-red' : 'border-brand-red/20'} p-3 rounded text-brand-red outline-none text-sm resize-none`}
                          />
                          {formError.description && <p className="text-brand-red text-[10px] uppercase font-brand italic">{formError.description}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-text-muted uppercase tracking-widest font-brand">Tags (Optional)</label>
                          <input 
                            value={newVideo.tags} 
                            onChange={e => setNewVideo({...newVideo, tags: e.target.value})} 
                            placeholder="cinematic, color grading, reels" 
                            className="w-full bg-bg-secondary border border-brand-red/20 p-3 rounded text-brand-red outline-none text-sm" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cover Image Upload */}
                      <div className="glass-card p-6 rounded-xl space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-brand text-brand-red uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} /> Cover Image *
                          </h4>
                          <p className="text-[10px] text-text-muted uppercase italic">Thumbnail for project card</p>
                        </div>
                        
                        <div 
                          onClick={() => coverInputRef.current?.click()}
                          className={`relative h-40 border-2 border-dashed ${formError.cover ? 'border-brand-red/50 bg-brand-red/5' : 'border-brand-red/10 bg-black/20'} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-red/30 transition-all overflow-hidden group`}
                        >
                          <input type="file" ref={coverInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                          
                          {coverPreview ? (
                            <>
                              <img src={coverPreview} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={32} className="text-brand-red mb-2" />
                                <span className="text-[10px] font-brand uppercase tracking-widest text-white">Change Image</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-center px-4">
                              <ImageIcon size={32} className="text-brand-red/40" />
                              <div className="space-y-1">
                                <p className="text-[10px] text-text-muted font-brand uppercase tracking-[2px]">Tap to select cover image</p>
                                <p className="text-[9px] text-text-muted/60 uppercase">JPG, PNG, WEBP, HEIC accepted</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {coverFile && <p className="text-[9px] text-text-muted uppercase truncate">File: {coverFile.name} ({formatSize(coverFile.size)})</p>}
                        {formError.cover && <p className="text-brand-red text-[10px] uppercase font-brand italic">{formError.cover}</p>}
                      </div>

                      {/* Video Upload */}
                      <div className="glass-card p-6 rounded-xl space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-brand text-brand-red uppercase tracking-widest flex items-center gap-2">
                            <Video size={16} /> Video File *
                          </h4>
                          <p className="text-[10px] text-text-muted uppercase italic">Any size accepted — high quality</p>
                        </div>
                        
                        <div 
                          onClick={() => videoInputRef.current?.click()}
                          className={`relative h-40 border-2 border-dashed ${formError.video ? 'border-brand-red/50 bg-brand-red/5' : 'border-brand-red/10 bg-black/20'} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-red/30 transition-all overflow-hidden group`}
                        >
                          <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" />
                          
                          {videoFile ? (
                            <div className="flex flex-col items-center gap-3 text-center px-4">
                              <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center">
                                <Video size={32} className="text-brand-red" />
                              </div>
                              <div className="space-y-1 overflow-hidden w-full">
                                <p className="text-[10px] text-brand-red font-brand uppercase tracking-widest truncate">{videoFile.name}</p>
                                <p className="text-[9px] text-text-muted uppercase">{formatSize(videoFile.size)} selected</p>
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} className="text-[9px] text-text-muted uppercase hover:text-brand-red underline">Change Video</button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-center px-4">
                              <Sparkles size={32} className="text-brand-red/40" />
                              <div className="space-y-1">
                                <p className="text-[10px] text-text-muted font-brand uppercase tracking-[2px]">Tap to select video</p>
                                <p className="text-[9px] text-text-muted/60 uppercase">MP4, MOV, AVI, WEBM accepted</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {formError.video && <p className="text-brand-red text-[10px] uppercase font-brand italic">{formError.video}</p>}
                      </div>
                    </div>

                    {uploadStage !== 'idle' && (
                      <div className="glass-card p-6 md:p-8 rounded-xl space-y-6">
                        <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-widest font-brand">
                          <div className="flex gap-4">
                            <span className={uploadStage === 'validating' ? 'text-brand-red' : ''}>{uploadStage === 'validating' ? '●' : '✓'} Validating</span>
                            <span className={uploadStage === 'processing' ? 'text-brand-red' : ''}>{uploadStage === 'processing' ? '●' : '✓'} Processing</span>
                            <span className={uploadStage === 'uploading_cover' ? 'text-brand-red' : ''}>{uploadStage === 'uploading_cover' ? '●' : '✓'} Cover</span>
                            <span className={uploadStage === 'uploading_video' ? 'text-brand-red' : ''}>{uploadStage === 'uploading_video' ? '●' : '✓'} Video</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-[10px] uppercase font-brand">
                               <span className="text-text-muted tracking-widest">Main Video Upload</span>
                               <span className="text-brand-red animate-pulse">{videoProgress}%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${videoProgress}%` }}
                                  className="h-full bg-brand-red shadow-[0_0_10px_#B22C3E]"
                                />
                             </div>
                             {uploadStage === 'uploading_video' && (
                               <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div className="space-y-1">
                                     <p className="text-[9px] text-text-muted uppercase">Downloaded</p>
                                     <p className="text-xs font-brand text-brand-red">{formatSize(videoStats.uploaded)} / {formatSize(videoStats.total)}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                     <p className="text-[9px] text-text-muted uppercase">Remaining</p>
                                     <p className="text-xs font-brand text-brand-red">{formatTime(videoStats.remaining)}</p>
                                  </div>
                               </div>
                             )}
                          </div>
                        </div>

                        <div className="bg-brand-red/5 p-4 rounded-lg flex items-start gap-4">
                           <AlertCircle className="text-brand-red shrink-0" size={18} />
                           <p className="text-[11px] text-brand-red/80 font-sans leading-relaxed">
                              Please keep this page open. Your project is being uploaded securely to our premium servers.
                              You can lock your phone but do not exit the browser.
                           </p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded text-brand-red flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle size={18} />
                          <p className="text-xs font-brand uppercase tracking-widest">{error}</p>
                        </div>
                        <button onClick={() => setUploadStage('idle')} className="text-[10px] font-brand uppercase underline">Retry</button>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={uploadStage !== 'idle'}
                      className="w-full h-14 bg-brand-red text-black font-brand text-lg uppercase tracking-[4px] hover:bg-brand-red-dark disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(178,44,62,0.3)]"
                    >
                      {uploadStage === 'idle' ? (
                        <>UPLOAD PROJECT <ChevronRight size={20} /></>
                      ) : (
                        <div className="flex items-center gap-3">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                          PUBLISHING MASTERPIECE...
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Management Section */}
                  <div className="space-y-6 pt-12">
                    <div className="flex items-center justify-between border-b border-brand-red/10 pb-4">
                       <h3 className="font-brand text-xl text-brand-red uppercase tracking-widest">Manage Projects</h3>
                       <span className="px-3 py-1 bg-brand-red/10 rounded-full text-brand-red text-[10px] font-brand">{videos.length} Total</span>
                    </div>

                    <div className="grid gap-4">
                      {videos.map(project => (
                        <div key={project.id} className={`glass-card p-4 rounded-xl flex items-center gap-4 group transition-all ${project.isVisible ? 'opacity-100' : 'opacity-40'}`}>
                           <div className="w-20 h-14 rounded-lg bg-black overflow-hidden border border-brand-red/10 shrink-0">
                              <img src={project.coverURL} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h4 className="font-brand text-brand-red uppercase tracking-widest truncate">{project.title}</h4>
                              <p className="text-[9px] text-text-muted uppercase tracking-widest truncate">{project.category} • {formatSize(project.videoSize)}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleVisibility(project.id, project.isVisible)}
                                className={`p-2 rounded-lg transition-colors ${project.isVisible ? 'text-green-500 hover:bg-green-500/10' : 'text-text-muted hover:bg-white/5'}`}
                                title={project.isVisible ? 'Hide from portfolio' : 'Show in portfolio'}
                              >
                                {project.isVisible ? <Eye size={18} /> : <Eye size={18} className="opacity-50" />}
                              </button>
                              <button 
                                onClick={() => deleteProject(project)}
                                className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      ))}
                      {videos.length === 0 && (
                        <div className="text-center p-12 glass-card rounded-xl opacity-50">
                           <p className="font-brand text-text-muted uppercase tracking-widest">No projects uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {reviews.map(r => (
              <div key={r.id} className="glass-card p-5 md:p-6 rounded-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="overflow-hidden">
                      <h4 className="text-brand-red font-brand text-lg md:text-xl uppercase tracking-widest truncate">{r.name}</h4>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-brand-red text-brand-red' : 'text-brand-red/20'} />)}
                      </div>
                    </div>
                    <button onClick={() => handleDelete('reviews', r.id)} className="text-brand-red hover:scale-110 p-2 shrink-0"><Trash2 size={18} /></button>
                  </div>
                  <p className="text-brand-red/80 font-sans text-sm line-clamp-4 leading-relaxed italic">"{r.text}"</p>
                </div>
                <div className="pt-4 border-t border-brand-red/10 flex justify-between items-center">
                   <p className="text-[9px] text-text-muted uppercase tracking-[2px]">Submitted</p>
                   <p className="text-[9px] text-brand-red uppercase tracking-widest">{formatDate(r.createdAt)}</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full py-20 glass-card rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                 <Star size={48} className="mb-4 text-brand-red/50" />
                 <p className="font-brand text-xl text-brand-red uppercase tracking-widest">No reviews found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="grid gap-4 md:gap-6">
            {queries.map(q => (
              <div key={q.id} className="glass-card p-6 md:p-8 rounded-xl border-l-4 md:border-l-[6px] border-l-brand-red space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[8px] text-text-muted uppercase tracking-[3px] font-bold">Ref ID: {q.id.slice(0, 8)}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-brand-red font-brand text-xl md:text-2xl uppercase tracking-widest">{q.name}</h4>
                      <div className="flex gap-2">
                        {['pending', 'processing', 'completed', 'cancelled'].map(s => (
                          <button
                            key={s}
                            onClick={() => updateQueryStatus(q.id, s)}
                            className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${
                              (q.status || 'pending') === s 
                                ? 'bg-brand-red text-black border-brand-red font-bold animate-pulse' 
                                : 'border-brand-red/20 text-brand-red/40 hover:border-brand-red/50 hover:text-brand-red'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted uppercase tracking-[2px] md:tracking-[3px] flex items-center gap-2">
                      <LayoutDashboard size={10} className="text-brand-red" />
                      {q.projectType}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-0 border-brand-red/10 pt-4 sm:pt-0">
                    <p className="text-xl md:text-2xl font-brand text-brand-red">₹{q.budget.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Project Budget</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-sm border-t border-brand-red/10 pt-6">
                   <div className="space-y-3">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2 italic">
                        <User size={10} /> Contact Details
                      </p>
                      <div className="space-y-1">
                        <p className="text-brand-red font-sans text-xs md:text-sm font-bold truncate">{q.email}</p>
                        <p className="text-brand-red font-sans text-xs md:text-sm tracking-widest">{q.phone}</p>
                      </div>
                   </div>
                   <div className="space-y-3 sm:text-center md:text-left">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2 italic justify-center md:justify-start">
                        <Clock size={10} /> Timeline
                      </p>
                      <p className="text-brand-red font-brand text-lg tracking-widest">{q.deadline || 'flexible'}</p>
                   </div>
                   <div className="space-y-3 text-right">
                      <p className="text-[10px] text-text-muted uppercase tracking-widest italic">Received At</p>
                      <p className="text-brand-red/60 text-xs font-brand uppercase tracking-widest">{formatDate(q.createdAt)}</p>
                      <p className="text-[8px] text-text-muted uppercase tracking-widest mt-2">Source: <span className="text-brand-red underline decoration-brand-red/30">{q.source}</span></p>
                   </div>
                </div>

                <div className="bg-black/60 p-5 md:p-7 rounded-xl border border-brand-red/10 group-hover:border-brand-red/30 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare size={10} className="text-brand-red" />
                       Brief & Technical Requirements
                     </p>
                     <div className="w-12 h-[1px] bg-brand-red/20" />
                   </div>
                   <p className="text-brand-red/90 text-sm whitespace-pre-wrap font-sans leading-relaxed text-justify">{q.requirements}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                   <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-widest">
                      <div className={`w-2 h-2 rounded-full ${q.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-brand-red shadow-[0_0_8px_#B22C3E]'}`} />
                      Status: {q.status || 'pending'}
                   </div>
                   <button onClick={() => handleDelete('queries', q.id)} className="w-full sm:w-auto px-8 py-3 bg-brand-red/5 border border-brand-red/30 text-brand-red font-brand text-[11px] uppercase tracking-widest rounded hover:bg-brand-red hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2 group/del">
                     <Trash2 size={14} className="group-hover/del:scale-110 transition-transform" />
                     Trash Entry
                   </button>
                </div>
              </div>
            ))}
            {queries.length === 0 && (
              <div className="py-32 glass-card rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                 <Briefcase size={64} className="mb-4 text-brand-red/50" />
                 <p className="font-brand text-2xl text-brand-red uppercase tracking-[6px]">Inbox Zero</p>
                 <p className="text-xs text-text-muted mt-2 tracking-widest">No order requests yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 font-sans">
            {messages.map(m => (
              <div key={m.id} className="glass-card p-6 md:p-8 rounded-xl space-y-6 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[7px] text-text-muted uppercase tracking-[2px]">{formatDate(m.createdAt)}</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="overflow-hidden">
                      <h4 className="text-brand-red font-brand text-xl md:text-2xl uppercase tracking-widest truncate">{m.name}</h4>
                      <p className="text-[10px] text-text-muted truncate lowercase border-t border-brand-red/10 pt-1 mt-1">{m.email}</p>
                    </div>
                    <button onClick={() => handleDelete('messages', m.id)} className="text-brand-red hover:scale-110 p-2 shrink-0 bg-brand-red/5 rounded-full hover:bg-brand-red/10 transition-all"><Trash2 size={18} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-[1px] w-4 bg-brand-red/30" />
                       <p className="text-[10px] text-text-muted uppercase tracking-[2px] font-bold">Subject: {m.subject || 'General Inquiry'}</p>
                    </div>
                    <p className="text-brand-red/80 text-sm leading-relaxed font-sans bg-black/20 p-4 rounded-lg border border-brand-red/5 tracking-wide">{m.message}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-red/10 flex justify-between items-center text-[9px] text-text-muted uppercase tracking-[3px]">
                   <span>Contact Reference</span>
                   <span className="text-brand-red/40">{m.id.slice(0, 10).toUpperCase()}</span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="col-span-full py-20 glass-card rounded-2xl flex flex-col items-center justify-center text-center opacity-40">
                 <MessageSquare size={48} className="mb-4 text-brand-red/50" />
                 <p className="font-brand text-xl text-brand-red uppercase tracking-widest">No messages received</p>
              </div>
            )}
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
