'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { ChevronLeft, Camera, LogOut } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const AuthFlow = dynamic(() => import('@/components/AuthFlow'), { ssr: false });
const CameraView = dynamic(() => import('@/components/CameraView'), { ssr: false });
const ReportFlow = dynamic(() => import('@/components/ReportFlow'), { ssr: false });
const EventDetails = dynamic(() => import('@/components/EventDetails'), { ssr: false });
const ReportDetails = dynamic(() => import('@/components/ReportDetails'), { ssr: false });

import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const tFlowData = {
  mn: {
    streetLight: 'Гэрэлтүүлэг эвдэрсэн',
    trash: 'Хог хаягдал',
    roadDamage: 'Замын эвдрэл',
    signal: 'Гэрлэн дохио',
    crossing: 'Аюултай гарц',
    hazard: 'Халтиргаа, ус, мөс',
    // Fallbacks for old data to prevent English appearing when MN is selected
    vandalism: 'Өмч сүйтгэл',
    flood: 'Үер ус, тогтоол ус',
    roadwork: 'Авто замын эвдрэл',
    dust: 'Тоосжилт'
  },
  en: {
    streetLight: 'Broken streetlight',
    trash: 'Waste pollution',
    roadDamage: 'Road damage',
    signal: 'Signal issue',
    crossing: 'Unsafe crossing',
    hazard: 'Surface hazards',
    // Fallbacks
    vandalism: 'Vandalism',
    flood: 'Flood',
    roadwork: 'Road damage',
    dust: 'Dust'
  }
};

const tAgencies: any = {
  mn: {
    streetLight: 'Нийслэлийн гэрэлтүүлгийн алба / дүүргийн тохижилт',
    trash: 'Дүүргийн тохижилт, хог тээврийн үйлчилгээ',
    roadDamage: 'Нийслэлийн Замын хөгжлийн газар',
    signal: 'Замын хөдөлгөөний удирдлагын төв',
    crossing: 'Замын хөдөлгөөний удирдлагын төв',
    hazard: 'Дүүргийн тохижилт / Онцгой байдал',
    roadwork: 'Нийслэлийн Замын хөгжлийн газар',
    vandalism: 'Дүүргийн тохижилт',
    flood: 'Дүүргийн тохижилт / Онцгой байдал',
    dust: 'Дүүргийн тохижилт'
  },
  en: {
    streetLight: 'Lighting Authority / District Maintenance',
    trash: 'District Maintenance / Waste Service',
    roadDamage: 'Road Development Department',
    signal: 'Traffic Management Center',
    crossing: 'Traffic Management Center',
    hazard: 'District Maintenance / Emergency',
    roadwork: 'Road Development Department',
    vandalism: 'District Maintenance',
    flood: 'District Maintenance / Emergency',
    dust: 'District Maintenance'
  }
};

