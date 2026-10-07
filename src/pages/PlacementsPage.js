import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { placementsAPI } from '../services/api';

const PlacementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [coordinator, setCoordinator] = useState(null);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [pageStatistics, setPageStatistics] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [coordResponse, programsResponse, recruitersResponse, statsResponse, contactResponse] = await Promise.all([
        placementsAPI.getCoordinator(),
        placementsAPI.getTrainingPrograms(),
        placementsAPI.getRecruiters(),
        placementsAPI.getPageStatistics(),
        placementsAPI.getContactInfo()
      ]);

      if (coordResponse.success && coordResponse.data) {
        setCoordinator(coordResponse.data);
      }

      if (programsResponse.success) {
        setTrainingPrograms(programsResponse.data);
      }

      if (recruitersResponse.success) {
        setRecruiters(recruitersResponse.data);
      }

      if (statsResponse.success) {
        setPageStatistics(statsResponse.data);
      }

      if (contactResponse.success) {
        setContactInfo(contactResponse.data);
      }
    } catch (error) {
      console.error('Error fetching placements page data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse features
  const parseFeatures = (features) => {
    if (!features) return [];
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch (e) {
        return [];
      }
    }
    return features;
  };

  // Helper to get bg color class
  const getBgColorClass = (colorName) => {
    const colorMap = {
      'bg-crimson': 'bg-crimson',
      'bg-gold': 'bg-gold',
      'bg-slate': 'bg-slate'
    };
    return colorMap[colorName] || 'bg-crimson';
  };

  // Separate contact info by type
  const studentContacts = contactInfo.filter(c => c.contact_type === 'students');
  const recruiterContacts = contactInfo.filter(c => c.contact_type === 'recruiters');

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Training & Placements"
        subtitle="Career Development | Industry Partnerships | Professional Growth"
        imageSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Placement Coordinator Message */}
        <section>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              <p className="text-gray-500 mt-4">Loading coordinator information...</p>
            </div>
          ) : coordinator ? (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-center">
                <div className="bg-slate-50 p-6 rounded-lg text-center">
                  {coordinator.photo_url ? (
                    <img
                      src={coordinator.photo_url}
                      alt={coordinator.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-user-tie text-white text-3xl"></i>
                    </div>
                  )}
                  <h4 className="font-bold text-slate">{coordinator.name}</h4>
                  <p className="text-sm text-gray-500">{coordinator.title}</p>
                  {coordinator.email && (
                    <p className="text-xs text-gray-400 mt-2">
                      <i className="fas fa-envelope mr-1"></i>
                      {coordinator.email}
                    </p>
                  )}
                  {coordinator.phone && (
                    <p className="text-xs text-gray-400">
                      <i className="fas fa-phone mr-1"></i>
                      {coordinator.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate">{coordinator.message_title}</h2>
                  <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: coordinator.message_paragraph_1 }}></div>
                  {coordinator.message_paragraph_2 && (
                    <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: coordinator.message_paragraph_2 }}></div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
              <p className="text-center text-gray-500">No coordinator information available.</p>
            </div>
          )}
        </section>

        {/* Career Guidance & Capacity Building */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Career Guidance & Capacity Building</h2>
            <p className="text-gray-500">Comprehensive programs designed to enhance employability and career readiness.</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              <p className="text-gray-500 mt-4">Loading training programs...</p>
            </div>
          ) : trainingPrograms.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trainingPrograms.map((program) => {
                const features = parseFeatures(program.features);
                const bgColorClass = getBgColorClass(program.icon_bg_color);

                return (
                  <div key={program.id} className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
                    <div className={`w-12 h-12 ${bgColorClass} rounded-lg flex items-center justify-center mb-4`}>
                      <i className={`${program.icon} text-white`}></i>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2 sm:mb-3">{program.program_name}</h3>
                    {program.description && (
                      <div className="text-gray-500 text-sm mb-2" dangerouslySetInnerHTML={{ __html: program.description }}></div>
                    )}
                    {features.length > 0 && (
                      <ul className="text-gray-600 text-sm sm:text-base space-y-1">
                        {features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No training programs available.</p>
          )}
        </section>

        {/* Our Recruiters */}
        <section>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Our Recruiters</h2>
            <p className="text-gray-500">Leading organizations that regularly recruit from our campus.</p>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
                <p className="text-gray-500 mt-4">Loading recruiters...</p>
              </div>
            ) : recruiters.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {recruiters.map((recruiter) => (
                    <div key={recruiter.id} className="text-center group">
                      {recruiter.logo_url ? (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-crimson transition duration-300 overflow-hidden">
                          <img
                            src={recruiter.logo_url}
                            alt={recruiter.company_name}
                            className="max-w-full max-h-full object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-crimson group-hover:text-white transition duration-300">
                          <i className={`${recruiter.logo_icon} text-3xl text-gray-400 group-hover:text-white`}></i>
                        </div>
                      )}
                      <h4 className="font-semibold text-slate text-sm">{recruiter.company_name}</h4>
                      {recruiter.sector && (
                        <p className="text-xs text-gray-400">{recruiter.sector}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">No recruiters available.</p>
            )}

            {/* Placement Statistics */}
            {pageStatistics.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <h4 className="font-semibold text-blue-800 mb-2">Placement Statistics</h4>
                <div className={`grid sm:grid-cols-1 md:grid-cols-${Math.min(pageStatistics.length, 4)} gap-4 text-blue-700`}>
                  {pageStatistics.map((stat) => (
                    <div key={stat.id}>
                      <div className="text-2xl font-bold">{stat.stat_value}</div>
                      <div className="text-sm">{stat.stat_label}</div>
                      {stat.description && (
                        <div className="text-xs text-blue-600 mt-1" dangerouslySetInnerHTML={{ __html: stat.description }}></div>
                      )}
                      {stat.academic_year && (
                        <div className="text-xs text-blue-500">{stat.academic_year}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contact Information */}
        <section>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              <p className="text-gray-500 mt-4">Loading contact information...</p>
            </div>
          ) : contactInfo.length > 0 ? (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-4 sm:mb-6">Get in Touch</h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* For Students */}
                {studentContacts.length > 0 && (
                  <div>
                    {studentContacts.map((contact) => (
                      <div key={contact.id}>
                        <h4 className="font-semibold text-slate mb-4">{contact.title}</h4>
                        <div className="space-y-3 text-gray-600">
                          {contact.email && (
                            <p><i className="fas fa-envelope text-crimson mr-2"></i> {contact.email}</p>
                          )}
                          {contact.phone && (
                            <p><i className="fas fa-phone text-crimson mr-2"></i> {contact.phone}</p>
                          )}
                          {contact.office_hours && (
                            <p><i className="fas fa-clock text-crimson mr-2"></i> {contact.office_hours}</p>
                          )}
                          {contact.additional_info && (
                            <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: contact.additional_info }}></div>
                          )}
                          {contact.button_text && contact.button_link && (
                            <a
                              href={contact.button_link}
                              className="inline-block bg-crimson hover:bg-red-800 text-white font-bold py-2 px-4 sm:px-6 rounded transition text-sm sm:text-base"
                            >
                              {contact.button_text}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* For Recruiters */}
                {recruiterContacts.length > 0 && (
                  <div>
                    {recruiterContacts.map((contact) => (
                      <div key={contact.id}>
                        <h4 className="font-semibold text-slate mb-4">{contact.title}</h4>
                        <div className="space-y-3 text-gray-600">
                          {contact.email && (
                            <p><i className="fas fa-envelope text-crimson mr-2"></i> {contact.email}</p>
                          )}
                          {contact.phone && (
                            <p><i className="fas fa-phone text-crimson mr-2"></i> {contact.phone}</p>
                          )}
                          {contact.office_hours && (
                            <p><i className="fas fa-clock text-crimson mr-2"></i> {contact.office_hours}</p>
                          )}
                          {contact.additional_info && (
                            <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: contact.additional_info }}></div>
                          )}
                          {contact.button_text && contact.button_link && (
                            <button
                              onClick={() => window.open(contact.button_link, '_blank')}
                              className="bg-crimson hover:bg-red-800 text-white font-bold py-2 px-4 sm:px-6 rounded transition text-sm sm:text-base"
                            >
                              <i className="fas fa-download mr-2"></i>
                              {contact.button_text}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

      </div>
    </div>
  );
};

export default PlacementsPage;
