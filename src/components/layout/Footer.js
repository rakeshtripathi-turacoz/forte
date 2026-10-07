import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface pt-20 pb-10 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="brand-logo mb-6">
              <div className="shield-icon" style={{ transform: 'scale(0.7)', marginLeft: '-5px' }}>
                <span className="shield-char">F</span>
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-crimson">Forte</h1>
                <p className="text-[8px] uppercase tracking-widest text-slate font-bold">Institute of Technology</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed pr-4">Empowering the next generation through innovation.</p>
          </div>
          <div>
            <h5 className="font-serif font-bold text-slate text-sm mb-4">Quick Links</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="/academics" className="hover:text-crimson transition">Academic Calendar</a></li>
              <li><a href="https://aktu.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-crimson transition">AKTU Website</a></li>
              <li><a href="https://ccsuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-crimson transition">CCS University Website</a></li>
              <li><a href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" className="hover:text-crimson transition">AICTE Website</a></li>
              <li><a href="/academics" className="hover:text-crimson transition">Syllabus & Curriculum</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-serif font-bold text-slate text-sm mb-4">Keep in Touch</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1 text-crimson"></i>
                <span>Green Park Mawana Road, Meerut – 250001 (U.P.) INDIA.</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-crimson"></i>
                <a href="mailto:info@forte.ac.in" className="hover:text-crimson transition">info@forte.ac.in</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone-alt text-crimson"></i>
                <div>
                  <a href="tel:9058310460" className="hover:text-crimson transition">9058310460</a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-whatsapp text-green-500"></i>
                <a href="https://wa.me/919058310460" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">9058310460</a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-serif font-bold text-slate text-sm mb-4">Social</h5>
            <div className="flex gap-3 flex-wrap">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded bg-white border border-gray-200 flex items-center justify-center text-slate hover:bg-blue-600 hover:text-white hover:border-blue-600 transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded bg-white border border-gray-200 flex items-center justify-center text-slate hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-pink-500 transition">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
          &copy; 2025 Forte Institute of Technology. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;