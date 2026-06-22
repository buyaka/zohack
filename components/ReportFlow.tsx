'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Search, MapPin, Target, Check, Trash2, Droplets, Hammer, Lightbulb, AlertTriangle, Wind, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

const tFlow = {
  mn: {
    fetchingLoc: 'Байршил татаж байна...',
    searchLoc: 'Байршил хайх',
    selectLoc: 'Байршлаа сонгох',
    location: 'Байршил: ',
    locValue: 'СХД, 3-р хороо Драгон төвийн хажуудах замын зогсоол',
    change: 'Солих',
    addNote: 'Нэмэлт тайлбар оруулах',
    correctLoc: 'Зөв байршил',
    streetLight: 'Гэрэлтүүлэг эвдэрсэн',
    trash: 'Хог хаягдал',
    roadDamage: 'Замын эвдрэл',
    signal: 'Гэрлэн дохио',
    crossing: 'Аюултай гарц',
    hazard: 'Халтиргаа, ус, мөс',
    aiWarning: 'Тайлбар: Байршлыг AI-аар тодорхойлсон тул байршил буруу орсон байх магадлалтай. Ийм тохиолдолд байршлыг гараар засах / солих боломжтой.',
    changeLocBtn: 'Байршлыг солих',
    enterLocPlaceholder: 'Байршлыг оруулах...',
    confirmBtn: 'Баталгаажуулах',
    successMsg1: 'Таны мэдээллийг хүлээн',
    successMsg2: 'авлаа.',
    backHome: 'Буцах',
  },
  en: {
    fetchingLoc: 'Fetching location...',
    searchLoc: 'Search for location',
    selectLoc: 'Select location',
    location: 'Location: ',
    locValue: 'Songinokhairkhan, 3rd khoroo, Dragon center parking',
    change: 'Change',
    addNote: 'Add description',
    correctLoc: 'Correct location',
    streetLight: 'Broken streetlight',
    trash: 'Waste pollution',
    roadDamage: 'Road damage',
    signal: 'Signal issue',
    crossing: 'Unsafe crossing',
    hazard: 'Surface hazards',
    aiWarning: 'Note: Location determined by AI may be incorrect. You can manually adjust or change it.',
    changeLocBtn: 'Change location',
    enterLocPlaceholder: 'Enter location...',
    confirmBtn: 'Confirm',
    successMsg1: 'Your information has',
    successMsg2: 'been received.',
    backHome: 'Back to Home',
  }
};

const categoryIcons = {
  streetLight: <Lightbulb size={28} strokeWidth={1.5} />,
  trash: <Trash2 size={28} strokeWidth={1.5} />,
  roadDamage: <Hammer size={28} strokeWidth={1.5} />,
  signal: <AlertTriangle size={28} strokeWidth={1.5} />,
  crossing: <Target size={28} strokeWidth={1.5} />,
  hazard: <Droplets size={28} strokeWidth={1.5} />
};

type CategoryKey = keyof typeof categoryIcons;

