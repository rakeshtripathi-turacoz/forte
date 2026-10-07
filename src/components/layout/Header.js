import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';

const Header = ({ activeTab }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  
  const tabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'academics', label: 'Academics', path: '/academics' },
    { id: 'admissions', label: 'Admissions', path: '/admissions' },
    { id: 'life', label: 'Life@FIT', path: '/life' },
    { id: 'achievements', label: 'Awards', path: '/achievements' },
    { id: 'placements', label: 'Placements', path: '/placements' },
    { id: 'careers', label: 'Careers', path: '/careers' },
    { id: 'gallery', label: 'Gallery', path: '/gallery' },
    { id: 'contact', label: 'Contact', path: '/contact' }
  ];

  return (
    <header className="bg-white border-b border-border_gray shadow-sm z-30 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
      
      <div className="px-4 py-2 flex justify-between items-center max-w-[1600px] mx-auto">
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-2 items-center ml-8">
          {tabs.map((tab) => {
            if (tab.id === 'about') {
              return (
                <div 
                  key={tab.id}
                  className="relative group"
                  onMouseEnter={() => setShowAboutDropdown(true)}
                  onMouseLeave={() => setShowAboutDropdown(false)}
                >
                  <button
                    onClick={() => navigate('/about')}
                    className={`py-1.5 px-1 text-[14px] font-semibold border-b-2 transition-all hover:text-slate whitespace-nowrap flex items-center gap-0.5 ${
                      activeTab === tab.id
                        ? 'text-crimson border-crimson'
                        : 'text-gray-500 border-transparent'
                    }`}
                  >
                    {tab.label}
                    <i className="fas fa-chevron-down text-[10px] opacity-50 transition-transform group-hover:rotate-180"></i>
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
                          Director's Office
                        </a>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/about/anti-ragging');
                            setShowAboutDropdown(false);
                          }}
                          className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                        >
                          Anti-Ragging & Grievance Committee
                        </a>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/about/mandatory-disclosures');
                            setShowAboutDropdown(false);
                          }}
                          className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                        >
                          Mandatory Disclosures
                        </a>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/about/organizational-chart');
                            setShowAboutDropdown(false);
                          }}
                          className="block px-4 py-3 text-sm hover:bg-gray-50 hover:text-crimson transition"
                        >
                          Organizational Chart
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`py-1.5 px-1 text-[14px] font-semibold border-b-2 transition-all hover:text-slate whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-crimson border-crimson'
                    : 'text-gray-500 border-transparent'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-crimson"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu with Animation */}
      <div
        className={`lg:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          {tabs.map((tab) => {
            if (tab.id === 'about') {
              return (
                <div key={tab.id} className="space-y-1">
                  <Link
                    to={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-crimson bg-crimson/10'
                        : 'text-gray-700 hover:text-crimson hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </Link>
                  {/* About Us submenu items */}
                  <div className="ml-4 space-y-1">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about/management');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-crimson hover:bg-gray-50 rounded-md transition-colors"
                    >
                      → Management
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about/administration');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-crimson hover:bg-gray-50 rounded-md transition-colors"
                    >
                      → Director's Office
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about/anti-ragging');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-crimson hover:bg-gray-50 rounded-md transition-colors"
                    >
                      → Anti-Ragging & Grievance Committee
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about/mandatory-disclosures');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-crimson hover:bg-gray-50 rounded-md transition-colors"
                    >
                      → Mandatory Disclosures
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about/organizational-chart');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-crimson hover:bg-gray-50 rounded-md transition-colors"
                    >
                      → Organizational Chart
                    </a>
                  </div>
                </div>
              );
            }
            
            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-crimson bg-crimson/10'
                    : 'text-gray-700 hover:text-crimson hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;