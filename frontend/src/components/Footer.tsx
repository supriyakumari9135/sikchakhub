import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  QrCode, 
  ExternalLink,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Callout / Helpline Strip */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tallento-pink bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
              Direct Candidate & Recruiter Support
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">
              Need assistance finding faculty or applying for positions?
            </h3>
            <p className="text-xs text-slate-400">
              Our education recruitment advisors are available Monday to Saturday (9:00 AM - 7:00 PM IST).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a 
              href="tel:9783143666" 
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition shadow-md"
            >
              <PhoneCall className="w-4 h-4 text-tallento-pink" />
              <span>+91 97831 43666</span>
            </a>
            <a 
              href="tel:9728987999" 
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 text-white font-bold text-xs sm:text-sm hover:bg-slate-700 border border-slate-700 transition"
            >
              <PhoneCall className="w-4 h-4 text-tallento-orange" />
              <span>+91 97289 87999</span>
            </a>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-tallento-pink via-tallento-orange to-tallento-purple flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-white font-serif tracking-tight">
                  Siksha<span className="bg-gradient-to-r from-tallento-pink to-tallento-orange bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-tallento-pink/20 text-tallento-pink border border-tallento-pink/30">
                  .ai
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's #1 automated teacher recruitment engine powered by AI. Connecting over 5,500+ top CBSE schools, IIT-JEE coaching institutes, NEET medical faculties, and universities with over 1.8M+ verified educators.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-tallento-pink" />
                <span>support@sikchakhub.ai / hr@sikchakhub.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-tallento-orange" />
                <span>Kota • Delhi NCR • Jaipur • Bengaluru • Pune</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {['LinkedIn', 'YouTube', 'Instagram', 'Facebook', 'Telegram'].map((net) => (
                <span
                  key={net}
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition shadow-xs"
                >
                  {net[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Job Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/jobs?teachingLevel=COACHING_JEE" className="hover:text-tallento-pink transition">
                  IIT-JEE Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COACHING_NEET" className="hover:text-tallento-pink transition">
                  NEET Medical Faculty Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PGT" className="hover:text-tallento-pink transition">
                  PGT Senior Secondary Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=TGT" className="hover:text-tallento-pink transition">
                  TGT High School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=PRT" className="hover:text-tallento-pink transition">
                  PRT Primary School Teachers
                </Link>
              </li>
              <li>
                <Link to="/jobs?teachingLevel=COLLEGE_PROFESSOR" className="hover:text-tallento-pink transition">
                  College & University Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Hiring Locations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/jobs?city=Kota" className="hover:text-tallento-orange transition">
                  Faculty Jobs in Kota
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Delhi" className="hover:text-tallento-orange transition">
                  Teacher Jobs in Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Jaipur" className="hover:text-tallento-orange transition">
                  Teaching Vacancies in Jaipur
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Bengaluru" className="hover:text-tallento-orange transition">
                  International Schools Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Pune" className="hover:text-tallento-orange transition">
                  Professor Positions in Pune
                </Link>
              </li>
              <li>
                <Link to="/jobs?city=Hyderabad" className="hover:text-tallento-orange transition">
                  JEE & NEET Jobs Hyderabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Mobile App */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Candidate Resources
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/ats-checker" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                    <span>Free ATS Resume Checker</span>
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1 rounded">HOT</span>
                  </Link>
                </li>
                <li>
                  <Link to="/teacher-dashboard" className="hover:text-white transition">
                    Educator Profile Builder
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className="hover:text-white transition">
                    Post Free Job for School
                  </Link>
                </li>
              </ul>
            </div>

            {/* Mobile App Download Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-tallento-pink" />
                <span className="text-xs font-bold text-white">Mobile App (4.8★)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Download SikshaHub for instant interview alerts & fast-track hiring.
              </p>
              <div className="flex gap-1.5 pt-1">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Google Play
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  App Store
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Legal Links */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SikshaHub Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cancellation & Refund Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Fraud Warning & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
