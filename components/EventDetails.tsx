import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

interface EventDetailProps {
  onClose: () => void;
  isDark: boolean;
  lang: 'mn' | 'en';
}

const t = {
  mn: {
    eventTitle: "Паркийн цэвэрлэгээ",
    date: "2026.3.18",
    time: "9:00-10:00",
    location: "СХД, 3-р хороо",
    desc: "Манай сайн дурын аян нь паркийн орчны бохирдлыг бууруулж, иргэдэд илүү цэвэр, аюулгүй, таатай орчин бүрдүүлэх зорилготой. Аяны хүрээнд оролцогчид паркийн талбайд хуримтлагдсан хог хаягдлыг цэвэрлэж, орчны эмх цэгцийг сайжруулах үйл ажиллагаанд нэгдэнэ. Энэхүү үйл ажиллагаа нь зөвхөн цэвэрлэгээ биш, харин иргэдийн оролцоог нэмэгдүүлэх, хотын соёлыг төлөвшүүлэх, хамтын хариуцлагыг бий болгоход чиглэнэ.",
    detailsTitle: "Байршил: СХД, 3-р хороо, Драгон төвийн хажуугийн парк\nХэзээ: 3 сарын 18-нд 9:00-10:00 цагийн хооронд\nШаардлага: 16 наснаас дээш байх",
    organizer: "Зохион байгуулагч: Бат Бадмаа\nХолбогдох дугаар: 99887689",
    participantCount: "Оролцогчдын тоо",
    joinBtn: "Бүртгүүлэх"
  },
  en: {
    eventTitle: "Park Cleanup",
    date: "2026.3.18",
    time: "9:00-10:00",
    location: "Sukhbaatar District, 3rd khoroo",
    desc: "Our volunteer campaign aims to reduce pollution in the park area, creating a cleaner, safer, and more pleasant environment for residents. Participants will join in cleaning up accumulated waste in the park area and improving environmental tidiness. This activity is not just about cleaning, but also about increasing citizen participation, fostering urban culture, and creating collective responsibility.",
    detailsTitle: "Location: Sukhbaatar District, 3rd khoroo, park next to Dragon center\nWhen: March 18th from 9:00-10:00\nRequirement: 16+ years old",
    organizer: "Organizer: Bat Badmaa\nContact: 99887689",
    participantCount: "Number of participants",
    joinBtn: "Join"
  }
};

export default function EventDetails({ onClose, isDark, lang }: EventDetailProps) {
  const content = t[lang];

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <div className="relative w-full max-w-[400px] mx-auto min-h-screen flex flex-col">
        {/* Header Image */}
        <div className="h-[380px] relative w-full shrink-0">
          <Image 
            src="https://picsum.photos/seed/park/800/800" 
            alt="Event" 
            fill 
            className="object-cover" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 left-5 text-white bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="absolute bottom-6 left-5 right-5 text-white">
            <h1 className="text-[28px] font-bold mb-1">{content.eventTitle}</h1>
            <div className="flex items-center gap-2 opacity-90 text-[14px]">
              <span>📍 {content.location}</span>
              <span>•</span>
              <span>{content.date} {content.time}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 p-5 -mt-6 rounded-t-[32px] relative z-10 transition-colors ${isDark ? 'bg-[#111624] text-white' : 'bg-white text-slate-800'}`}>
          <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {content.desc}
          </p>

          <div className={`p-4 rounded-[20px] mb-4 text-[13px] leading-relaxed border ${isDark ? 'bg-[#1a2235] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            {content.detailsTitle.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>

          <div className={`p-4 rounded-[20px] mb-6 text-[13px] border ${isDark ? 'bg-[#1a2235] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            {content.organizer.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>

          <div className="mb-8">
            <div className="text-[14px] font-medium mb-2">{content.participantCount}</div>
            <div className={`h-2 rounded-full w-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div className="w-[50%] h-full bg-[#1877f2] rounded-full"></div>
            </div>
            <div className="text-center text-[13px] mt-1 font-semibold">23</div>
          </div>

          <button className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-[16px] font-semibold text-[16px] transition-colors shadow-lg shadow-blue-500/20">
            {content.joinBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
