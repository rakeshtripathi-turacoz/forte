import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api.config';
import './MessagePage.css';

const API_URL = API_CONFIG.API_URL;

const ChairmanMessagePage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: 'Mr. Rajesh Kumar',
    designation: 'Chairman',
    profile_image_path: '',
    message_content: 'Loading...',
    quote: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/messages/chairman`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading chairman message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Construct full image URL from relative path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/${imagePath}`;
  };

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="relative bg-slate py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-slate to-crimson opacity-90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Chairman's Message</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Leading with vision, inspiring excellence in education and innovation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          {loading ? (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft p-12 md:p-16">
              <div className="grid md:grid-cols-4 gap-12 mb-8">
                {/* Photo */}
                <div className="md:col-span-1">
                  <div className="bg-gray-100 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden">
                    {data.profile_image_path ? (
                      <img
                        src={getImageUrl(data.profile_image_path)}
                        alt={data.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', data.profile_image_path);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <i className="fas fa-user-tie text-8xl text-gray-400"></i>
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="font-bold text-xl text-slate">{data.name}</h3>
                    <p className="text-base text-gray-500 mt-2">{data.designation}</p>
                    <p className="text-sm text-gray-400 mt-1">Forte Institute of Technology</p>
                  </div>
                </div>

                {/* Message Content */}
                <div className="md:col-span-3">
                  <div
                    className="message-content text-gray-600 leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{ __html: data.message_content }}
                  />

                  {data.quote && (
                    <div className="mt-8 p-6 bg-crimson/5 border-l-4 border-crimson rounded-r-lg">
                      <p className="text-gray-700 italic">"{data.quote}"</p>
                    </div>
                  )}

                  <p className="text-gray-600 leading-relaxed font-semibold mt-8">
                    Warm regards,<br/>
                    <span className="text-crimson text-xl">{data.name}</span><br/>
                    <span className="text-base font-normal">{data.designation}, Forte Institute of Technology</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairmanMessagePage;
