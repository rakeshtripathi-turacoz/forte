import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';

const WebNavigation = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex justify-between items-center">
        <Logo onClick={scrollToTop} />

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate">
          {/* About Us Dropdown */}
          <div
            className="relative group py-6"
            onMouseEnter={() => setShowAboutDropdown(true)}
            onMouseLeave={() => setShowAboutDropdown(false)}
          >
            <button 
              onClick={() => navigate('/about')}
              className="group-hover:text-crimson transition flex items-center gap-1"
            >
              About Us <i className="fas fa-chevron-down text-[10px] opacity-50 transition-transform group-hover:rotate-180"></i>
            </button>
            
            {/* Invisible bridge to prevent gap */}
            <div className="absolute top-full left-0 w-full h-2 bg-transparent"></div>
            
            {showAboutDropdown && (
              <div className="absolute top-full left-0 pt-2 w-56 z-50">
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 py-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/about/management');
                      setShowAboutDropdown(false);
                    }}
                    className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                  >
                    Management
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/about/administration');
                      setShowAboutDropdown(false);
                    }}
                    className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                  >
                    Administration
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/about/director');
                      setShowAboutDropdown(false);
                    }}
                    className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                  >
                    Director
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Academics Dropdown */}
          <div
            className="relative group py-6"
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <a href="#" className="group-hover:text-crimson transition flex items-center gap-1">
              Academics <i className="fas fa-chevron-down text-[10px] opacity-50"></i>
            </a>

            {showMegaMenu && (
              <div className="mega-menu absolute top-full left-1/2 transform -translate-x-1/2 w-[600px] bg-white shadow-float border border-gray-100 rounded-xl p-8 z-50">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-crimson font-bold text-xs uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Schools</h5>
                    <ul className="space-y-3 text-gray-500 font-normal">
                      <li><a href="#" className="hover:text-slate hover:underline">Engineering & Technology</a></li>
                      <li><a href="#" className="hover:text-slate hover:underline">Management Studies</a></li>
                      <li><a href="#" className="hover:text-slate hover:underline">Applied Sciences</a></li>
                      <li><a href="#" className="hover:text-slate hover:underline">Liberal Arts</a></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-crimson font-bold text-xs uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Resources</h5>
                    <ul className="space-y-3 text-gray-500 font-normal">
                      <li><a href="#" className="hover:text-slate hover:underline">Academic Calendar</a></li>
                      <li><a href="#" className="hover:text-slate hover:underline">Exam Results</a></li>
                      <li><a href="#" className="hover:text-slate hover:underline">Faculty Directory</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#" className="hover:text-crimson transition">Admissions</a>

          <button
            onClick={() => navigate('/announcements')}
            className="hover:text-crimson transition"
          >
            Announcements
          </button>

          <a href="#" className="hover:text-crimson transition">Campus Life</a>

          <a href="#" className="bg-crimson hover:bg-red-800 text-white px-6 py-2.5 rounded shadow-md transition transform hover:-translate-y-0.5">Apply Now</a>
        </div>
      </div>
    </nav>
  );
};

export default WebNavigation;