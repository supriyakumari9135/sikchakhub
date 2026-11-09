import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  QrCode, 
  UserCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-white via-sky-50/40 to-sky-100/60 text-slate-600 pt-16 pb-10 border-t border-sky-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Callout / Helpline Strip */}
        <div className="bg-white border border-sky-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-sky-100/50 hover:shadow-lg hover:shadow-sky-100 hover:border-sky-300 transition-all duration-300">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              Direct Candidate & Recruiter Support
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
              Need assistance finding faculty or applying for positions?
            </h3>
            <p className="text-xs text-slate-500">
              Our education recruitment advisors are available Monday to Saturday (9:00 AM - 7:00 PM IST).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a 
              href="tel:9783143666" 
              className="cursor-pointer flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>+91 97831 43666</span>
            </a>
            <a 
              href="tel:9728987999" 
              className="cursor-pointer flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-sky-50 text-sky-800 hover:bg-sky-100 font-bold text-xs sm:text-sm border border-sky-200 hover:border-sky-300 shadow-xs hover:shadow-md hover:shadow-sky-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-sky-600" />
              <span>+91 97289 87999</span>
            </a>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img
                src="/logo.jpeg"
                alt="SikshaHub Logo"
                className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-sky-200 bg-white group-hover:scale-105 group-hover:border-sky-300 transition-all duration-200"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-serif tracking-tight">
                  Siksha<span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                  .ai
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India's #1 automated teacher recruitment engine powered by AI. Connecting over 5,500+ top CBSE schools, IIT-JEE coaching institutes, NEET medical faculties, and universities with over 1.8M+ verified educators.
            </p>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>support@sikchakhub.ai / hr@sikchakhub.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Kota • Delhi NCR • Jaipur • Bengaluru • Pune</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {['LinkedIn', 'YouTube', 'Instagram', 'Facebook', 'Telegram'].map((net) => (
                <span
                  key={net}
                  title={`Follow SikshaHub on ${net}`}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer shadow-2xs hover:shadow-md hover:shadow-sky-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-200"
                >
                  {net[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Job Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/jobs?teachingLevel=COACHING_JEE" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  IIT-JEE Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COACHING_NEET" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  NEET Medical Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PGT" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  PGT Senior Secondary Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=TGT" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  TGT High School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PRT" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  PRT Primary School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COLLEGE_PROFESSOR" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  College & University Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Hiring Locations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/jobs?city=Kota" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Faculty Jobs in Kota
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Delhi" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Teacher Jobs in Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Jaipur" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Teaching Vacancies in Jaipur
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Bengaluru" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  International Schools Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Pune" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  Professor Positions in Pune
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Hyderabad" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                  JEE & NEET Jobs Hyderabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Mobile App */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Candidate Resources
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link to="/jobs" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-150">
                    <span>Verified Teaching Vacancies</span>
                    <span className="text-[9px] font-bold bg-sky-100 text-sky-700 px-1 rounded border border-sky-200">NEW</span>
                  </Link>
                </li>
                <li>
                  <Link to="/teacher-dashboard" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                    Educator Profile Builder
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className="cursor-pointer hover:text-sky-600 hover:translate-x-1 inline-flex items-center transition-all duration-150">
                    Post Free Job for School
                  </Link>
                </li>
                <li>
                  <Link to="/hr-login" className="cursor-pointer hover:text-amber-700 hover:translate-x-1 inline-flex items-center gap-1.5 font-semibold text-amber-700 transition-all duration-150">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>HR Recruiter Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Mobile App Download Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-sky-200 hover:border-sky-300 space-y-2 shadow-xs hover:shadow-md hover:shadow-sky-100 transition-all duration-200">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">Mobile App (4.8★)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Download SikshaHub for instant interview alerts & fast-track hiring.
              </p>
              <div className="flex gap-1.5 pt-1">
                <span className="cursor-pointer text-[10px] font-bold px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-slate-700 hover:text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95">
                  Google Play
                </span>
                <span className="cursor-pointer text-[10px] font-bold px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-slate-700 hover:text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95">
                  App Store
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Legal Links */}
        <div className="pt-8 border-t border-sky-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SikshaHub Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="cursor-pointer hover:text-sky-700 hover:underline transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-sky-700 hover:underline transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-sky-700 hover:underline transition-colors">Cancellation & Refund Policy</span>
            <span className="cursor-pointer hover:text-sky-700 hover:underline transition-colors">Fraud Warning & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