export default function ReportFlow({ onClose, lang, photoUrl, user }: { onClose: () => void, lang: 'mn' | 'en', photoUrl: string | null, user: User | null }) {
  const [step, setStep] = useState<'map' | 'ai_warning' | 'manual' | 'details' | 'success'>('map');
  const [showCategories, setShowCategories] = useState(false);
  const [category, setCategory] = useState<CategoryKey>('roadDamage');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | undefined>(undefined);

  const t = tFlow[lang];

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsFetchingGeo(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        // Extract a shorter address
        const parts = data.display_name.split(', ');
        const shortAddress = parts.slice(0, 3).join(', ');
        setCurrentAddress(shortAddress);
      } else {
        // Leave previous address or fallback empty
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsFetchingGeo(false);
    }
  };

  useEffect(() => {
    // Tries to grab genuine location & address on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPos([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
     reverseGeocode(lat, lng);
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userEmail: user.email,
        photoUrl: photoUrl,
        category: category,
        location: currentAddress || t.locValue, // Use real location if available
        notes: notes,
        status: 'sent',
        createdAt: serverTimestamp()
      });
      console.log("Report saved to firestore");
      setStep('success');
    } catch (error) {
      console.error("Error saving report", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="absolute inset-0 z-50 bg-[#f4f4ec] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
        
        {step === 'success' ? (
           <div className="flex flex-col items-center justify-center p-8 bg-[#e8e6d9] rounded-[24px] shadow-sm text-center mx-6 w-full max-w-[320px]">
              <p className="text-[#3c4a3e] text-[17px] mb-8 leading-relaxed font-medium">
                 {t.successMsg1}<br/>{t.successMsg2}
              </p>
              <div className="w-16 h-16 rounded-full border border-green-500 flex items-center justify-center mb-8">
                 <Check className="text-green-500" strokeWidth={1.5} size={32} />
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-[#2d50a0] text-white font-medium py-3 rounded-xl active:scale-[0.98] transition-all shadow-md mt-2"
              >
                {t.backHome}
              </button>
           </div>
        ) : (
           <>
              {/* Map Background */}
              <div className="absolute inset-0 bg-[#e5e3df] z-0">
                 <LocationMap onLocationChange={handleLocationChange} initialPos={userPos} />
                 <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-10"></div>
              </div>

              {/* Top Search Bar */}
              <div className="absolute top-12 w-full px-4 flex items-center gap-3 z-10">
                 <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-full active:scale-95 transition-transform">
                    <ChevronLeft size={24} />
                 </button>
                 {/* Search bar removed as requested */}
              </div>

              {/* Center Map Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 drop-shadow-md pointer-events-none">
                 <MapPin size={40} className="text-red-500 fill-red-500/20" strokeWidth={1.5} />
              </div>

              {/* Location Target Icon */}
              <div className="absolute bottom-32 left-4 z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                 <Target className="text-slate-700" size={20} />
              </div>

              {/* Bottom Sheets and Controls */}
              {step === 'map' && (
                 <div className="absolute bottom-10 z-10 w-full flex flex-col items-center gap-4">
                    <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-slate-100 max-w-[85%] text-center">
                       <p className="text-slate-800 text-[14px] font-medium leading-tight">
                         {currentAddress ? currentAddress : t.fetchingLoc}
                       </p>
                    </div>
                    <button onClick={() => setStep('details')} className="bg-white rounded-full pl-6 pr-2 py-2 flex items-center gap-4 shadow-xl active:scale-95 transition-transform">
                       <span className="text-[#3c5ab4] font-medium text-[16px]">{t.selectLoc}</span>
                       <div className="w-10 h-10 bg-[#3c5ab4] rounded-full flex items-center justify-center text-white shadow-inner">
                          <ArrowUp size={20} />
                       </div>
                    </button>
                 </div>
              )}

              {step === 'details' && (
                 <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-6 pb-12 animate-in slide-in-from-bottom-10 z-20">
                    <div className="flex items-center justify-between mb-6 gap-2">
                       <div className="flex gap-2 text-[14px] leading-tight flex-1 min-w-0">
                          <span className="font-semibold text-[#2d50a0] break-keep">{t.location}</span>
                          <span className="text-slate-700 truncate">{currentAddress || 'Байршил тодорхойлж байна...'}</span>
                       </div>
                       <button onClick={() => setStep('manual')} className="text-[12px] text-[#2d50a0] font-medium underline shrink-0">
                          {t.change}
                       </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 gap-3">
                       <div className="border border-blue-200 rounded-full px-5 py-2 text-[14px] text-[#2d50a0] font-medium flex-1 text-center truncate">
                          {t[category as keyof typeof t]}
                       </div>
                       <button onClick={() => setShowCategories(true)} className="bg-[#4a6baf] text-white rounded-full px-6 py-2 text-[14px] font-medium shadow-sm active:scale-95 transition-transform shrink-0">
                          {t.change}
                       </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder={t.addNote} 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full border border-blue-200 text-slate-800 py-3 rounded-full font-medium text-[14px] mb-6 px-4 bg-white focus:outline-none focus:border-[#4a6baf]"
                    />

                    <button onClick={handleConfirm} disabled={isSubmitting} className="w-full bg-[#2d50a0] hover:bg-blue-800 text-white py-3.5 rounded-full font-medium text-[16px] active:scale-[0.98] transition-transform shadow-md disabled:opacity-50">
                       {isSubmitting ? 'Loading...' : t.confirmBtn}
                    </button>
                 </div>
              )}

              {step === 'manual' && (
                 <div className="absolute bottom-0 w-full bg-[#f4f4ec] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-6 pb-12 animate-in slide-in-from-bottom-10 z-20 border-t border-[#e8e6d9]">
                    <textarea 
                      placeholder={t.enterLocPlaceholder}
                      value={currentAddress || ''}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      className="w-full h-24 bg-[#e8e6d9] rounded-xl p-4 outline-none text-slate-700 text-[14px] resize-none mb-6 border border-[#d5d2c1] focus:border-[#65b340] transition-colors"
                    />
                    <button onClick={() => setStep('details')} className="w-full bg-[#65b340] hover:bg-green-600 text-white py-3.5 rounded-full font-medium text-[15px] active:scale-[0.98] transition-transform shadow-sm">
                       {t.confirmBtn}
                    </button>
                 </div>
              )}

              {/* Categories Overlay */}
              {showCategories && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in">
                    <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-8 pb-10 shadow-2xl w-[85%] max-w-[320px]">
                       <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                          {(Object.keys(categoryIcons) as CategoryKey[]).map((key) => (
                             <div 
                               key={key} 
                               onClick={() => { setCategory(key); setShowCategories(false); }}
                               className="flex flex-col items-center gap-3 cursor-pointer group"
                             >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95 ${category === key ? 'bg-[#2d50a0] ring-4 ring-blue-100' : 'bg-[#4a6baf]'}`}>
                                   {categoryIcons[key]}
                                </div>
                                <span className={`text-[13px] font-medium ${category === key ? 'text-[#2d50a0]' : 'text-slate-600'}`}>
                                   {t[key as keyof typeof t]}
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
           </>
        )}
      </div>
  );
}
