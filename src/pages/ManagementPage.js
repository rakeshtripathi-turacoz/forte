import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/common/Banner';
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.API_URL;

const ManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    managementTeam: [],
    vision: null,
    mission: null
  });

  // Construct full image URL from relative path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/${imagePath}`;
  };

  // Helper function to strip HTML tags and get plain text excerpt
  const getTextExcerpt = (htmlContent, maxLength = 200) => {
    if (!htmlContent) return '';

    // Remove HTML tags
    const plainText = htmlContent.replace(/<[^>]*>/g, '');

    // Truncate to maxLength
    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }

    return plainText;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [messagesRes, visionMissionRes] = await Promise.all([
        fetch(`${API_URL}/messages`),
        fetch(`${API_URL}/vision-mission/complete`)
      ]);

      const messagesData = await messagesRes.json();
      const visionMissionData = await visionMissionRes.json();

      // Map leadership messages to management team format
      const managementTeam = messagesData.success && messagesData.data
        ? messagesData.data
            .filter(m => ['chairman', 'secretary', 'joint_secretary'].includes(m.role_type))
            .map(m => ({
              name: m.name,
              position: m.designation,
              image: m.profile_image_path,
              description: m.quote || `Leading with excellence and commitment.`,
              link: `/about/${m.role_type.replace('_', '-')}-message`
            }))
        : [];

      setData({
        managementTeam,
        vision: visionMissionData.success ? visionMissionData.data.vision : null,
        mission: visionMissionData.success ? visionMissionData.data.mission : null
      });
    } catch (error) {
      console.error('Error loading management page data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full fade-in">
        <Banner
          title="Management"
          subtitle="Leadership | Vision | Excellence"
          imageSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        />
        <div className="max-w-6xl mx-auto p-10 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Management"
        subtitle="Leadership | Vision | Excellence"
        imageSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Our Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            The management of Forte Institute of Technology is committed to providing world-class education
            and creating an environment that fosters innovation, research, and holistic development of students.
          </p>
        </div>

        {/* Management Team */}
        <section>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {data.managementTeam.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-card transition">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                    {member.image ? (
                      <img
                        src={getImageUrl(member.image)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', member.image);
                          e.target.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Image';
                        }}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/150/cccccc/666666?text=No+Image"
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate mb-1 break-words">{member.name}</h3>
                  <p className="text-crimson font-semibold text-sm mb-3 break-words">{member.position}</p>
                  <p className="text-gray-600 text-xs mb-4 break-words">{member.description}</p>
                  <a
                    href={member.link}
                    className="inline-block bg-crimson hover:bg-red-800 text-white font-semibold py-2 px-4 rounded transition text-sm"
                  >
                    Read Message
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Vision */}
            <div className="bg-crimson/5 p-6 sm:p-8 rounded-xl border border-crimson/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-crimson rounded-full flex items-center justify-center">
                  <i className="fas fa-eye text-white text-xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-crimson">
                  {data.vision?.title || 'Our Vision'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                {getTextExcerpt(
                  data.vision?.content,
                  200
                ) || 'To be a premier institute of technology that empowers students to become innovative leaders and ethical professionals who contribute meaningfully to society and the global economy.'}
              </p>
              <Link
                to="/about/vision-mission"
                className="inline-flex items-center text-crimson font-semibold hover:text-red-800 transition group"
              >
                Read More
                <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>

            {/* Mission */}
            <div className="bg-gold/5 p-6 sm:p-8 rounded-xl border border-gold/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <i className="fas fa-bullseye text-white text-xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-gold">
                  {data.mission?.title || 'Our Mission'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                {getTextExcerpt(
                  data.mission?.content,
                  250
                ) || 'To provide world-class technical education that combines theoretical knowledge with practical application, preparing students for successful careers in an ever-evolving technological landscape.'}
              </p>
              <Link
                to="/about/vision-mission"
                className="inline-flex items-center text-gold font-semibold hover:text-yellow-700 transition group"
              >
                Read More
                <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ManagementPage;
