'use client';
import { ChevronLeft, MapPin } from 'lucide-react';
import Image from 'next/image';

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
    reportNotes: "Замын нүх ихтэй, машинууд явахад хүндрэлтэй байна. Хурдан хугацаанд бөглөх шаардлагатай байна."
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
    reportNotes: "There are many potholes, making it difficult for cars. Needs to be filled soon."
  }
};

export default function ReportDetails({ onClose, isDark, lang, report }: { onClose: () => void, isDark: boolean, lang: 'mn'|'en', report: any }) {
  const t = tDetails[lang];

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
            <span className="bg-blue-600 text-white text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {report?.category || t.typeValue}
            </span>
            <p className="text-white/90 text-[14px]">Огноо: {report?.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : t.date}</p>
          </div>
        </div>

        <div className="px-5 pt-6 pb-8 space-y-8">
          
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
              <div className={`flex gap-5 relative z-10 items-start ${(report?.status === 'sent' || report?.status === 'received' || report?.status === 'processing' || report?.status === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(report?.status === 'sent' || report?.status === 'received' || report?.status === 'processing' || report?.status === 'solved') ? 'bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusSent}</h4>
                  </div>
              </div>

              {/* Status 2 */}
              <div className={`flex gap-5 relative z-10 items-start ${(report?.status === 'received' || report?.status === 'processing' || report?.status === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(report?.status === 'received' || report?.status === 'processing' || report?.status === 'solved') ? 'bg-[#a855f7] shadow-[0_0_0_4px_rgba(168,85,247,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusReview}</h4>
                  </div>
              </div>

              {/* Status 3 - Current */}
              <div className={`flex gap-5 relative z-10 items-start ${(report?.status === 'processing' || report?.status === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(report?.status === 'processing' || report?.status === 'solved') ? 'bg-[#eab308] shadow-[0_0_0_4px_rgba(234,179,8,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.statusProcessing}</h4>
                  </div>
              </div>

              {/* Status 4 */}
              <div className={`flex gap-5 relative z-10 items-start ${(report?.status === 'solved') ? '' : 'opacity-40'}`}>
                  <div className={`w-[14px] h-[14px] mt-1 rounded-full flex-shrink-0 ${(report?.status === 'solved') ? 'bg-[#10b981] shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
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
