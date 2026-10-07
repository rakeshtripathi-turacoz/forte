import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import API_CONFIG from '../config/api.config';
import './VisionMissionPage.css';

const API_URL = API_CONFIG.API_URL;

const VisionMissionPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vision: {
      title: 'Our Vision',
      content: 'Loading...',
      image_url: ''
    },
    mission: {
      title: 'Our Mission',
      content: 'Loading...',
      image_url: ''
    },
    coreValues: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vision-mission/complete`);
      const result = await response.json();

      console.log('🔍 Vision & Mission API Response:', result);
      console.log('📝 Vision Content Length:', result.data?.vision?.content?.length);
      console.log('📝 Vision Content:', result.data?.vision?.content);

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading vision & mission data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Construct full image URL from relative path or return as-is if already full URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already a full URL (starts with http), return as-is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise construct full URL
    const baseUrl = API_URL.replace('/api', '');
    // Remove leading slash from imageUrl if present to avoid double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `${baseUrl}/${cleanPath}`;
  };

  // Split content by \n for paragraphs
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('•')) {
        return <li key={index} className="text-gray-600 leading-relaxed">{paragraph.replace('•', '').trim()}</li>;
      }
      return paragraph.trim() && (
        <p key={index} className="text-gray-600 leading-relaxed">{paragraph}</p>
      );
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <Banner 
        title="Vision & Mission" 
        subtitle="Shaping the future through excellence in education and innovation"
        imageSrc="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      
      {/* Main Content */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          {/* Vision Section */}
          <div className="bg-white rounded-xl shadow-soft p-12 md:p-16 mb-12">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Vision Image */}
              <div className="md:col-span-1">
                {data.vision?.image_url && (
                  <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={getImageUrl(data.vision.image_url)}
                      alt="Vision"
                      className="w-full h-full object-cover aspect-[4/3]"
                      onError={(e) => {
                        console.error('Failed to load vision image:', data.vision.image_url);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Vision Content */}
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-crimson mb-6">
                  {loading ? 'Our Vision' : data.vision?.title || 'Our Vision'}
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-3xl text-crimson"></i>
                  </div>
                ) : (
                  <div
                    className="vision-content space-y-4 text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.vision?.content || '' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-xl shadow-soft p-12 md:p-16 mb-12">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Mission Content */}
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-crimson mb-6">
                  {loading ? 'Our Mission' : data.mission?.title || 'Our Mission'}
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-3xl text-crimson"></i>
                  </div>
                ) : (
                  <div
                    className="mission-content space-y-4 text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.mission?.content || '' }}
                  />
                )}
              </div>

              {/* Mission Image */}
              <div className="md:col-span-1">
                {data.mission?.image_url && (
                  <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={getImageUrl(data.mission.image_url)}
                      alt="Mission"
                      className="w-full h-full object-cover aspect-[4/3]"
                      onError={(e) => {
                        console.error('Failed to load mission image:', data.mission.image_url);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="bg-white rounded-xl shadow-soft p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-crimson mb-8 text-center">Our Core Values</h2>

            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-3xl text-crimson"></i>
              </div>
            ) : (
              <div className={`grid md:grid-cols-2 ${data.coreValues.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
                {data.coreValues.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-crimson/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <i className={`${value.icon_class} text-3xl text-crimson`}></i>
                    </div>
                    <h3 className="font-bold text-lg text-slate mb-2">{value.title}</h3>
                    <div
                      className="core-value-content text-sm text-gray-600"
                      dangerouslySetInnerHTML={{ __html: value.description || '' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisionMissionPage;