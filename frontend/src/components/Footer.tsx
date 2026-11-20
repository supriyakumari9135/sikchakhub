import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  QrCode, 
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#FFFDF9] via-[#FFF8F0] to-[#FFF1E3] text-slate-600 pt-16 pb-12 border-t border-orange-200/80 relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Top Callout / Helpline Strip */}
        <div className="bg-white/95 backdrop-blur-md border border-orange-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/5 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-100/90 px-3 py-0.5 rounded-full border border-orange-200/80 shadow-2xs">
              <Sparkles className="w-3 h-3 text-orange-600" />
              <span>Direct Candidate & Recruiter Support</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
              Need assistance finding faculty or applying for positions?
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Our education recruitment advisors are available Monday to Saturday (9:00 AM - 7:00 PM IST) to fast-track your hiring.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a 
              href="tel:9783143666" 
              className="cursor-pointer flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>+91 97831 43666</span>
            </a>
            <a 
              href="tel:9728987999" 
              className="cursor-pointer flex items-center gap-2.5 px-5 py-3 rounded-full bg-orange-50/80 text-orange-900 hover:bg-orange-100 font-bold text-xs sm:text-sm border border-orange-200 hover:border-orange-300 shadow-2xs hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-orange-600" />
              <span>+91 97289 87999</span>
            </a>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer inline-flex">
              <img
                src="/logo.jpeg"
                alt="SikchaKhub Logo"
                className="w-12 h-12 rounded-full object-cover shadow-xs border border-amber-300 bg-white group-hover:scale-105 group-hover:border-orange-400 transition-all duration-200"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 font-serif tracking-tight leading-none">
                  Sikcha<span className="text-orange-600">Khub</span><span className="text-amber-500 font-sans">.Ai</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                  AI-Powered Teacher Recruitment
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India's #1 automated teacher recruitment engine powered by AI. Connecting over 5,500+ top CBSE schools, IIT-JEE coaching institutes, NEET medical faculties, and universities with over 1.8M+ verified educators.
            </p>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="font-medium text-slate-700">support@sikchakhub.ai • hr@sikchakhub.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Kota • Delhi NCR • Jaipur • Bengaluru • Pune • Mumbai</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: 'LinkedIn', code: 'In' },
                { name: 'YouTube', code: 'Yt' },
                { name: 'Instagram', code: 'Ig' },
                { name: 'Facebook', code: 'Fb' },
                { name: 'Telegram', code: 'Tg' }
              ].map((net) => (
                <span
                  key={net.name}
                  title={`Follow SikchaKhub on ${net.name}`}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:text-white border border-orange-200 hover:border-orange-400 flex items-center justify-center text-xs font-bold text-slate-700 cursor-pointer shadow-2xs hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 transition-all duration-200"
                >
                  {net.code}
                </span>
              ))}
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Job Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/jobs?teachingLevel=COACHING_JEE" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  IIT-JEE Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COACHING_NEET" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  NEET Medical Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PGT" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  PGT Senior Secondary Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=TGT" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  TGT High School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PRT" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  PRT Primary School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COLLEGE_PROFESSOR" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  College & University Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Hiring Locations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/jobs?city=Kota" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Faculty Jobs in Kota
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Delhi" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Teacher Jobs in Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Jaipur" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Teaching Vacancies in Jaipur
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Bengaluru" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  International Schools Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Pune" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Professor Positions in Pune
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Hyderabad" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  JEE & NEET Jobs Hyderabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Mobile App */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                Candidate Resources
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li>
                  <Link to="/jobs" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150">
                    <span>Verified Teaching Vacancies</span>
                    <span className="text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded border border-orange-200">NEW</span>
                  </Link>
                </li>
                <li>
                  <Link to="/teacher-dashboard" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                    Educator Profile Builder
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className="cursor-pointer hover:text-orange-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                    Post Free Job for School
                  </Link>
                </li>
                <li>
                  <Link to="/hr-login" className="cursor-pointer hover:text-orange-700 hover:translate-x-1 inline-flex items-center gap-1.5 font-semibold text-orange-800 transition-all duration-150">
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    <span>HR Recruiter Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Mobile App Download Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-orange-200 hover:border-orange-300 space-y-2 shadow-xs hover:shadow-md hover:shadow-orange-500/10 transition-all duration-200">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-bold text-slate-900">Mobile App (4.8★)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Download SikchaKhub for instant interview alerts & fast-track hiring.
              </p>
              <div className="flex gap-1.5 pt-1">
                <span className="cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95">
                  Google Play
                </span>
                <span className="cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-slate-700 hover:text-orange-700 border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95">
                  App Store
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Legal Links */}
        <div className="pt-8 border-t border-orange-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SikchaKhub Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="cursor-pointer hover:text-orange-700 hover:underline transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-orange-700 hover:underline transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-orange-700 hover:underline transition-colors">Cancellation & Refund Policy</span>
            <span className="cursor-pointer hover:text-orange-700 hover:underline transition-colors">Fraud Warning & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
