'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const tCam = {
  mn: {
    backBtn: 'Буцах',
    takePhotoBtn: 'Зураг авах',
    uploading: 'Хадгалж байна...'
  },
  en: {
    backBtn: 'Back',
    takePhotoBtn: 'Take photo',
    uploading: 'Uploading...'
  }
};

export default function CameraView({ onClose, onPhotoTaken, lang }: { onClose: () => void, onPhotoTaken: (photoUrl: string) => void, lang: 'mn' | 'en' }) {
  const t = tCam[lang];
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const storageRef = ref(storage, `reports/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      console.log('Image uploaded successfully:', url);
      onPhotoTaken(url); // Transition to next step, pass URL
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert('Зураг хадгалахад алдаа гарлаа: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
      {/* Background simulating camera feed */}
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="https://picsum.photos/seed/mudroad/800/1200" 
          alt="Camera feed" 
          fill 
          className="object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        {/* Dark overlay to make UI elements pop slightly */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-6 pt-10 flex items-center justify-between z-10">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} strokeWidth={2} />
          <span className="text-[17px] font-medium tracking-wide drop-shadow-md">{t.backBtn}</span>
        </button>
      </div>

      {/* Viewfinder Frame */}
      <div className="relative w-[300px] h-[360px] z-10 border-[3px] border-white/60 rounded-[32px] box-border pointer-events-none">
        {/* Fill interior with slight white tint for contrast, like the design */}
        <div className="absolute inset-0 bg-white/10 rounded-[28px]"></div>
        
        {/* Corner cutouts for scanning effect */}
        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-[32px]"></div>
        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-[32px]"></div>
        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-[32px]"></div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-[32px]"></div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 w-full flex justify-center z-10">
        <label className={`flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/30 rounded-full pl-8 pr-1.5 py-1.5 w-[220px] transition-transform active:scale-95 group shadow-xl ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} disabled={uploading} />
          <span className="text-white text-[17px] font-medium tracking-wide drop-shadow-md">
             {uploading ? t.uploading : t.takePhotoBtn}
          </span>
          <div className="w-12 h-12 rounded-full bg-[#406bd4] flex items-center justify-center text-white shadow-lg group-hover:bg-[#4d7ef5] transition-colors relative">
             <ArrowUp size={24} strokeWidth={2.5} />
             {/* Small animated ping effect on the button */}
             {!uploading && <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-40"></div>}
          </div>
        </label>
      </div>
    </div>
  );
}