const i18n = {
  mn: {
    greeting: "Оройн мэнд",
    name: "Дорж",
    phone: "+97699999999",
    profileStats: "2 мэдэгдсэн • 10 түүх",
    tabNotified: "Мэдэгдсэн",
    tabSolved: "Шийдэгдсэн",
    btnLogout: "Гарах",
    hello: "Сайн байна уу",
    nReports: "мэдэгдсэн",
    nSolved: "шийдэгдсэн",
    noReports: "Мэдээлэл олдсонгүй",
    noSolved: "Шийдэгдсэн мэдээлэл олдсонгүй",
    
    // Home
    statsProjectsLine1: "Оролцсон сайн дурын",
    statsProjectsLine2: "ажлууд",
    statsHours: "Нийт цаг",
    section1Title: "Оролцсон сайн дурын ажлууд",
    eventName1: "World Cleanup Day",
    eventLocation1: "Туул голын эрэг",
    eventDesc1: "Ил задгай хаягдсан хог нийлж түүх...",
    btnDetails: "Дэлгэрэнгүй үзэх",
    section2Title: "Дараагийн эвэнтүүд",
    event2Title: "Парк цэвэрлэгээ",
    event2Desc: "Паркын хогийг цэвэрлэж, орчныг цэцэрлэнэ. Иргэд хамтдаа цэвэр, хувь нэмэр оруулна...",
    btnJoin: "Орох",
    event3Title: "Гудамж цэвэрлэгээ",
    event3Desc: "Гудамж, нийтийн талбайн хогийг цэвэрлэнэ. Хотын төвийг илүү цэвэр...",
    event4Title: "Хог түүх аян",
    event4Desc: "Ойр орчмын хог хаягдлыг цуглуулж, ангилан ялгана...",

    // Reported List
    report1Title: "Эвдэрсэн гудамжны гэрэл",
    report1Date: "2026.3.17",
    report2Title: "Хог хаягдалтай парк",
    report2Date: "2026.4.28",
    statusSent: "Илгээсэн",
    statusReceived: "Хүлээн авсан",
    statusReview: "Хянаж байна",
    statusProcessing: "Шийдвэрлэж байна",
    statusSolved: "Шийдэгдсэн",
    viewDetails: "Дэлгэрэнгүй үзэх...",
    viewStatus: "Төлөв харах",
    collapse: "Хураах",
    reportMessage: "Таны мэдээллийг холбогдох байгууллага хүлээн авч, хянан шалгаж байна."
  },
  en: {
    greeting: "Good evening",
    name: "Dorj",
    phone: "+97699999999",
    profileStats: "2 reported • 10 history",
    tabNotified: "Reported",
    tabSolved: "Solved",
    btnLogout: "Logout",
    hello: "Hello",
    nReports: "reported",
    nSolved: "solved",
    noReports: "No reports found",
    noSolved: "No solved reports found",
    viewStatus: "View Status",
    collapse: "Collapse",

    // Home
    statsProjectsLine1: "Participated volunteer",
    statsProjectsLine2: "activities",
    statsHours: "Total hours",
    section1Title: "Volunteer work done",
    eventName1: "World Cleanup Day",
    eventLocation1: "Tuul River Bank",
    eventDesc1: "Collecting open garbage together...",
    btnDetails: "View details",
    section2Title: "Upcoming events",
    event2Title: "Park Cleanup",
    event2Desc: "Cleaning up park garbage and gardening...",
    btnJoin: "Join",
    event3Title: "Street Cleaning",
    event3Desc: "Cleaning streets and public areas...",
    event4Title: "Garbage Collection",
    event4Desc: "Collecting and sorting local garbage...",
    
    // Reported List
    report1Title: "Broken street light",
    report1Date: "2026.3.17",
    report2Title: "Park with trash",
    report2Date: "2026.4.28",
    statusSent: "Sent",
    statusReceived: "Received",
    statusReview: "In review",
    statusProcessing: "Processing",
    statusSolved: "Solved",
    viewDetails: "View details...",
    reportMessage: "Your report has been received by the relevant authorities and is under review."
  }
};

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function MobileApp() {
  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showReportFlow, setShowReportFlow] = useState(false);
  const [isUploadingCamera, setIsUploadingCamera] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<'mn'|'en'>('mn');
  const [currentView, setCurrentView] = useState<'home'|'profile'>('profile');
  const [activeTab, setActiveTab] = useState<'notified'|'solved'>('notified');
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState<any>(null); // store whole report object
  const [myReports, setMyReports] = useState<any[]>([]);
  const t = i18n[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      if (currentUser) {
        setCurrentView('profile');
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // If user is admin, fetch ALL reports. Otherwise fetch only their own.
    const isAdmin = user.email === 'khanzobu2010@gmail.com';
    const q = isAdmin
      ? query(collection(db, 'reports'))
      : query(
          collection(db, 'reports'),
          where('userId', '==', user.uid)
        );

    const unsub = onSnapshot(q, 
      (snap) => {
        const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        // Sort locally to avoid needing a Firestore composite Index
        reports.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || Date.now();
          const timeB = b.createdAt?.toMillis() || Date.now();
          return timeB - timeA;
        });
        setMyReports(reports);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        alert(`Зөвшөөрөлгүй хандалт (User: ${user.email}). ${error.message}`);
      }
    );
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || t.name;

  if (!isClient) return null;

  if (loadingUser) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Уншиж байна...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className={`mx-auto w-full max-w-[400px] h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
         <AuthFlow 
           onComplete={() => setIsAuthenticated(true)} 
           isDark={isDark} 
           lang={lang} 
           setIsDark={setIsDark}
           setLang={setLang}
         />
      </div>
    );
  }

  if (showReportFlow) {
    return (
      <div className="mx-auto w-full max-w-[400px] h-screen flex flex-col font-sans relative overflow-hidden">
        <ReportFlow onClose={() => { setShowReportFlow(false); setPhotoUrl(null); }} photoUrl={photoUrl} lang={lang} user={user} />
      </div>
    );
  }

  if (showCamera) {
    return (
      <div className="mx-auto w-full max-w-[400px] h-screen flex flex-col font-sans relative overflow-hidden bg-black">
        <CameraView onClose={() => setShowCamera(false)} onPhotoTaken={(url) => { setPhotoUrl(url); setShowCamera(false); setShowReportFlow(true); }} lang={lang} />
      </div>
    );
  }

  if (showEventDetails) {
    return <EventDetails onClose={() => setShowEventDetails(false)} isDark={isDark} lang={lang} />;
  }

  if (showReportDetails) {
    return <ReportDetails onClose={() => setShowReportDetails(null)} report={showReportDetails} isDark={isDark} lang={lang} user={user} />;
  }

  return (
    <div className={`mx-auto w-full max-w-[400px] min-h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#111624] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="flex justify-between items-center px-5 py-6">
        <div className="w-8"></div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`w-[52px] h-[26px] rounded-full p-1 flex items-center relative overflow-hidden transition-all duration-300 cursor-pointer ${
              isDark 
                ? 'bg-gradient-to-r from-orange-400 via-orange-300 to-slate-800' 
                : 'bg-slate-200 border-slate-300 border'
            }`}
          >
             <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transition-transform duration-300 ${isDark ? 'left-1' : 'left-[calc(100%-24px)] border border-slate-200'}`}></div>
          </button>
          
          {/* Language Toggle Button */}
          <button 
            onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')}
            className={`w-7 h-7 rounded-full flex flex-col items-center justify-center overflow-hidden border relative transition-colors cursor-pointer ${isDark ? 'border-white/20' : 'border-slate-300 opacity-90'} ${lang === 'mn' ? 'bg-red-600' : 'bg-slate-200'}`}
          >
            {lang === 'mn' ? (
              <>
                 <div className="w-full h-1/3 bg-[#0066cc] absolute top-1/3"></div>
                 <div className="w-2 h-2 rounded-full border border-yellow-400 absolute left-1 top-1"></div>
              </>
            ) : (
              <span className="text-[10px] text-slate-800 font-bold">EN</span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 pb-24 overflow-y-auto hidden-scrollbar">
         <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Profile Info */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-[60px] h-[60px] rounded-[16px] overflow-hidden shrink-0 shadow-sm relative">
                      <Image src="https://picsum.photos/seed/doge/120/120" alt="Avatar" fill className="object-cover" referrerPolicy="no-referrer" />
                   </div>
                   <div>
                      <h1 className={`text-[20px] font-medium leading-tight mb-0.5 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {displayName}
                        {user?.email === 'khanzobu2010@gmail.com' && (
                           <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-500 font-bold text-[10px] uppercase text-white align-middle inline-flex items-center justify-center">Admin</span>
                        )}
                      </h1>
                      <p className={`text-[13px] mb-0.5 transition-colors ${isDark ? 'text-[#8892b0]' : 'text-slate-600'}`}>{t.hello}</p>
                      <p className={`text-[12px] transition-colors ${isDark ? 'text-[#8892b0]' : 'text-slate-500'}`}>
                        {myReports.filter((r: any) => r.status !== 'solved').length} {t.nReports} • {myReports.filter((r: any) => r.status === 'solved').length} {t.nSolved}
                      </p>
                   </div>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  <LogOut size={16} />
                  <span>{t.btnLogout}</span>
                </button>
              </div>

              {/* Tabs */}
              <div className={`flex justify-center gap-8 mb-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-[#e2e8f0]'}`}>
                <button 
                   onClick={() => setActiveTab('notified')}
                   className={`pb-3 font-medium text-[16px] tracking-wide relative px-1 transition-colors ${activeTab === 'notified' ? (isDark ? 'text-white' : 'text-[#1c2e4a]') : (isDark ? 'text-[#8892b0]' : 'text-slate-600')} ${activeTab === 'notified' ? "after:content-[''] after:absolute after:bottom-[-1.5px] after:left-0 after:w-full after:h-[3px] after:bg-[#3b5998]" : ''}`}>
                  {t.tabNotified}
                </button>
                <button 
                   onClick={() => setActiveTab('solved')}
                   className={`pb-3 font-medium text-[16px] tracking-wide relative px-1 transition-colors ${activeTab === 'solved' ? (isDark ? 'text-white' : 'text-[#1c2e4a]') : (isDark ? 'text-[#8892b0]' : 'text-slate-600') } ${activeTab === 'solved' ? "after:content-[''] after:absolute after:bottom-[-1.5px] after:left-0 after:w-full after:h-[3px] after:bg-[#3b5998]" : ''}`}>
                  {t.tabSolved}
                </button>
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in duration-300">
                {activeTab === 'notified' ? (
                   <div className="flex flex-col gap-4">
                      {myReports.filter(r => r.status !== 'solved').length === 0 ? (
                        <div className={`text-center py-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.noReports}</div>
                      ) : (
                        myReports.filter(r => r.status !== 'solved').map((report, idx) => (
                          <div key={report.id} className={`rounded-[24px] p-5 shadow-sm border transition-all duration-300 relative overflow-hidden ${isDark ? 'bg-[#1a2235] border-white/5' : 'bg-white border-slate-200'} ${expandedReport === idx ? 'shadow-md shadow-blue-500/5 border-blue-100' : ''}`}>
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                   <h3 className={`font-medium text-[15px] transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                     {tFlowData[lang][report.category as keyof typeof tFlowData['mn']] || report.category}
                                   </h3>
                                   <p className={`text-[12px] opacity-70 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {tAgencies[lang][report.category] || (lang === 'mn' ? 'Холбогдох байгууллага' : 'Relevant Authority')}
                                   </p>
                                </div>
                                <span className={`text-[12px] transition-colors ${isDark ? 'text-[#8892b0]' : 'text-slate-500'}`}>
                                  {report.createdAt ? new Date(report.createdAt.toMillis ? report.createdAt.toMillis() : (report.createdAt.seconds * 1000)).toLocaleDateString() : 'Саяхан'}
                                </span>
                             </div>
                             
                             <div className="flex flex-col gap-5 relative pl-1 mb-2">
                                <div className={`absolute left-[9px] top-2 bottom-3 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                                
                                <div className="flex gap-4 relative z-10 items-center">
                                   <div className={`w-[11px] h-[11px] rounded-full flex-shrink-0 ${report.status === 'sent' || report.status === 'received' || report.status === 'processing' || report.status === 'solved' ? 'bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]' : 'bg-slate-300'}`}></div>
                                   <span className={`text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{t.statusSent}</span>
                                </div>

                                <div className={`flex gap-4 relative z-10 items-center ${report.status === 'sent' ? 'opacity-40' : ''}`}>
                                   <div className={`w-[11px] h-[11px] rounded-full flex-shrink-0 ${report.status === 'received' || report.status === 'processing' || report.status === 'solved' ? 'bg-[#a855f7]' : 'bg-[#6b7280]'}`}></div>
                                   <span className={`text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{t.statusReview}</span>
                                </div>

                                {expandedReport === idx && (
                                   <div className={`flex gap-4 relative z-10 items-center ${report.status === 'sent' || report.status === 'received' ? 'opacity-40' : ''}`}>
                                      <div className={`w-[11px] h-[11px] rounded-full flex-shrink-0 ${report.status === 'processing' || report.status === 'solved' ? 'bg-[#eab308]' : 'bg-[#6b7280]'}`}></div>
                                      <span className={`text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{t.statusProcessing}</span>
                                   </div>
                                )}
                                
                                <div className={`flex gap-4 relative z-10 items-center ${report.status !== 'solved' ? 'opacity-40' : ''}`}>
                                   <div className={`w-[11px] h-[11px] rounded-full flex-shrink-0 ${report.status === 'solved' ? 'bg-[#10b981]' : 'bg-[#6b7280]'}`}></div>
                                   <span className={`text-[14px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{t.statusSolved}</span>
                                </div>
                             </div>

                             {expandedReport === idx && (
                                <div className="mt-10 mb-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                   <p className={`text-[13px] leading-relaxed text-center px-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.reportMessage}</p>
                                </div>
                             )}

                             <div className="text-right mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <button onClick={() => setExpandedReport(expandedReport === idx ? null : idx)} className={`text-[13px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {expandedReport === idx ? t.collapse : t.viewStatus}
                                </button>
                                <button onClick={() => setShowReportDetails(report)} className={`text-[13px] font-medium underline underline-offset-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}>
                                   {t.viewDetails}
                                </button>
                             </div>
                          </div>
                        ))
                      )}

                   </div>
                ) : (
                   <div className="flex flex-col gap-4">
                      {myReports.filter(r => r.status === 'solved').length === 0 ? (
                        <div className={`text-center py-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.noSolved}</div>
                      ) : (
                        myReports.filter(r => r.status === 'solved').map((report, idx) => (
                          <div key={report.id} className={`rounded-[24px] p-5 shadow-sm border transition-all duration-300 relative overflow-hidden ${isDark ? 'bg-[#1a2235] border-white/5' : 'bg-white border-slate-200'}`}>
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                   <h3 className={`font-medium text-[15px] transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                     {tFlowData[lang][report.category as keyof typeof tFlowData['mn']] || report.category}
                                   </h3>
                                   <p className={`text-[12px] opacity-70 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {tAgencies[lang][report.category] || (lang === 'mn' ? 'Холбогдох байгууллага' : 'Relevant Authority')}
                                   </p>
                                </div>
                                <span className={`text-[12px] transition-colors ${isDark ? 'text-[#8892b0]' : 'text-slate-500'}`}>
                                  {report.createdAt ? new Date(report.createdAt.toMillis ? report.createdAt.toMillis() : (report.createdAt.seconds * 1000)).toLocaleDateString() : 'Саяхан'}
                                </span>
                             </div>
                             
                             <div className="flex items-center gap-2 mb-4">
                               <div className="w-[11px] h-[11px] rounded-full bg-[#10b981]"></div>
                               <span className={`text-[14px] font-medium transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                 {t.statusSolved}
                               </span>
                             </div>

                             <div className="text-right mt-2">
                                <button onClick={() => setShowReportDetails(report)} className={`text-[13px] font-medium underline underline-offset-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}>
                                   {t.viewDetails}
                                </button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                )}
             </div>
          </div>
      </main>

      {/* Floating Camera Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
         <label className={`w-14 h-14 bg-[#1877f2] hover:bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-[0_8px_16px_rgba(24,119,242,0.4)] transition-transform active:scale-95 border border-blue-400/20 relative ${isUploadingCamera ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
           <input 
             type="file" 
             accept="image/*" 
             capture="environment" 
             className="hidden" 
             disabled={isUploadingCamera}
             onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                setIsUploadingCamera(true);
                try {
                  // Direct upload implementation since we bypass CameraView
                  const { storage } = await import('@/lib/firebase');
                  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                  const storageRef = ref(storage, `reports/${fileName}`);
                  
                  const snapshot = await uploadBytes(storageRef, file);
                  const url = await getDownloadURL(snapshot.ref);
                  
                  setPhotoUrl(url);
                  setShowReportFlow(true);
                  
                  // Reset file input so same file can be selected again if needed
                  e.target.value = '';
                } catch (err) {
                  console.error('Direct Upload Error:', err);
                  alert('Зураг хадгалахад алдаа гарлаа');
                } finally {
                  setIsUploadingCamera(false);
                }
             }}
           />
           {isUploadingCamera ? (
             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           ) : (
             <Camera size={26} strokeWidth={2.5} />
           )}
         </label>
      </div>

      <style jsx global>{`
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .text-shadow-md {
          text-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

