'use client';
import { useState } from 'react';
import { ChevronLeft, MapPin, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const tDetails = {
  mn: {
    back: 'Буцах',
    title: 'Мэдэгдлийн дэлгэрэнгүй',
    date: 'Огноо: 2026.04.18',
    location: 'Байршил',
    locValue: 'СХД, 3-р хороо Драгон төвийн хажуудах замын зогсоол',
    descTitle: 'Нөхцөл байдлын зураг',
    statusSent: "Илгээсэн",
    statusReceived: "Хүлээн авсан",
    statusReview: "Хянагдаж байна",
    statusProcessing: "Шийдвэрлэж байна",
    statusSolved: "Шийдвэрлэсэн",
    type: "Төрөл: ",
    typeValue: "Авто замын эвдрэл",
    reportNotes: "Замын нүх ихтэй, машинууд явахад хүндрэлтэй байна. Хурдан хугацаанд бөглөх шаардлагатай байна.",
    adminTitle: 'Төлөв шинэчлэх (Admin)',
    nextStep: 'Дараагийн шат',
    markSolved: 'Шийдвэрлэх',
    deleteReport: 'Устгах',
    confirmDelete: 'Та энэ мэдэгдлийг устгахдаа итгэлтэй байна уу?'
  },
  en: {
    back: 'Back',
    title: 'Report Details',
    date: 'Date: 2026.04.18',
    location: 'Location',
    locValue: 'Songinokhairkhan, 3rd khoroo, Dragon center parking',
    descTitle: 'Situation photo',
    statusSent: "Sent",
    statusReceived: "Received",
    statusReview: "In review",
    statusProcessing: "Processing",
    statusSolved: "Solved",
    type: "Type: ",
    typeValue: "Road damage",
    reportNotes: "There are many potholes, making it difficult for cars. Needs to be filled soon.",
    adminTitle: 'Update Status (Admin)',
    nextStep: 'Next Step',
    markSolved: 'Solve',
    deleteReport: 'Delete',
    confirmDelete: 'Are you sure you want to delete this report?'
  }
};

const tFlowData = {
  mn: {
    streetLight: 'Гэрэлтүүлэг эвдэрсэн',
    trash: 'Хог хаягдал',
    roadDamage: 'Замын эвдрэл',
    signal: 'Гэрлэн дохио',
    crossing: 'Аюултай гарц',
    hazard: 'Халтиргаа, ус, мөс'
  },
  en: {
    streetLight: 'Broken streetlight',
    trash: 'Waste pollution',
    roadDamage: 'Road damage',
    signal: 'Signal issue',
    crossing: 'Unsafe crossing',
    hazard: 'Surface hazards'
  }
};

export default function ReportDetails({ onClose, isDark, lang, report, user }: { onClose: () => void, isDark: boolean, lang: 'mn'|'en', report: any, user: User | null }) {
  const t = tDetails[lang];
  const tCat = tFlowData[lang];
  const [currentStatus, setCurrentStatus] = useState(report?.status || 'sent');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email === 'khanzobu2010@gmail.com';

  const updateStatus = async (specificStatus?: string) => {
    if (!report?.id) return;
    
    let nextStatus = specificStatus;
    if (!nextStatus) {
      if (currentStatus === 'sent') nextStatus = 'received';
      else if (currentStatus === 'received') nextStatus = 'processing';
      else if (currentStatus === 'processing') nextStatus = 'solved';
      else return;
    }

    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', report.id);
      await updateDoc(reportRef, { status: nextStatus });
      setCurrentStatus(nextStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!report?.id) return;
    if (!window.confirm(t.confirmDelete)) return;

    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', report.id);
      await deleteDoc(reportRef);
      onClose();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto w-full max-w-[400px] min-h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#111624] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`px-5 py-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md ${isDark ? 'bg-[#111624]/80 border-b border-white/5' : 'bg-slate-50/80 border-b border-slate-200'}`}>
        <button onClick={onClose} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white shadow-sm hover:bg-slate-50 text-slate-800'}`}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-medium tracking-wide">{t.title}</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto hidden-scrollbar pb-12">
        {/* Photo Section */}
        <div className="w-full h-[260px] relative">
          {report?.photoUrl ? (
            <Image 
              src={report.photoUrl} 
              alt="Report" 
              fill 
              className="object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-200'} text-slate-500`}>Зураггүй</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="bg-blue-600 text-white text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-flex items-center justify-center text-center">
              {tCat[report?.category as keyof typeof tCat] || report?.category || t.typeValue}
            </span>
            <p className="text-white/90 text-[14px]">Огноо: {report?.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : t.date}</p>
          </div>
        </div>

        <div className="px-5 pt-6 pb-8 space-y-8">
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className={`rounded-2xl p-5 border-2 ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-100'} animate-in fade-in slide-in-from-top-4 duration-500`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className={`text-[14px] font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{t.adminTitle}</h3>
              </div>
              
              <div className="flex gap-3">
                {currentStatus !== 'solved' && (
                  <>
                    <button 
                      onClick={() => updateStatus()}
                      disabled={loading}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                        <>
                          <ArrowRight size={18} />
                          <span>{t.nextStep}</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => updateStatus('solved')}
                      disabled={loading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>{t.markSolved}</span>
                        </>
                      )}
                    </button>
                  </>
                )}
                <button 
                  onClick={deleteReport}
                  disabled={loading}
                  className={`px-4 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )}
          
          {/* Location Block */}
          <div className={`rounded-2xl p-4 flex gap-4 items-start ${isDark ? 'bg-[#1a2235]' : 'bg-white shadow-sm border border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 className={`text-[13px] font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.location}</h3>
              <p className={`text-[15px] leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{report?.location || t.locValue}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className={`text-[16px] font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Нэмэлт мэдээлэл</h3>
            <p className={`text-[15px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {report?.notes || t.reportNotes}
            </p>
          </div>

          {/* Timeline Status */}
          <div>
            <h3 className={`text-[16px] font-medium mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Явц</h3>
            
            <div className="flex flex-col gap-6 relative pl-2">
              <div className={`absolute left-[13px] top-3 bottom-4 w-[2px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

              {/* Status 1 */}
              <div className={`flex gap-5 relative z-10 items-start ${(currentStatus === 'sent' || currentStatus === 'received' || currentStatus === 'processing' || currentStatus === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(currentStatus === 'sent' || currentStatus === 'received' || currentStatus === 'processing' || currentStatus === 'solved') ? 'bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusSent}</h4>
                  </div>
              </div>

              {/* Status 2 */}
              <div className={`flex gap-5 relative z-10 items-start ${(currentStatus === 'received' || currentStatus === 'processing' || currentStatus === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(currentStatus === 'received' || currentStatus === 'processing' || currentStatus === 'solved') ? 'bg-[#a855f7] shadow-[0_0_0_4px_rgba(168,85,247,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusReview}</h4>
                  </div>
              </div>

              {/* Status 3 - Current */}
              <div className={`flex gap-5 relative z-10 items-start ${(currentStatus === 'processing' || currentStatus === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(currentStatus === 'processing' || currentStatus === 'solved') ? 'bg-[#eab308] shadow-[0_0_0_4px_rgba(234,179,8,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusProcessing}</h4>
                  </div>
              </div>

              {/* Status 4 */}
              <div className={`flex gap-5 relative z-10 items-start ${(currentStatus === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(currentStatus === 'solved') ? 'bg-[#10b981] shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusSolved}</h4>
                  </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
