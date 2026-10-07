import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdmissionEnquiryModal from '../components/common/AdmissionEnquiryModal';
import { homeAPI } from '../services/api';
import { getHomePageData, saveHomePageData } from '../utils/homePageData';
import API_CONFIG from '../config/api.config';
import './StandardHomePage.css';

const StandardHomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState(null); // No fallback - only database data

  // Load data from backend API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await homeAPI.getComplete();

        if (response.success && response.data) {
          const { hero, stats, programs, announcements, testimonials, cta } = response.data;

          // Transform backend data to match frontend format
          const transformedData = {
            hero: {
              title: hero?.hero_title || 'Welcome to',
              subtitle: hero?.hero_subtitle || 'Forte Institute of Technology',
              description: hero?.hero_description || '',
              image: hero?.hero_background_image
                ? (hero.hero_background_image.startsWith('http')
                    ? hero.hero_background_image
                    : API_CONFIG.getFileUrl(hero.hero_background_image))
                : 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
              buttons: {
                primary: {
                  text: hero?.primary_btn_text || 'Admission Enquiry',
                  enabled: hero?.primary_btn_enabled !== false
                },
                secondary: {
                  text: hero?.secondary_btn_text || 'Academic Programs',
                  link: hero?.secondary_btn_link || '/academics',
                  enabled: hero?.secondary_btn_enabled !== false
                }
              }
            },
            stats: (stats || []).map(s => ({
              number: s.stat_value,
              label: s.stat_title
            })),
            featuredPrograms: (programs || []).map(p => ({
              title: p.program_title,
              description: p.program_description,
              icon: p.program_icon,
              link: p.program_link
            })),
            announcements: (announcements || []).map(a => ({
              date: new Date(a.announcement_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              title: a.title || a.announcement_title,
              link: a.link_url || a.announcement_link || '#'
            })),
            testimonials: (testimonials || []).map(t => ({
              rating: t.rating || 5,
              text: t.testimonial_text,
              name: t.student_name,
              designation: t.student_designation,
              avatar: t.student_avatar_initials
            })),
            cta: {
              title: cta?.cta_title || 'Ready to Start Your Journey?',
              description: cta?.cta_description || '',
              buttons: {
                primary: {
                  text: cta?.primary_btn_text || 'Admission Enquiry',
                  enabled: cta?.primary_btn_enabled !== false
                },
                secondary: {
                  text: cta?.secondary_btn_text || 'Learn More About Us',
                  link: cta?.secondary_btn_link || '/about',
                  enabled: cta?.secondary_btn_enabled !== false
                }
              }
            }
          };

          // Update state with fresh data
          setPageData(transformedData);
        } else {
          setError('No data available from server');
        }
      } catch (error) {
        console.error('Error loading home page data from API:', error);
        setError('Failed to load page data. Please ensure the database is running.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !pageData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-slate mb-2">Unable to Load Page</h2>
          <p className="text-gray-600 mb-4">{error || 'No data available'}</p>
          <p className="text-sm text-gray-500 mb-4">Please ensure:</p>
          <ul className="text-sm text-gray-500 text-left mb-4">
            <li>• MySQL database is running</li>
            <li>• Backend server is running on port 5000</li>
            <li>• Database tables are properly imported</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="bg-crimson text-white px-6 py-2 rounded hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { hero, stats, featuredPrograms, announcements, testimonials, cta } = pageData;

  return (
    <div className="h-full w-full fade-in">
      {/* Hero Section */}
      <section
        className="relative hero-bg-image bg-cover bg-center min-h-[500px] md:h-96 py-8 md:py-0"
        style={{ backgroundImage: `url(${hero.image})` }}
      >
        <div className="hero-overlay absolute inset-0"></div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-white text-center md:text-left">
                <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-4 md:mb-6">
                  {hero.title}<br />
                  <span className="text-gold">{hero.subtitle}</span>
                </h1>
                <div
                  className="hero-description text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: hero.description }}
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                  {hero.buttons.primary.enabled && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-crimson hover:bg-red-800 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition transform hover:-translate-y-1 shadow-lg text-sm sm:text-base"
                    >
                      {hero.buttons.primary.text}
                    </button>
                  )}
                  {hero.buttons.secondary.enabled && (
                    <Link
                      to={hero.buttons.secondary.link}
                      className="bg-crimson hover:bg-red-800 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition transform hover:-translate-y-1 shadow-lg text-sm sm:text-base"
                    >
                      {hero.buttons.secondary.text}
                    </Link>
                  )}
                </div>
              </div>

              {/* Announcements Card */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-float mx-auto max-w-sm md:max-w-none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-2xl text-slate">Announcements</h3>
                  <Link to="/announcements" className="text-crimson text-sm font-semibold hover:underline">View All</Link>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {announcements.map((item, index) => (
                    <Link key={index} to={item.link} className="block p-3 bg-surface rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-bullhorn text-crimson mt-1"></i>
                        <div>
                          <h4 className="font-semibold text-slate text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-crimson mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-xs md:text-sm text-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-8 sm:py-10 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-2 sm:mb-3">Featured Programs</h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Discover our industry-leading programs designed to prepare you for tomorrow's challenges.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredPrograms.map((program, index) => (
              <Link
                key={index}
                to={program.link}
                className="bg-white p-5 rounded-xl border border-border_gray hover:shadow-card transition group"
              >
                <div className="w-14 h-14 bg-crimson rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-800 transition">
                  <i className={`${program.icon} text-xl text-white`}></i>
                </div>
                <h3 className="text-lg font-bold text-slate mb-2">{program.title}</h3>
                <div className="program-description text-gray-600 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: program.description }} />
                <div className="mt-3 text-crimson font-semibold text-xs">
                  Learn More <i className="fas fa-arrow-right ml-1"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-2 sm:mb-3">What Our Students Say</h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">Hear from our students and alumni about their experience at Forte Institute of Technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => {
              const avatarColors = ['bg-crimson', 'bg-gold', 'bg-slate'];
              const avatarColor = avatarColors[index % avatarColors.length];

              return (
                <div key={index} className="bg-surface p-5 rounded-xl border border-border_gray">
                  <div className="flex items-center gap-1 text-gold mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                  </div>
                  <div className="testimonial-text text-gray-600 text-xs sm:text-sm mb-4 italic" dangerouslySetInnerHTML={{ __html: `"${testimonial.text}"` }} />
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-gray-500">{testimonial.designation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 sm:py-10 bg-slate text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">{cta.title}</h2>
          <div
            className="cta-description text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 max-w-2xl mx-auto px-4 sm:px-0"
            dangerouslySetInnerHTML={{ __html: cta.description }}
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {cta.buttons.primary.enabled && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-crimson hover:bg-red-800 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition transform hover:-translate-y-1 shadow-lg text-sm"
              >
                {cta.buttons.primary.text}
              </button>
            )}
            {cta.buttons.secondary.enabled && (
              <Link
                to={cta.buttons.secondary.link}
                className="bg-crimson hover:bg-red-800 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition transform hover:-translate-y-1 shadow-lg text-sm"
              >
                {cta.buttons.secondary.text}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Admission Enquiry Modal */}
      <AdmissionEnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StandardHomePage;
