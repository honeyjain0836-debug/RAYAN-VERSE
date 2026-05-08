import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  signInAnonymously 
} from 'firebase/auth';
import { storage, db, auth } from '../lib/firebase';

/* ── STEP 1: Convert HEIC to JPEG if needed ── */
async function convertFile(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.heic') || 
      name.endsWith('.heif') ||
      file.type === 'image/heic' || 
      file.type === 'image/heif') {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85
      });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      return new File(
        [blob],
        name.replace(/\.(heic|heif)$/, '.jpg'),
        { type: 'image/jpeg' }
      );
    } catch (e) {
      console.warn('HEIC conversion failed:', e);
      return file;
    }
  }
  return file;
}

/* ── STEP 2: Compress image if too large ── */
async function compressFile(file: File) {
  if (file.size <= 1 * 1024 * 1024) return file;
  try {
    console.log('Compressing file of size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    const imageCompression = 
      (await import('browser-image-compression')).default;
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: false // Disable web worker to avoid potential iframe/sandbox issues
    });
    console.log('Compression complete. New size:', (compressed.size / 1024 / 1024).toFixed(2), 'MB');
    return compressed;
  } catch (e) {
    console.warn('Compression failed:', e);
    return file;
  }
}

/* ── STEP 3: Ensure authenticated ── */
async function ensureAuth() {
  console.log('Checking current auth state...');
  if (!auth.currentUser) {
    console.log('No user found, signing in anonymously...');
    try {
      await signInAnonymously(auth);
      console.log('Anonymous sign-in successful:', auth.currentUser?.uid);
    } catch (err) {
      console.error('Auth failure in ensureAuth:', err);
      throw new Error('Failed to connect to security server.');
    }
  } else {
    console.log('Already authenticated as:', auth.currentUser.uid);
  }
  return auth.currentUser;
}

/* ── MAIN UPLOAD FUNCTION ── */
export async function uploadProfilePhoto(
  file: File, 
  onProgress?: (pct: number, msg: string) => void
) {
  console.log('UPLOAD_START:', file.name, file.size, file.type);
  try {
    /* Validate file */
    if (!file) throw new Error('No file selected');
    
    // Check if it's a common image format or HEIC
    const isImage = file.type.startsWith('image/') || 
                    file.name.toLowerCase().match(/\.(heic|heif|jpg|jpeg|png|webp)$/);
    if (!isImage) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    /* Convert HEIC if needed */
    if (onProgress) onProgress(5, 'Converting HEIC...');
    let currentFile: File | Blob = file;
    try {
      currentFile = await convertFile(file);
    } catch (e) {
      console.error('HEIC Step Error:', e);
    }

    /* Compress if needed */
    if (onProgress) onProgress(15, 'Compressing...');
    try {
      // image-compression handles both File and Blob
      currentFile = await compressFile(currentFile as File);
    } catch (e) {
      console.error('Compression Step Error:', e);
    }

    /* Authenticate */
    if (onProgress) onProgress(25, 'Connecting...');
    await ensureAuth();

    /* Upload to Firebase Storage */
    if (onProgress) onProgress(35, 'Sending to Server...');
    const timestamp = Date.now();
    const storageRef = ref(storage, `profile/profile-${timestamp}.jpg`);

    console.log('STORAGE_REF:', storageRef.fullPath);
    
    try {
      // Simple upload (non-resumable) is often more reliable in restricted environments
      const result = await uploadBytes(storageRef, currentFile, {
        contentType: 'image/jpeg',
        customMetadata: { 'originalName': file.name }
      });
      console.log('UPLOAD_SUCCESS:', result.metadata.fullPath);

      if (onProgress) onProgress(80, 'Saving URL...');
      const url = await getDownloadURL(result.ref);
      
      await setDoc(
        doc(db, 'settings', 'profile'),
        { 
          photoURL: url,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      if (onProgress) onProgress(100, 'Success!');
      return url;

    } catch (uploadErr: any) {
      console.error('Core Upload Error:', uploadErr.code, uploadErr.message);
      if (uploadErr.code === 'storage/unauthorized') {
        throw new Error('Permission Denied: Please check if Storage Rules allow writes.');
      }
      throw uploadErr;
    }

  } catch (error: any) {
    console.error('TOTAL_UPLOAD_FAILURE:', error);
    throw error;
  }
}

/* ── FETCH CURRENT PHOTO URL ── */
export async function getProfilePhotoURL() {
  try {
    const snap = await getDoc(
      doc(db, 'settings', 'profile')
    );
    if (snap.exists() && snap.data().photoURL) {
      return snap.data().photoURL;
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch photo URL:', e);
    return null;
  }
}
