import React, { useState, useEffect } from 'react';
import Logo from '../components/common/Logo';
import Banner from '../components/common/Banner';
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.API_URL;

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch about page content
      const pageResponse = await fetch(`${API_URL}/about-page`);
      const pageResult = await pageResponse.json();

      if (pageResult.success && pageResult.data) {
        setPageData(pageResult.data);
      }
    } catch (error) {
      console.error('Error loading about page data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fade-in flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Default values if no data from backend
  const defaultData = {
    page_title: 'About Forte Institute of Technology',
    page_subtitle: 'Excellence in Education | Building Tomorrow\'s Leaders',
    banner_image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    overview_heading: 'About Forte Institute of Technology',
    overview_description: '<p>Forte Institute of Technology is a premier educational institution dedicated to providing world-class education across multiple disciplines. We are committed to fostering innovation, research excellence, and developing skilled professionals for the modern workforce.</p>',
    approval_badge_text: 'AICTE Approved | AKTU & CCS University Affiliated | NCTE Approved',
    logo_tagline: 'Excellence in Education'
  };

  const data = pageData || defaultData;

  return (
    <div className="min-h-screen w-full fade-in">
      <Banner
        title={data.page_title}
        subtitle={data.page_subtitle}
        imageSrc={data.banner_image_url}
      />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 pb-16">

        {/* Institute Overview */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 sm:p-12 md:p-16 rounded-2xl shadow-soft border border-border_gray flex flex-col items-center justify-center relative">
              <span className="absolute top-4 right-4 font-mono text-[10px] text-gray-400 border border-gray-200 px-2 py-1 rounded">FORTE INSTITUTE OF TECHNOLOGY</span>
              <Logo size="large" />
              <div className="text-center mt-4 sm:mt-6 md:mt-8">
                <p className="text-slate font-sans font-bold text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                  {data.logo_tagline}
                </p>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 mt-8 md:mt-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate text-center md:text-left">
                {data.overview_heading}
              </h2>
              <div
                className="text-xs sm:text-sm text-gray-600 leading-relaxed about-overview-content"
                dangerouslySetInnerHTML={{ __html: data.overview_description }}
              />
              {data.approval_badge_text && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>{data.approval_badge_text}</strong>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
